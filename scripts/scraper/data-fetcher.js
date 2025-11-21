/**
 * Supabase Data Fetcher
 * Fetches directories from Supabase with CLI filter support
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from './utils/logger.js';

let supabase = null;

/**
 * Get or create Supabase client (lazy initialization)
 */
function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

/**
 * Fetch directories from Supabase based on filters
 * @param {Object} filters - Filter options from CLI
 * @returns {Promise<Array>} - Array of directories to scrape
 */
export async function fetchDirectories(filters = {}) {
  const {
    source = 'pending', // 'pending' or 'directories'
    status = 'pending',  // For pending_directories: 'pending', 'approved', 'rejected', 'all'
    categories = null,   // Array of categories to filter by
    pricingType = null,  // 'free', 'paid', 'freemium'
    minDr = null,        // Minimum domain rating
    maxDr = null,        // Maximum domain rating
    isDofollow = null,   // true/false/null
    limit = 10,          // Number of directories to fetch
    offset = 0,          // Pagination offset
    orderBy = 'submitted_at', // Order by field
    orderDirection = 'desc',  // 'asc' or 'desc'
  } = filters;

  logger.info('Fetching directories from Supabase...', {
    source,
    status,
    limit,
    offset,
  });

  try {
    let query;

    const supabase = getSupabaseClient();

    // Choose table based on source
    if (source === 'pending') {
      query = supabase
        .from('pending_directories')
        .select('*');

      // Filter by status
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
    } else if (source === 'directories') {
      query = supabase
        .from('directories')
        .select('*');

      // Filter by active status
      query = query.eq('is_active', true);
    } else {
      throw new Error(`Invalid source: ${source}. Must be 'pending' or 'directories'`);
    }

    // Apply common filters
    if (categories && categories.length > 0) {
      query = query.overlaps('categories', categories);
    }

    if (pricingType) {
      query = query.eq('pricing_type', pricingType);
    }

    if (minDr !== null) {
      query = query.gte('domain_rating', minDr);
    }

    if (maxDr !== null) {
      query = query.lte('domain_rating', maxDr);
    }

    if (isDofollow !== null) {
      query = query.eq('is_dofollow', isDofollow);
    }

    // Order and pagination
    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    logger.success(`Fetched ${data.length} directories`, {
      source,
      status,
    });

    // Transform data to scraper format
    return data.map(dir => ({
      id: dir.id,
      name: dir.name,
      url: dir.url,
      description: dir.description || '',
      categories: dir.categories || [],
      pricingType: dir.pricing_type,
      pricingAmount: dir.pricing_amount,
      domainRating: dir.domain_rating,
      isDofollow: dir.is_dofollow,
      submissionUrl: dir.submission_url,
      trafficEstimate: dir.traffic_estimate,
      source,
      status: source === 'pending' ? dir.status : 'active',
    }));
  } catch (error) {
    logger.error('Failed to fetch directories', { error: error.message });
    throw error;
  }
}

/**
 * Fetch a single directory by ID
 */
export async function fetchDirectoryById(id, source = 'pending') {
  const supabase = getSupabaseClient();
  const table = source === 'pending' ? 'pending_directories' : 'directories';

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch directory: ${error.message}`);
  }

  return data;
}

/**
 * Get available categories from database
 */
export async function getAvailableCategories() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('directories')
      .select('categories');

    if (error) {
      logger.warn('Failed to fetch categories', { error: error.message });
      return [];
    }

    const categoriesSet = new Set();
    data.forEach(dir => {
      if (dir.categories) {
        dir.categories.forEach(cat => categoriesSet.add(cat));
      }
    });

    return Array.from(categoriesSet).sort();
  } catch (error) {
    logger.warn('Failed to fetch categories', { error: error.message });
    return [];
  }
}

/**
 * Get filter statistics for CLI help
 */
export async function getFilterStats() {
  try {
    const supabase = getSupabaseClient();
    const [pendingStats, directoriesStats] = await Promise.all([
      supabase.from('pending_directories').select('status', { count: 'exact', head: true }),
      supabase.from('directories').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalPending: pendingStats.count || 0,
      totalDirectories: directoriesStats.count || 0,
    };
  } catch (error) {
    logger.warn('Failed to fetch stats', { error: error.message });
    return { totalPending: 0, totalDirectories: 0 };
  }
}

export default {
  fetchDirectories,
  fetchDirectoryById,
  getAvailableCategories,
  getFilterStats,
};
