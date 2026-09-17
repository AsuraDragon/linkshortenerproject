"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { links, type Link } from "@/db/schema";

const createLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .url({ message: "Please enter a valid URL (e.g. https://example.com)" }),
  code: z
    .string()
    .trim()
    .max(20, { message: "Custom code cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_-]*$/, {
      message: "Custom code can only contain letters, numbers, hyphens, and underscores",
    })
    .optional()
    .or(z.literal("")),
});

const updateLinkSchema = z.object({
  id: z.string().uuid({ message: "Invalid link identifier" }),
  url: z
    .string()
    .trim()
    .url({ message: "Please enter a valid URL (e.g. https://example.com)" }),
  code: z
    .string()
    .trim()
    .min(1, { message: "Short code cannot be empty" })
    .max(20, { message: "Custom code cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Custom code can only contain letters, numbers, hyphens, and underscores",
    }),
});

const deleteLinkSchema = z.object({
  id: z.string().uuid({ message: "Invalid link identifier" }),
});

function generateRandomCode(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export type CreateLinkResult =
  | { success: true; link: Link }
  | { success: false; error: string };

export type UpdateLinkResult =
  | { success: true; link: Link }
  | { success: false; error: string };

export type DeleteLinkResult =
  | { success: true }
  | { success: false; error: string };

export async function createLinkAction(
  prevState: CreateLinkResult | null,
  formData: FormData
): Promise<CreateLinkResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  let rawUrl = (formData.get("url") as string) || "";
  const rawCode = (formData.get("code") as string) || "";

  // Auto-prepend https:// if protocol is omitted for better UX
  if (rawUrl && !/^https?:\/\//i.test(rawUrl)) {
    rawUrl = `https://${rawUrl}`;
  }

  const validation = createLinkSchema.safeParse({
    url: rawUrl,
    code: rawCode,
  });

  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || "Invalid input";
    return { success: false, error: errorMessage };
  }

  let finalCode = validation.data.code?.trim() || "";

  if (finalCode) {
    // Check if custom code is already taken
    const existing = await db
      .select({ id: links.id })
      .from(links)
      .where(eq(links.code, finalCode))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: `The short code "/${finalCode}" is already taken. Please choose another.`,
      };
    }
  } else {
    // Auto-generate a collision-free code
    let attempts = 0;
    let isUnique = false;

    while (!isUnique && attempts < 5) {
      const candidate = generateRandomCode(6);
      const existing = await db
        .select({ id: links.id })
        .from(links)
        .where(eq(links.code, candidate))
        .limit(1);

      if (existing.length === 0) {
        finalCode = candidate;
        isUnique = true;
      }
      attempts++;
    }

    if (!finalCode || !isUnique) {
      return {
        success: false,
        error: "Failed to generate a unique short code. Please try again with a custom code.",
      };
    }
  }

  try {
    const [newLink] = await db
      .insert(links)
      .values({
        userId,
        url: validation.data.url,
        code: finalCode,
      })
      .returning();

    revalidatePath("/dashboard");
    return { success: true, link: newLink };
  } catch (err: unknown) {
    console.error("Failed to insert link:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving your link. Please try again.",
    };
  }
}

export async function updateLinkAction(
  prevState: UpdateLinkResult | null,
  formData: FormData
): Promise<UpdateLinkResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const linkId = (formData.get("id") as string) || "";
  let rawUrl = (formData.get("url") as string) || "";
  const rawCode = (formData.get("code") as string) || "";

  if (rawUrl && !/^https?:\/\//i.test(rawUrl)) {
    rawUrl = `https://${rawUrl}`;
  }

  const validation = updateLinkSchema.safeParse({
    id: linkId,
    url: rawUrl,
    code: rawCode,
  });

  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || "Invalid input";
    return { success: false, error: errorMessage };
  }

  const { id, url, code } = validation.data;

  // Strict tenant-isolated query
  const [existingLink] = await db
    .select()
    .from(links)
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .limit(1);

  if (!existingLink) {
    return { success: false, error: "Link not found or access denied." };
  }

  // If code changed, check collision with other links
  if (code !== existingLink.code) {
    const collision = await db
      .select({ id: links.id })
      .from(links)
      .where(and(eq(links.code, code), ne(links.id, id)))
      .limit(1);

    if (collision.length > 0) {
      return {
        success: false,
        error: `The short code "/${code}" is already taken by another link.`,
      };
    }
  }

  try {
    const [updatedLink] = await db
      .update(links)
      .set({
        url,
        code,
        updatedAt: new Date(),
      })
      .where(and(eq(links.id, id), eq(links.userId, userId)))
      .returning();

    revalidatePath("/dashboard");
    return { success: true, link: updatedLink };
  } catch (err: unknown) {
    console.error("Failed to update link:", err);
    return {
      success: false,
      error: "An unexpected error occurred while updating your link. Please try again.",
    };
  }
}

export async function deleteLinkAction(
  linkId: string
): Promise<DeleteLinkResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const validation = deleteLinkSchema.safeParse({ id: linkId });
  if (!validation.success) {
    return { success: false, error: "Invalid link ID provided." };
  }

  try {
    const deleted = await db
      .delete(links)
      .where(and(eq(links.id, validation.data.id), eq(links.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return { success: false, error: "Link not found or access denied." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete link:", err);
    return {
      success: false,
      error: "An unexpected error occurred while deleting the link. Please try again.",
    };
  }
}
