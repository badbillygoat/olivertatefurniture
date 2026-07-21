# AGENTS.md — Oliver Tate Furniture Website

Orientation doc for AI agents (and future-you) working in this repo. Read this
before making changes. **Keep it current** — see "Maintaining this file" below.

## What this is

Marketing/portfolio site for **Oliver Tate Furniture**, a bespoke furniture
maker (Oliver Richman, Cleveland, Ohio — curves-in-nature design, no
cabinetry/restoration/millwork). Astro static site, deployed to GitHub Pages
at olivertatefurniture.com. The site owner is the woodworker, not a
developer — explain things in plain terms, avoid jargon in commit-visible
copy, and don't assume they'll debug anything themselves.

## Stack

- **Astro 5**, static output, no UI framework (no React/Vue/etc.)
- Plain CSS with custom properties — no Tailwind, no CSS-in-JS
- Content Collections for portfolio project data (`src/content/`)
- TypeScript for `.astro` component scripts (checked via `@astrojs/check`)
- Deploys via GitHub Actions (`.github/workflows/deploy.yml`) on push to `main`
- Node v24 / npm v11 on the dev machine (Windows)

## Commands

```
npm run dev      # local dev server, http://localhost:4321
npm run build    # production build to /dist (also runs astro check)
npm run preview  # serve the built /dist
```

Run `npm run build` before considering any non-trivial change done — it
catches broken content-collection schemas, bad image paths, and type errors
that `dev` mode won't always surface.

## Orientation map

| Path | What it is |
|---|---|
| `src/styles/global.css` | The entire design system: CSS custom properties, reset, typography, buttons, `.section`/`.container` utilities. Start here before writing new component styles. |
| `src/layouts/BaseLayout.astro` | Root `<html>` shell — head/meta/OG tags, Google Analytics, Header + Footer, `heroLayout`/`hideFooter`/`rawTitle` props. |
| `src/components/Header.astro` | Sticky nav. Has a transparent/overlay mode (`transparent` prop) used only on the homepage hero, with scroll-triggered solid background. |
| `src/components/Footer.astro` | Dark footer, nav links. |
| `src/content/config.ts` | Zod schema for portfolio projects — **the source of truth** for what fields a project can have. |
| `src/content/projects/*.md` | One markdown file per portfolio piece. Frontmatter = data, body = optional long-form description rendered on the detail page. |
| `src/assets/images/<slug>/` | Photos for the project whose content file is `<slug>.md`. Folder name must exactly match the content collection slug (the filename minus `.md`). |
| `src/pages/index.astro` | Homepage — animated "zipper" bezier-curve hero built from SVG clip-paths, splitting project photos left/right. Non-trivial geometry code; read the comments before touching it. |
| `src/pages/portfolio/index.astro` | Portfolio grid with client-side category filter + a modal lightbox (desktop) / direct navigation (mobile, width > 900px is the breakpoint). |
| `src/pages/portfolio/[slug].astro` | Individual project detail page with its own image gallery/carousel. |
| `src/pages/about.astro` | Bio page. |
| `src/pages/contact.astro` | Contact form — client-side validated, submits to **Formspree** (`https://formspree.io/f/xdawnyoo`). No server code in this repo. |
| `public/logos/` | Brand SVG logos (regular + bold weight, black + white). |
| `public/CNAME` | GitHub Pages custom domain config — don't remove. |

## Content model — adding/editing a portfolio project

1. Add photos to `src/assets/images/<slug>/`, named so the desired cover
   image sorts first alphabetically (e.g. `<slug>-1.jpg`, `-2.jpg`, ...), or
   set `order`/rely on filename sort as needed.
