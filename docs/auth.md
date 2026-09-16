# Authentication & Authorization Standards

## 1. Purpose
Clerk is the sole and exclusive authentication, identity, and session management system for the LinkShortenerProject application. This layer governs identity lifecycle, route-level access protection (securing `/dashboard`), authenticated landing page redirection (routing logged-in users away from `/` to `/dashboard`), and modal-driven sign-in/sign-up interactions. It also establishes the verified `userId` contract required by downstream database operations to ensure strict multi-tenant isolation.

## 2. Invariants
1. **Exclusive Auth Solution**: All authentication, session tokens, and user credentials must be handled strictly by `@clerk/nextjs`. Implementing custom auth endpoints, credentials tables, JWT generation, session cookies, or secondary auth libraries (e.g., NextAuth, Auth.js, Supabase Auth) is strictly prohibited.
2. **Modal-Only Sign-In & Sign-Up**: All client-side sign-in and sign-up flows must be launched as modals. Always set `mode="modal"` on `<SignInButton>` and `<SignUpButton>`. Never navigate users away to dedicated, full-page sign-in or sign-up routes.
3. **Protected `/dashboard` Route**: The `/dashboard` route (and any sub-routes under `/dashboard/*`) is strictly private. Unauthenticated requests must be intercepted before render and denied access.
4. **Authenticated Homepage Redirection**: Any authenticated user accessing the root landing page (`/`) must be immediately redirected to `/dashboard`. Logged-in users must not remain on the public marketing homepage.
5. **Strictly Await Clerk Server APIs**: In Next.js 16 and Clerk v7+, `auth()` and `currentUser()` from `@clerk/nextjs/server` are asynchronous. Calling `auth()` synchronously is forbidden:
   ```ts
   const { userId } = await auth();
   ```
6. **Next.js 16 Edge Proxy Convention**: Edge route protection and request-level redirects must be implemented inside `proxy.ts` using `clerkMiddleware()` (the Next.js 16 standard replacing deprecated `middleware.ts`).
7. **Mandatory Tenant Isolation via Auth**: Every server action, API route, and server component performing data queries or mutations must derive identity directly from `await auth()`. User-owned database records must be filtered by `eq(table.userId, userId)`. Never accept client-supplied `userId` parameters.
8. **Zero Secret Leakage**: The `CLERK_SECRET_KEY` must never be exposed to client bundles, logged to console, or prefixed with `NEXT_PUBLIC_`.

## 3. Directory Structure
```
linkshortenerproject/
├── proxy.ts                         # Edge route guard & redirect logic using clerkMiddleware
├── app/
│   ├── layout.tsx                   # Global root layout containing <ClerkProvider>
│   ├── page.tsx                     # Public homepage: redirects auth users to /dashboard; modal triggers
│   └── dashboard/
│       ├── layout.tsx               # Defense-in-depth auth protection for all dashboard routes
│       └── page.tsx                 # Protected dashboard view with tenant-isolated data
├── db/
│   └── schema.ts                    # Database schema enforcing userId foreign keys / ownership
└── docs/
    └── auth.md                      # This specification
```

## 4. Code Examples

### Edge Route Guard & Redirection (`proxy.ts`)
Next.js 16 uses `proxy.ts` at the repository root. Use `clerkMiddleware` with `createRouteMatcher` to handle both `/dashboard` route protection and authenticated `/` redirection at the edge:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicHomepage = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect authenticated users trying to access homepage to /dashboard
  if (userId && isPublicHomepage(req)) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Enforce authentication for protected dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
```

### Homepage with Modal Auth Triggers (`app/page.tsx`)
Server-side redirection check alongside client modal triggers:

```tsx
import { auth } from "@clerk/nextjs/server";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <p className="text-lg font-semibold tracking-tight">LinkShortenerProject</p>
        
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950">
                Sign up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16">
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Shorten links, grow reach, and keep your branded flow simple.
        </h1>
        <div>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-950">
                Get Started
              </button>
            </SignUpButton>
          </Show>
        </div>
      </main>
    </div>
  );
}
```

### Defense-in-Depth Protected Page & Scoped Query (`app/dashboard/page.tsx`)

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Tenant-isolated query: user can only see their own records
  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, userId));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>
      <p className="text-zinc-500">Managing {userLinks.length} shortened links.</p>
    </div>
  );
}
```

## 5. Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
| :--- | :--- | :--- |
| Introducing custom credentials or third-party auth (NextAuth, Supabase, JWT) | Creates split session state, breaks Clerk tenant isolation, and violates architectural invariants | Use `@clerk/nextjs` exclusively for all authentication needs |
| Calling `auth()` synchronously (`const { userId } = auth()`) | Runtime error in Next.js 16 / React 19 due to async request API contracts | Always `await auth()` |
| Omitting `mode="modal"` on `<SignInButton>` or `<SignUpButton>` | Redirects users to full-page sign-in / sign-up routes, violating modal UX requirement | Always specify `mode="modal"` on Clerk auth triggers |
| Allowing logged-in users to remain on `/` | Causes confusion and suboptimal user workflow | Redirect authenticated users from `/` directly to `/dashboard` in `proxy.ts` and `app/page.tsx` |
| Relying solely on client checks for `/dashboard` | Exposes dashboard shell and sensitive component trees to unauthorized requests | Enforce route protection at the edge in `proxy.ts` via `auth.protect()` and verify `userId` in Server Components |
| Unscoped database queries without `userId` | Critical security flaw: enables cross-tenant data leaks and unauthorized record manipulation | Always filter user-owned tables with `eq(table.userId, userId)` obtained from `await auth()` |
| Using deprecated `middleware.ts` for route guards | In Next.js 16, `middleware.ts` is deprecated in favor of `proxy.ts` | Place all edge middleware logic inside `proxy.ts` |
| Exposing `CLERK_SECRET_KEY` via `NEXT_PUBLIC_` prefix | Leaks administrator credentials to the browser | Keep secret keys server-only and reference only in server-side contexts |
