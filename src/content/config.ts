import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    date:        z.coerce.date(),
    // coverImage removed — images are auto-detected from src/assets/images/{slug}/
    coverAlt:    z.string().optional(), // falls back to title if omitted
    category:    z.enum(['tables', 'seating', 'storage', 'decor', 'other']),
    featured:    z.boolean().default(false),
    materials:   z.array(z.string()).optional(),
    dimensions:  z.string().optional(),
    duration:    z.string().optional(),
  }),
});

export const collections = { projects };
