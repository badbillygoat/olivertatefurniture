import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    date:        z.coerce.date(),
    // coverImage removed — images are auto-detected from src/assets/images/{slug}/
    coverAlt:    z.string().optional(), // falls back to title if omitted
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
