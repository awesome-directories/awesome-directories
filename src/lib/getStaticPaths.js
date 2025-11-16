import { getAllDirectories, getUniqueCategories } from './data/directories.js';
import log from './logger.js';

/**
 * Shared utility for generating static paths for directory pages
 * Used by both index.astro and [slug].astro for DRY consistency
 */
export async function getDirectoryPaths() {
  log.info('Generating static paths for directories...');

  const directories = await getAllDirectories();

  if (!directories || directories.length === 0) {
    log.warn('No directories found for static path generation');
    return [];
  }

  log.info(`Generated paths for ${directories.length} directories`);

  return directories.map((directory) => ({
    params: { slug: directory.slug },
    props: { directory }
  }));
}

/**
 * Get all directories with categories for index/home page
 */
export async function getDirectoriesWithCategories() {
  const directories = await getAllDirectories();
  const categories = getUniqueCategories(directories);

  return {
    directories,
    categories
  };
}
