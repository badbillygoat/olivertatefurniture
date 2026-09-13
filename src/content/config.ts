import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Projects are read from the top-level Projects/ folder:
//   Projects/Current Portfolio/<project-name>/<file>.md  → shown on the site
//   Projects/Archive/<project-name>/<file>.md            → only on /archive
// The folder name becomes the web address (/portfolio/<project-name>), and
// photos in the same folder are picked up automatically (src/lib/projects.ts).
const SECTIONS = ['Current Portfolio', 'Archive'];
const seenIds = new Map<string, string>();

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './Projects',
    generateId: ({ entry }) => {
      const parts = entry.replace(/\\/g, '/').split('/');
      if (parts.length !== 3 || !SECTIONS.includes(parts[0])) {
        throw new Error(
          `"Projects/${entry}" is in the wrong place. Each project's .md file must sit in its own ` +
          `folder inside "Projects/Current Portfolio/" or "Projects/Archive/" (spelling and capitals must match).`
        );
      }
      const id = parts[1];
      // Two project folders with the same name would fight over one web address.
      // Only checked in production builds — the dev server re-reads files as they
      // move between folders, which would trip this check falsely.
      if (!import.meta.env.DEV) {
        const other = seenIds.get(id);
        if (other && other !== entry) {
          throw new Error(
            `Two projects are both named "${id}": "Projects/${other}" and "Projects/${entry}". ` +
            `Rename one of the folders, or remove the extra .md file.`
          );
        }
        seenIds.set(id, entry);
      }
      return id;
    },
  }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    date:        z.coerce.date(),
    // No coverImage field — photos are auto-detected from the project's folder.
    coverAlt:    z.string().optional(), // falls back to title if omitted
    // heroImage: filename to use on the home page slideshow (e.g. "laurens-teabox-3.jpg")
    // If omitted, the first image alphabetically is used.
    heroImage:   z.string().optional(),
    // heroSide: which side of the home-page hero the piece's image loops on.
    //   'major' = the larger/wide side, 'minor' = the smaller/narrow side.
    //   Use 'major' for your best pieces. If omitted, sides alternate automatically.
    heroSide:    z.enum(['major', 'minor']).optional(),
    category:    z.string(),
    featured:    z.boolean().default(false),
    available:   z.boolean().default(false),
    // Add "order: 1" (lower = first) to any .md file to control portfolio sort order.
    // Pieces without an order number sort after ordered pieces, then by date.
    order:       z.number().optional(),
    materials:   z.array(z.string()).optional(),
    dimensions:  z.string().optional(),
    duration:    z.string().optional(),
  }),
});

export const collections = { projects };
