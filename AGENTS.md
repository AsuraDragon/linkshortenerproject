<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# LinkShortenerProject — LLM Agent Instructions

Welcome to the **LinkShortenerProject** codebase. This file serves as the primary constitution and entry point for LLMs and autonomous agents working on this project.

To maintain modularity and high fidelity, detailed instructions, code standards, and domain-specific patterns are separated into dedicated Markdown documents inside the [`/docs`](docs/) directory.
ALWAYS refer to the relevant .md file BEFORE generating any code.

### 📚 Architecture & Domain Documentation

| Document | Scope & Key Invariants |
| :--- | :--- |
| [`docs/auth.md`](docs/auth.md) | Clerk-only auth, modal triggers (`mode="modal"`), `/dashboard` route protection, `/` redirect, and tenant isolation |

---

## ⚡ The 5 Golden Rules for Agents

1. **Async Request APIs (Next.js 16 Breaking Change):**
    - Page and layout `params` and `searchParams` are `Promise` objects. **Always `await` them:**
        ```tsx
        export default async function Page({ params }: { params: Promise<{ code: string }> }) {
            const { code } = await params;
        }
        ```
    - Always `await cookies()` and `await headers()`.

2. **Strictly Await Clerk `auth()`:**
    - In Next.js 15+, `auth()` from `@clerk/nextjs/server` is async. **Never call `auth()` without `await`**:
        ```ts
        const { userId } = await auth();
        ```
    - Never expose `CLERK_SECRET_KEY` in client-facing code or prefixes.

3. **Mandatory Tenant Isolation in Database Queries:**
    - User-owned data (links, click logs) **MUST ALWAYS** be scoped by `userId` in queries:
        ```ts
        where(and(eq(links.id, linkId), eq(links.userId, userId)));
        ```
    - Never perform unauthenticated or unscoped updates/deletes on user links.

4. **Preserve Next.js Agent Block:**
    - **DO NOT** edit, remove, or comment out the `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->` block at the top of this file. `next dev` will re-add it automatically.

5. **Type Safety & Validation:**
    - No `any` types. Ensure all server actions and form inputs are validated using **Zod**.
    - Use the `@/*` import alias consistently across the application.

---

## 🛠️ Tech Stack Snapshot

- **Framework:** Next.js 16.3.5 (App Router, Turbopack, React 19)
- **Language:** TypeScript 5 (Strict mode)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`, `tw-animate-css`)
- **UI Components:** Shadcn UI (`style: base-nova`, `@base-ui/react`, `lucide-react`)
- **Authentication:** Clerk (`@clerk/nextjs` v7, `@clerk/ui`)
- **Database:** PostgreSQL on Neon Serverless (`@neondatabase/serverless`)
- **ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `drizzle.config.ts`)

---

## 🚀 Quick Commands Reference

```bash
# Start local development server
npm run dev

# Run production build (type checking + route validation)
npm run build

# Run linting check
npm run lint

# Generate Drizzle migration files
npx drizzle-kit generate

# Push Drizzle schema directly to Neon DB
npx drizzle-kit push

# Open Drizzle Studio visual browser
npx drizzle-kit studio

# Add a new Shadcn UI component primitive
npx shadcn@latest add <component-name>
```

---

## 📋 Agent Action Checklist

When tasked with implementing a feature or fixing a bug:

- [ ] Check [`docs/`](docs/) for the domain-specific standard before editing code.
- [ ] Ensure Server Components are the default; use `"use client"` only for client interactivity.
- [ ] Confirm authentication and tenant verification are enforced where applicable.
- [ ] Verify there are no TypeScript errors or missing imports.
- [ ] Validate UI components look polished in both Light and Dark mode using semantic tokens.
