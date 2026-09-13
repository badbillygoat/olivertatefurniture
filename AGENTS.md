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
npm run build    # production build to /dist (plain `astro build`, no type check)
npm run preview  # serve the built /dist
npx astro check  # TypeScript / .astro type check (not part of build)
```

Run `npm run build` before considering any non-trivial change done — it
catches broken content-collection schemas, bad image paths, and the
duplicate-folder check that `dev` mode skips. It does **not** type-check;
run `npx astro check` separately when you've touched component scripts.

## Orientation map

| Path | What it is |
|---|---|
| `src/styles/global.css` | The entire design system: CSS custom properties, reset, typography, buttons, `.section`/`.container` utilities. Start here before writing new component styles. |
| `src/layouts/BaseLayout.astro` | Root `<html>` shell — head/meta/OG tags, Google Analytics, Header + Footer, `heroLayout`/`hideFooter`/`rawTitle`/`noindex` props. |
| `src/components/Header.astro` | Sticky nav. Has a transparent/overlay mode (`transparent` prop) used only on the homepage hero, with scroll-triggered solid background. |
| `src/components/Footer.astro` | Dark footer, nav links. |
| `Projects/Current Portfolio/<slug>/` | One folder per live portfolio piece: its `.md` file + all its photos. Shown on the homepage, `/portfolio`, and `/archive`. |
| `Projects/Archive/<slug>/` | Same layout, for archived pieces — shown only on `/archive`. **Folder location is the only archive switch** (there is no `archived` frontmatter field). |
| `src/content/config.ts` | Zod schema for portfolio projects — **the source of truth** for what fields a project can have. Also defines the `glob` loader that reads `Projects/`, sets each entry's id to its folder name, and fails the build on a misplaced `.md` or duplicate folder name. |
| `src/lib/projects.ts` | The only place that knows the folder layout: `getProjects({ includeArchived })`, `isArchived(project)`, `getProjectImages(project)`. Use these instead of `getCollection('projects')` or your own `import.meta.glob` so archived pieces can't leak onto public pages. |
| `src/pages/index.astro` | Homepage — animated "zipper" bezier-curve hero built from SVG clip-paths, splitting project photos left/right. Non-trivial geometry code; read the comments before touching it. |
| `src/components/ProjectGallery.astro` | Shared project grid with client-side category filter + a "Side-by-Side" pop-up (desktop) / direct navigation to the detail page (mobile; width > 900px opens the pop-up). Used by both the portfolio and archive pages. Pop-up photos are resized at build time with `getImage` (1600px stage, 200px thumbnails) and passed to the client script as `projectData`. |
| `src/pages/portfolio/index.astro` | Portfolio page — renders `ProjectGallery` with Current Portfolio projects only. |
| `src/pages/archive.astro` | **Unlinked** archive page (`/archive`) — every project, archived ones tagged "Archived". `noindex` via BaseLayout. Intentionally not linked from the header/footer/anywhere; don't add a link. |
| `src/pages/portfolio/[slug].astro` | Individual project detail page — same "Side-by-Side" look as the pop-up (stacks on phones), with the markdown body rendered below it when present. |
| `src/pages/about.astro` | Bio page. |
| `src/pages/contact.astro` | Contact form — client-side validated, submits to **Formspree** (`https://formspree.io/f/xdawnyoo`). No server code in this repo. |
| `public/logos/` | Brand SVG logos (regular + bold weight, black + white). |
| `public/CNAME` | GitHub Pages custom domain config — don't remove. |

## Content model — adding/editing a portfolio project

1. Create a folder `Projects/Current Portfolio/<slug>/`. The folder name
   **is** the URL (`/portfolio/<slug>`) — lowercase-with-hyphens, and must be
   unique across both `Current Portfolio` and `Archive`.
2. Put the photos in that folder, named so the desired cover image sorts
   first alphabetically (e.g. `<slug>-1.jpg`, `-2.jpg`, ...). Extensions
   picked up: jpg/jpeg/png/webp/avif/gif (plus upper-case JPG/JPEG/PNG/WEBP).
3. Put exactly one `.md` file in that folder (conventionally `<slug>.md`;
   the filename itself doesn't matter) with frontmatter per
   `src/content/config.ts`:
   - Required: `title`, `description`, `date`, `category`
   - Optional: `coverAlt`, `heroImage`, `heroSide`, `featured`, `available`,
     `order`, `materials[]`, `dimensions`, `duration`
   - **Archiving** = moving the whole project folder from
     `Projects/Current Portfolio/` to `Projects/Archive/` (and back to
     un-archive). The URL doesn't change. Archived pieces drop off the
     homepage hero and `/portfolio`, stay on `/archive` with an "Archived"
     tag, and keep their detail page (back link points to `/archive`).
   - The build fails with a readable message if a `.md` sits anywhere other
     than `Projects/<Current Portfolio|Archive>/<slug>/`, or if two folders
     share a name. The duplicate check is skipped in `npm run dev` (it would
     false-positive while folders are being moved), so run `npm run build`.
   - `category` can be a comma-separated list (e.g. `Tables, Decor`) — the
     portfolio filter bar derives its tabs from whatever categories exist
     across all projects, so no separate enum to update.
   - `heroSide` (`'major'` | `'minor'`) pins which side of the home-page hero
     the piece's image loops on — `major` = the larger/wide (left) panel,
     `minor` = the smaller/narrow (right) panel. Unset pieces alternate. Wired
     in `src/pages/index.astro` (the `panelSide` assignment).
   - There is **no `coverImage` field** — photos are auto-discovered from
     the project's own folder (`getProjectImages` in `src/lib/projects.ts`),
     sorted by filename; the first is the cover. If a project has no photos,
     the grid card renders a blank placeholder square and the detail page
     shows only the details column, instead of failing the build.
4. Markdown body (optional) is rendered as a prose block below the
   photo/details frame on the detail page. It is not shown in the pop-up.

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
- Translucent tints of the brown are allowed for subtle fills and hairlines
  (e.g. `rgba(79, 65, 51, 0.045)` photo-stage wash, `0.26` spec-row rules,
  `0.72` muted labels) — they're shades of the accent, not a third color.
- **Project detail views use the "Side-by-Side" layout** (owner's choice,
  Sept 2026): a 1px brown frame; a photo stage of **fixed size** with
  photos fitted inside (`object-fit: contain`) so the frame never resizes
  between tall and wide shots — the owner specifically disliked the old
  resizing, so don't make the stage size follow the photo; square bordered
  arrows; a thumbnail strip; and a details column split off by a 1px brown
  line. The pop-up sits on a cream veil, not a dark overlay. The pop-up
  (`ProjectGallery.astro`) and the detail page (`[slug].astro`) share this
  look but not code — change both together.

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
