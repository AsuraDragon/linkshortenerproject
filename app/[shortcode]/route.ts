import { notFound } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { links } from "@/db/schema";

interface RouteParams {
  params: Promise<{
    shortcode: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  // Next.js 16 breaking change: params must be awaited
  const { shortcode } = await params;

  if (!shortcode) {
    notFound();
  }

  const [link] = await db
    .select({ url: links.url })
    .from(links)
    .where(eq(links.code, shortcode))
    .limit(1);

  if (!link || !link.url) {
    notFound();
  }

  const destination =
    link.url.startsWith("http://") || link.url.startsWith("https://")
      ? link.url
      : `https://${link.url}`;

  return NextResponse.redirect(new URL(destination), 307);
}