2. Add `src/content/projects/<slug>.md` with frontmatter per
   `src/content/config.ts`:
   - Required: `title`, `description`, `date`, `category`
   - Optional: `coverAlt`, `heroImage`, `heroSide`, `featured`, `available`,
     `order`, `materials[]`, `dimensions`, `duration`
   - `category` can be a comma-separated list (e.g. `Tables, Decor`) — the
     portfolio filter bar derives its tabs from whatever categories exist
     across all projects, so no separate enum to update.
   - `heroSide` (`'major'` | `'minor'`) pins which side of the home-page hero
     the piece's image loops on — `major` = the larger/wide (left) panel,
     `minor` = the smaller/narrow (right) panel. Unset pieces alternate. Wired
     in `src/pages/index.astro` (the `panelSide` assignment).
   - There is **no `coverImage` field** — cover/gallery images are
     auto-discovered from the `src/assets/images/<slug>/` folder by slug
     match. If a project has no image folder, the card renders a blank
     placeholder square instead of failing the build.
3. Markdown body (optional) becomes the "long description" prose block on
   the detail page.

## Design system rules

All of this lives in `src/styles/global.css` (`:root` custom properties) —
treat it as authoritative over any written description, including this one,
since it's the kind of thing that gets tweaked without a doc update.

- **Two-color palette**: `--color-bg` (near-white, `#fffffa`) and
  `--color-accent` (warm dark brown, `#4f4133`). Pure black was retired —
  `--color-black` now resolves to the same brown. A pile of semantic aliases
  (`--color-wood`, `--color-charcoal`, `--color-text-muted`, etc.) exist for
  backwards compatibility with older component code — they all resolve back
  to one of the two real colors. Don't introduce a third color; if you need
  a new semantic name, alias it to bg or accent.
- **Sharp corners everywhere** — `--radius-sm/md/lg` are all `0`.
- Three font families, each with one job: `--font-logo` (Plus Jakarta Sans,
  hero wordmark only), `--font-serif` (Cormorant Garamond, headings/display),
  `--font-sans` (Jost, body/UI text). Don't add a fourth.
- Spacing follows an 8-pt scale (`--space-1` … `--space-24`); reuse these
  tokens instead of hardcoding pixel/rem values in component `<style>` blocks.

## Etiquette for agents working in this repo

- **Scope your edits.** Touch only the files the task requires. This is a
  small, hand-tuned site — sweeping refactors or "while I'm in here" cleanups
  create diffs the non-developer owner can't review and are more likely to
  introduce visual regressions than fix anything.
- **Don't invent new design tokens, colors, or fonts** without asking — the
  two-color/three-font system is a deliberate constraint, not an oversight.
- **Verify before trusting old context.** If you're working from a memory
  file, a prior conversation summary, or your own assumptions about "how the
  homepage works," check the actual current source first — this project has
  been reworked significantly more than once (e.g. the homepage went from a
  slideshow to the current zipper-curve layout; the color system went from
  three colors to two; the content schema dropped `coverImage` in favor of
  folder-based image discovery). Stale descriptions look plausible and are
  wrong.
- **Ask when the request is ambiguous** — especially anything touching
  copy/branding decisions, pricing/lead-time language on the contact page, or
  which photos represent a project. Guessing wrong here ships incorrect
  business information to real customers.
- **Test visually, not just `npm run build`.** For any layout/CSS/interaction
  change, run `npm run dev` and actually look at the page (desktop + mobile
  width, since several components — header nav, portfolio card-vs-modal click
  behavior — branch on viewport width). A clean build does not mean the page
  looks right.
- **Treat `.astro/` and `dist/` as disposable build output** (both
  gitignored) — never hand-edit generated files there.
- **Confirm before anything that touches deployment or DNS**: changes to
  `.github/workflows/deploy.yml`, `public/CNAME`, or `astro.config.mjs`'s
  `site` field affect the live domain.
- **Update this file** when you change something a future agent would need
  to know to avoid re-discovering it the hard way: a new page/section, a
  schema field added/removed, a new external service wired in (forms,
  analytics, etc.), or a structural rework (like the homepage rewrite
  mentioned above). Keep entries factual and current — delete or correct
  anything this file says that's no longer true rather than layering a
  correction on top.
