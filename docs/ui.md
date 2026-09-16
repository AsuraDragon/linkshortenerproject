# UI & Component Standards

## 1. Purpose
This document establishes the user interface and component architecture standards for the LinkShortenerProject application. ALL visual and interactive UI elements must strictly and exclusively use Shadcn UI components. Creating bespoke, custom UI primitives or using raw HTML elements styled with ad-hoc classes is strictly prohibited. Shadcn UI (configured with `base-nova` style, `@base-ui/react` primitives, Tailwind CSS v4, and Lucide icons) serves as the singular design system and component contract across the entire codebase.

## 2. Invariants
1. **Mandatory Shadcn UI Exclusivity**: Every UI element (buttons, inputs, cards, dialogs, dropdowns, tables, badges, tabs, etc.) must be an official Shadcn UI component located in `@/components/ui/`. Writing custom UI primitives or raw styled HTML elements (e.g., `<button className="...">`, `<input className="...">`, custom modal overlays) is strictly forbidden.
2. **Zero Custom Primitives Policy**: Never build custom primitive components when a Shadcn equivalent exists. If a component is needed and not yet present in `components/ui/`, install it immediately via the official CLI:
   ```bash
   npx shadcn@latest add <component-name>
   ```
3. **Strict Import Path Alias**: All UI primitives must be imported using the `@/components/ui/<component>` alias:
   ```tsx
   import { Button } from "@/components/ui/button";
   ```
4. **Composition Over Re-invention**: Build feature views, forms, and compound layouts by composing existing `@/components/ui/*` primitives. Never write one-off containers or custom replacements for layout primitives like `Card`, `Separator`, or `Dialog`.
5. **Seamless Third-Party & Auth Integration**: When integrating with third-party components (such as Clerk's `<SignInButton>` or Next.js `<Link>`), compose them with Shadcn components (e.g. wrapping `<Button>` inside `<SignInButton mode="modal">`). Never revert to native unstyled or raw HTML tags.
6. **Semantic Design Tokens**: Components and layout wrappers must strictly use semantic color tokens defined in `app/globals.css` (e.g., `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`). Hardcoded hex colors, arbitrary RGB values, or ad-hoc Tailwind palette overrides (e.g., `text-blue-500`) are prohibited.
7. **Standard Iconography**: All icons must be imported from `lucide-react` to maintain consistent visual weight, stroke width, and alignment.
8. **Base-UI Accessibility & Types**: All components use `@base-ui/react` primitives under the hood via the `base-nova` style. Do not bypass or strip accessibility props (`aria-*`, `role`, focus rings) provided by Shadcn primitives.

## 3. Directory Structure
```
linkshortenerproject/
├── components.json             # Shadcn configuration (base-nova style, Lucide icons, alias map)
├── components/
│   └── ui/                     # Shadcn UI primitives (ONLY allowable location for UI primitives)
│       ├── button.tsx          # Button primitive
│       ├── card.tsx            # Card primitive (installed via CLI)
│       ├── input.tsx           # Input primitive (installed via CLI)
│       └── ...                 # Future primitives added strictly via `npx shadcn@latest add`
├── lib/
│   └── utils.ts                # Standard cn utility export for class merging
├── app/
│   └── globals.css             # Tailwind CSS v4 theme variables and semantic design tokens
└── docs/
    ├── auth.md                 # Authentication standards
    └── ui.md                   # This UI component specification
```

## 4. Code Examples

### Installing New Primitives
Always check if a primitive is available before attempting to render it. Install missing primitives using the Shadcn CLI:

```bash
# Example: Adding Card, Input, Label, and Dialog primitives
npx shadcn@latest add card input label dialog
```

### Composing Shadcn Components with Clerk Auth Buttons
Compose Shadcn UI `<Button>` inside Clerk triggers without raw `<button>` elements:

```tsx
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </SignInButton>

      <SignUpButton mode="modal">
        <Button size="sm">
          Sign Up
        </Button>
      </SignUpButton>
    </div>
  );
}
```

### Feature Component Composed Exclusively of Shadcn UI Primitives
Example of a link-creation card composed entirely of Shadcn components:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2 } from "lucide-react";

export function CreateLinkForm() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="size-5 text-primary" />
          Shorten a URL
        </CardTitle>
        <CardDescription>
          Enter your destination URL to generate a branded short link.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Destination URL</Label>
          <Input id="url" placeholder="https://example.com/very-long-path" type="url" required />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button type="submit">Create Short Link</Button>
      </CardFooter>
    </Card>
  );
}
```

## 5. Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
| :--- | :--- | :--- |
| Creating custom raw elements (e.g. `<button className="px-4 py-2 bg-black...">`) | Violates design consistency, breaks theme tokens, and fragments UI maintenance | Always import and use `<Button>` from `@/components/ui/button` |
| Hand-rolling custom input fields, modals, or dropdowns | Reinvents accessibility, keyboard navigation, and aria contracts already solved in Shadcn | Run `npx shadcn@latest add <component>` and use the official primitive |
| Creating bespoke folders like `components/custom/` for basic controls | Violates the single-source-of-truth UI structure | Install and use official primitives inside `@/components/ui/` |
| Hardcoded colors (e.g., `bg-[#0f172a]`, `text-gray-900`) | Breaks Dark/Light mode switching and ignores project design tokens | Use semantic tokens: `bg-card`, `text-foreground`, `text-muted-foreground` |
| Importing primitives directly from `@base-ui/react` in app pages | Skips the styled, theme-aware Shadcn wrapper layer | Import exclusively from `@/components/ui/<primitive>` |
| Removing or altering `data-slot` attributes in `components/ui/*` | Breaks CSS selector styling, compound variants, and animations configured in `base-nova` | Preserve all `data-slot` markers and default variant structures |
