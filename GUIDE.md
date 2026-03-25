# Eka Research — Owner's Guide

Everything you need to know to work on this project without forgetting anything.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start local dev server at `localhost:3000` |
| `npm run build` | Build for production |
| `npm run lint` | Check for code errors |
| `npm run gen:assets` | Regenerate all icons from `public/logo.png` |

---

## Before Going Live — Checklist

- [ ] Replace `SITE_URL` in `lib/constants.ts` with your real domain
- [ ] Run `npm run gen:assets` one final time with the final logo
- [ ] Add your Google Search Console verification token in `app/layout.tsx` (see the `verification` field)
- [ ] Add your social media URLs to `components/JsonLd.tsx` (the `sameAs` array)
- [ ] Add your Twitter/X handle in `app/layout.tsx` (the `creator` field)
- [ ] Submit `yourdomain.com/sitemap.xml` to Google Search Console
- [ ] Test your OG image at [opengraph.xyz](https://www.opengraph.xyz)
- [ ] Run a Lighthouse audit in Chrome DevTools — aim for 90+ on all scores

---

## Design System

### Brand Colors

| Name | Hex | CSS Variable | Use it for |
|---|---|---|---|
| Navy | `#162161` | `--color-brand-navy` | Primary, surfaces, buttons |
| Gold | `#FEC73E` | `--color-brand-gold` | Accents only — CTAs, highlights, one hero element |

**Rule:** Gold is an accent. Never use it as a large background. Use it to draw the eye to one important thing per section.

### Fonts

| Role | Font | CSS Variable |
|---|---|---|
| Headings (H1–H4) | Helvetica Neue / Helvetica (system font) | `--font-heading` |
| Body text, UI | DM Sans | `--font-body` |

Always use the CSS variables, never hardcode font names.

### Dark / Light Mode

- Default is **dark mode**
- Mode is stored in `localStorage` under the key `eka-theme`
- Toggle by changing `data-theme` attribute on `<html>` to `"light"` or `"dark"`
- All colors switch automatically — you never need to write separate dark/light styles if you use CSS variables from `styles/tokens.css`

### Spacing Scale

Use `--space-{n}` variables. Never write arbitrary pixel values.

```
--space-1  =  4px      --space-8  = 32px
--space-2  =  8px      --space-10 = 40px
--space-3  = 12px      --space-12 = 48px
--space-4  = 16px      --space-16 = 64px
--space-6  = 24px      --space-20 = 80px
```

---

## File Structure — Where Everything Lives

```
app/
  layout.tsx          ← Root layout. Fonts, theme script, metadata
  page.tsx            ← Home page
  opengraph-image.tsx ← Auto-generates the OG image (social share card)
  icon.png            ← Favicon (auto-generated, do not edit manually)
  sitemap.ts          ← /sitemap.xml — add new pages here
  robots.ts           ← /robots.txt
  manifest.ts         ← /manifest.webmanifest (PWA)

styles/
  tokens.css          ← ALL colors, fonts, spacing, shadows. Change here first.
  reset.css           ← Base reset styles

components/
  ui/                 ← Small reusable pieces (Button, Badge, etc.)
  layout/             ← Nav and Footer
  sections/           ← Page sections (Hero, About, Team, etc.)
  JsonLd.tsx          ← Structured data for Google (Organization + WebSite schema)

lib/
  constants.ts        ← Site name, URL, nav links, all data. Change here.
  seo.ts              ← buildMetadata() — used by every page for SEO
  utils.ts            ← cn() helper for combining CSS classes

public/
  logo.png            ← Master logo. Source for all generated icons.
  icons/              ← Generated icons (PWA, Apple). Run gen:assets to update.

scripts/
  generate-assets.mjs ← Generates all icons from logo.png
```

---

## Adding a New Page

**1. Create the page file**
```
app/research/page.tsx
```

**2. Add metadata at the top using `buildMetadata`**
```tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Research",
  description: "Explore Eka Research's ongoing space science research programs.",
  path: "/research",
});

export default function ResearchPage() {
  return <main>...</main>;
}
```

**3. Add it to the sitemap**

Open `app/sitemap.ts` and add an entry to the `staticRoutes` array:
```ts
{
  url: `${SITE_URL}/research`,
  lastModified: now,
  changeFrequency: "weekly",
  priority: 0.9,
},
```

**4. Add it to the nav**

Open `lib/constants.ts` and add to `NAV_LINKS`:
```ts
{ label: "Research", href: "/research" },
```

That's it. SEO is handled automatically.

---

## Updating Site Info

Everything is in one place: **`lib/constants.ts`**

- Site name, tagline, description → `SITE` object
- Email → `SITE.email`
- Nav links → `NAV_LINKS`
- Domain → `SITE_URL`

---

## If You Update the Logo

1. Replace `public/logo.png` with the new file (keep the same filename)
2. Run `npm run gen:assets`
3. Check `app/icon.png` (favicon), `public/icons/icon-192.png`, `public/icons/icon-512.png` look correct

The OG image (`opengraph-image.tsx`) also uses `logo.png` and will update automatically on next build.

---

## SEO — What's Already Set Up

| What | Where | Notes |
|---|---|---|
| Page title + description | `app/layout.tsx` + each page's `buildMetadata()` | Template: `Page Name \| Eka Research` |
| Open Graph (social cards) | `app/opengraph-image.tsx` | Auto-served at `/opengraph-image` |
| Twitter card | `app/layout.tsx` | Inherits OG image |
| Sitemap | `app/sitemap.ts` → `/sitemap.xml` | Add pages here manually |
| Robots | `app/robots.ts` → `/robots.txt` | Allows all, blocks `/api/` |
| PWA manifest | `app/manifest.ts` → `/manifest.webmanifest` | Enables "Add to Home Screen" |
| Structured data | `components/JsonLd.tsx` | Organization + WebSite schema |
| Security headers | `next.config.ts` | Improves trust signals |
| Canonical URLs | `buildMetadata()` | Auto-set per page |

---

## Adding Structured Data for Content Pages

When you build these pages, add the right schema:

| Page type | Schema to add |
|---|---|
| Publications / papers | `Article` |
| Events | `Event` |
| Team members | `Person` |

Create a component like `components/JsonLd.tsx` for each and drop it into the page. Ask Claude to do this — just say "add structured data to the publications page."

---

## Useful Links

- [Google Search Console](https://search.google.com/search-console) — submit sitemap, monitor indexing
- [Google Rich Results Test](https://search.google.com/test/rich-results) — test your structured data
- [OG Image Preview](https://www.opengraph.xyz) — see how your link looks on social media
- [PageSpeed Insights](https://pagespeed.web.dev) — test performance + SEO score
- [Schema.org](https://schema.org) — reference for structured data types
