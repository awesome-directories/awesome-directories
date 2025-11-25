import { supabase } from '../supabase-client.js';
import log from '../logger.js';

/**
 * Fetch all active directories from Supabase
 * This includes:
 * 1. All active directories from the main directories table
 * 2. All approved directories from pending_directories table
 * This is used at build time to generate static pages
 */
export async function getAllDirectories() {
  log.info('Fetching all active directories from Supabase...');
  if (!supabase) {
    log.warn('Supabase client not configured. Returning empty directories list.');
    return [];
  }

  try {
    // Fetch from main directories table
    const { data: mainDirectories, error: mainError } = await supabase
      .from('directories')
      .select('*')
      .eq('is_active', true)
      .order('domain_rating', { ascending: false, nullsFirst: false });

    if (mainError) {
      log.error('Error fetching main directories:', mainError);
      throw mainError;
    }

    // Fetch approved directories from pending_directories
    const { data: approvedPending, error: pendingError } = await supabase
      .from('pending_directories')
      .select('*')
      .eq('status', 'approved');

    if (pendingError) {
      log.error('Error fetching approved pending directories:', pendingError);
      // Don't throw, just use main directories
    }

    // Convert approved pending directories to the same format as main directories
    const convertedPending = (approvedPending || []).map(pending => ({
      id: pending.id,
      slug: generateSlug(pending.name, pending.id),
      name: pending.name,
      description: pending.description,
      url: pending.url,
      logo_url: pending.logo_url,
      domain_rating: pending.domain_rating,
      is_dofollow: pending.is_dofollow,
      categories: pending.categories || [],
      pricing_type: pending.pricing_type,
      pricing_amount: pending.pricing_amount,
      traffic_estimate: pending.traffic_estimate,
      avg_approval_days: pending.avg_approval_days,
      submission_url: pending.submission_url,
      is_affiliate: false,
      affiliate_url: null,
      average_rating: null,
      rating_count: 0,
      review_count: 0,
      view_count: 0,
      created_at: pending.submitted_at,
      updated_at: pending.reviewed_at || pending.submitted_at,
      is_active: true,
      added_by: pending.user_email,
      // Mark as coming from pending (useful for display)
      source: 'community',
    }));

    // Combine and deduplicate by URL (prefer main directories)
    const mainUrls = new Set((mainDirectories || []).map(d => normalizeUrl(d.url)));
    const uniquePending = convertedPending.filter(p => !mainUrls.has(normalizeUrl(p.url)));

    const allDirectories = [...(mainDirectories || []), ...uniquePending];

    // Sort by domain rating (descending), then by average rating
    allDirectories.sort((a, b) => {
      const drA = a.domain_rating || 0;
      const drB = b.domain_rating || 0;
      if (drB !== drA) return drB - drA;

      const ratingA = a.average_rating || 0;
      const ratingB = b.average_rating || 0;
      return ratingB - ratingA;
    });

    log.info(`Fetched ${mainDirectories?.length || 0} main directories and ${uniquePending.length} approved community directories.`);
    log.info(`Total: ${allDirectories.length} directories.`);

    return allDirectories;
  } catch (err) {
    log.error('Failed to fetch directories:', err);
    return [];
  }
}

/**
 * Generate a URL-friendly slug from a name
 * @param {string} name - Directory name
 * @param {string} id - Directory ID (used as fallback)
 * @returns {string} URL slug
 */
function generateSlug(name, id) {
  if (!name) return id;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  // If slug is empty or too short, use id
  if (!slug || slug.length < 2) {
    return id;
  }

  // Append part of ID to ensure uniqueness
  const idStr = (typeof id === 'string') ? id : String(id);
  return `${slug}-${idStr.substring(0, 8)}`;
}

/**
 * Normalize URL for comparison
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

/**
 * Get a single directory by slug
 */
export async function getDirectoryBySlug(slug) {
  try {
    // Try main directories first
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      log.error(`Error fetching directory with slug "${slug}":`, error);
      return null;
    }

    if (data) return data;

    // If not found, check approved pending directories
    // Since they use generated slugs, we need to search differently
    const allDirectories = await getAllDirectories();
    return allDirectories.find(d => d.slug === slug) || null;
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
      communitySubmissions: 0,
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

      // Community submissions
      if (dir.source === 'community') {
        stats.communitySubmissions++;
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
