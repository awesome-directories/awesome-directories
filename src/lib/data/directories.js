import { supabase } from '../supabase-client.js';
import log from '../logger.js';

/**
 * Fetch all active directories from Supabase
 * This is used at build time to generate static pages
 */
export async function getAllDirectories() {
  log.info('Fetching all active directories from Supabase...');
  if (!supabase) {
    log.warn('Supabase client not configured. Returning empty directories list.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('is_active', true)
      .order('domain_rating', { ascending: false, nullsFirst: false })
      .order('helpful_count', { ascending: false });

    if (error) {
      log.error('Error fetching directories:', error);
      throw error;
    }

    log.info(`Fetched ${data.length} active directories.`);

    return data || [];
  } catch (err) {
    log.error('Failed to fetch directories:', err);
    return [];
  }
}

/**
 * Get a single directory by slug
 */
export async function getDirectoryBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      log.error(`Error fetching directory with slug "${slug}":`, error);
      return null;
    }

    return data;
  } catch (err) {
    log.error(`Failed to fetch directory with slug "${slug}":`, err);
    return null;
  }
}

/**
 * Get directory statistics
 */
export async function getDirectoryStats() {
  try {
    const directories = await getAllDirectories();

    const stats = {
      total: directories.length,
      byPricing: {},
      byCategory: {},
      averageDR: 0,
      dofollowCount: 0,
    };

    let totalDR = 0;
    let drCount = 0;

    directories.forEach((dir) => {
      // Pricing stats
      const pricing = dir.pricing_type || 'Unknown';
      stats.byPricing[pricing] = (stats.byPricing[pricing] || 0) + 1;

      // Category stats
      if (dir.categories && Array.isArray(dir.categories)) {
        dir.categories.forEach((cat) => {
          stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
        });
      }

      // DR stats
      if (dir.domain_rating) {
        totalDR += dir.domain_rating;
        drCount++;
      }

      // Dofollow count
      if (dir.is_dofollow) {
        stats.dofollowCount++;
      }
    });

    stats.averageDR = drCount > 0 ? Math.round(totalDR / drCount) : 0;

    return stats;
  } catch (err) {
    log.error('Failed to get directory stats:', err);
    return null;
  }
}

/**
 * Get unique categories from all directories
 */
export function getUniqueCategories(directories) {
  const cats = new Set();
  directories.forEach((dir) => {
    if (dir.categories && Array.isArray(dir.categories)) {
      dir.categories.forEach((cat) => cats.add(cat));
    }
  });
  return ['All', ...Array.from(cats).sort()];
}
