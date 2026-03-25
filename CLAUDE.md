@AGENTS.md

# Eka Research — Project Bible

## What this is
Space research organization website. Based in Nepal.
Audience: Class 9 students through PhD/Masters researchers + admin.
Goal: Feel credible, informative, and visually compelling within 3 seconds of landing.

## Stack
- Next.js 16 (App Router) — read `node_modules/next/dist/docs/` before writing Next.js code
- React 19
- TypeScript (strict)
- Tailwind CSS v4 (utility classes only for layout/spacing — all visual design via CSS vars)
- lucide-react for icons only

## Design System

### Fonts
- Headings: `Helvetica Neue`, Helvetica, Arial — system font, no import needed, variable `--font-heading`
- Body: `DM Sans` — loaded via next/font/google, variable `--font-body`
- Never use inline font styles. Always use the CSS variables.
- Do NOT add Syne or any other Google Font for headings.

### Colors (always use CSS variables, never hardcode hex)
All tokens are in `styles/tokens.css`. The two brand colors:
- Navy: `#162161` → `--color-brand-navy`
- Gold: `#FEC73E` → `--color-brand-gold`

The gold is an ACCENT — use it sparingly (CTAs, highlights, active states, one hero element).
Never use gold as a background for large areas.

### Spacing
Use the `--space-*` scale from tokens.css. Do not invent arbitrary pixel values.

### Dark / Light mode
Tokens switch automatically via `[data-theme="dark"]` on `<html>`.
Default is dark. Never use Tailwind's `dark:` variant — use CSS vars instead.

## File & Folder Conventions
```
app/
  layout.tsx          ← root layout, fonts, theme script
  page.tsx            ← home page
  globals.css         ← imports only: tokens, reset, tailwind

styles/
  tokens.css          ← ALL CSS custom properties
  reset.css           ← custom reset (not normalize)

components/
  ui/                 ← primitives: Button, Badge, Tag, Divider
  layout/             ← Nav, Footer (used in layout.tsx)
  sections/           ← page sections: Hero, About, Team, etc.

lib/
  utils.ts            ← cn() and other small utilities
  constants.ts        ← nav links, team data, etc. (no data in components)
```

### Naming rules
- Components: PascalCase, one per file, filename = component name
- Utilities/hooks: camelCase
- CSS classes: kebab-case (BEM-ish: `block__element--modifier`)
- No default exports from `lib/` — named exports only
- No barrel files (`index.ts`) — import directly from the file

## Component rules
- No inline styles except for dynamic values (e.g., CSS var overrides from JS)
- No `className` strings longer than ~60 chars — extract to a CSS class in a `.module.css` or use a semantic class
- All data (team members, nav links, stats) lives in `lib/constants.ts`, never hardcoded in JSX
- Avoid `useEffect` for data that can be static or server-fetched

## What to avoid
- No AI-looking layouts: no generic card grids as the hero, no "Features in 3 columns" as the first thing
- No lorem ipsum — use real placeholder copy relevant to space research
- No default Tailwind color palette values (blue-500, gray-200, etc.) — only CSS vars
- No `framer-motion` unless explicitly asked
- No Prisma / database unless explicitly asked
- No `any` type in TypeScript

## SEO Architecture

### Per-page metadata
Every page exports metadata using `buildMetadata()` from `lib/seo.ts`:
```ts
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Research",
  description: "...",
  path: "/research",
});
```
Never write raw `Metadata` objects in pages — always go through `buildMetadata`.

### What's already set up (do not duplicate)
- `app/sitemap.ts` → `/sitemap.xml` — add new routes here as pages are built
- `app/robots.ts` → `/robots.txt`
- `app/manifest.ts` → `/manifest.webmanifest`
- `components/JsonLd.tsx` → Organization + WebSite schema, mounted in layout.tsx
- `next.config.ts` → security headers + image optimization

### OG images
Static OG images go in `public/og/`.
Default is `public/og/default.png` (1200×630px) — must be created before deploy.

### Site URL
`SITE_URL` in `lib/constants.ts`. Update before going live.

### Structured data for future content
- Publications → use `Article` schema in the publication page
- Events → use `Event` schema
- Team members → use `Person` schema
All JSON-LD goes in a component (like JsonLd.tsx), never inline in page JSX.

## Token efficiency hints (for Claude)
- Before editing a component, only read that component's file + tokens.css
- Data is always in lib/constants.ts — check there before asking
- Design decisions are locked in this file — do not re-ask about fonts, colors, or structure
- SEO patterns are locked above — never write raw Metadata objects in pages
