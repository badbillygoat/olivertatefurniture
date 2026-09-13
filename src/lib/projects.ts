// Shared helpers for reading portfolio projects out of the top-level Projects/ folder.
//
//   Projects/Current Portfolio/<project-name>/  → homepage, /portfolio and /archive
//   Projects/Archive/<project-name>/            → /archive only
//
// Each project folder holds one .md file plus that project's photos.
import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

// Every photo in every project folder, keyed by path, e.g.
// "/Projects/Current Portfolio/foot-stool-2/foot-stool-2-1.jpg"
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/Projects/*/*/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP}',
  { eager: true }
);

/** The project's folder, e.g. "Projects/Archive/pizza-peel" */
function folderOf(project: Project): string {
  const path = (project.filePath ?? '').replace(/\\/g, '/');
  return path.slice(0, path.lastIndexOf('/'));
}

/** True when the project's folder is inside Projects/Archive/ */
export function isArchived(project: Project): boolean {
  return folderOf(project).startsWith('Projects/Archive/');
}

/** Projects from Current Portfolio only, unless includeArchived is set. */
export async function getProjects(
  { includeArchived = false }: { includeArchived?: boolean } = {}
): Promise<Project[]> {
  const projects = await getCollection('projects');
  return includeArchived ? projects : projects.filter((p) => !isArchived(p));
}

/** The project's photos, sorted by filename (the first one is the cover). */
export function getProjectImages(project: Project): ImageMetadata[] {
  const prefix = `/${folderOf(project)}/`;
  return Object.entries(imageModules)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, mod]) => mod.default);
}
