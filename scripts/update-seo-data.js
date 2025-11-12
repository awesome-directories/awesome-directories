#!/usr/bin/env node

/**
 * Weekly SEO Data Update Script
 *
 * Hybrid approach using:
 * - DataForSEO Backlinks API for domain rank (DR-like score)
 * - Open PageRank as baseline/fallback
 * - SEO Review Tools for Moz DA (only when significant changes detected)
 *
 * This keeps costs under $100/month for ~300+ domains
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // File paths
  DIRECTORIES_FILE: path.join(__dirname, '../supabase/seeds/directories.json'),
  CACHE_FILE: path.join(__dirname, '../data/seo-cache.json'),

  // API Keys from environment variables
  DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN,
  DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD,
  OPENPAGERANK_API_KEY: process.env.OPENPAGERANK_API_KEY,
  SEOREVIEWTOOLS_API_KEY: process.env.SEOREVIEWTOOLS_API_KEY,

  // Thresholds
  SIGNIFICANT_CHANGE_THRESHOLD: 5, // Points change to trigger expensive API
  TOP_PERCENTAGE: 0.2, // Top 20% always get full check

  // Rate limiting
  BATCH_SIZE: 100,
  DELAY_MS: 1000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Load and parse JSON file
 */
async function loadJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Save JSON file
 */
async function saveJSON(filePath, data) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Fetch from Open PageRank API
 * Free tier: 100 requests/day
 */
async function fetchOpenPageRank(domains, retries = 0) {
  if (!CONFIG.OPENPAGERANK_API_KEY) {
    console.warn('⚠️  Open PageRank API key not configured');
    return {};
  }

  try {
    const response = await fetch('https://openpagerank.com/api/v1.0/getPageRank', {
      method: 'POST',
      headers: {
        'API-OPR': CONFIG.OPENPAGERANK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domains: domains.slice(0, 100), // Max 100 per request
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenPageRank API error: ${response.status}`);
    }

    const data = await response.json();
    const result = {};

    if (data.response && Array.isArray(data.response)) {
      data.response.forEach(item => {
        result[item.domain] = {
          pageRank: item.page_rank_decimal || 0,
          rank: item.rank || 0,
        };
      });
    }

    return result;
  } catch (error) {
    console.error(`❌ OpenPageRank error: ${error.message}`);

    if (retries < CONFIG.MAX_RETRIES) {
      await sleep(CONFIG.RETRY_DELAY_MS * (retries + 1));
      return fetchOpenPageRank(domains, retries + 1);
    }

    return {};
  }
}

/**
 * Fetch from DataForSEO Backlinks API
 * Provides domain rank similar to Ahrefs DR
 */
async function fetchDataForSEO(domains, retries = 0) {
  if (!CONFIG.DATAFORSEO_LOGIN || !CONFIG.DATAFORSEO_PASSWORD) {
    console.warn('⚠️  DataForSEO credentials not configured');
    return {};
  }

  try {
    const auth = Buffer.from(`${CONFIG.DATAFORSEO_LOGIN}:${CONFIG.DATAFORSEO_PASSWORD}`).toString('base64');
    const tasks = domains.map(domain => ({
      target: domain,
      limit: 1,
    }));

    const response = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tasks),
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    const result = {};

    if (data.tasks) {
      data.tasks.forEach(task => {
        if (task.result && task.result[0]) {
          const item = task.result[0];
          result[item.target] = {
            domainRank: item.rank || 0,
            backlinks: item.backlinks || 0,
            referringDomains: item.referring_domains || 0,
          };
        }
      });
    }

    return result;
  } catch (error) {
    console.error(`❌ DataForSEO error: ${error.message}`);

    if (retries < CONFIG.MAX_RETRIES) {
      await sleep(CONFIG.RETRY_DELAY_MS * (retries + 1));
      return fetchDataForSEO(domains, retries + 1);
    }

    return {};
  }
}

/**
 * Fetch from SEO Review Tools API (Moz DA)
 * Use selectively for significant changes only
 */
async function fetchSEOReviewTools(domains, retries = 0) {
  if (!CONFIG.SEOREVIEWTOOLS_API_KEY) {
    console.warn('⚠️  SEO Review Tools API key not configured');
    return {};
  }

  try {
    const response = await fetch('https://api.seoreviewtools.com/domain-authority', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.SEOREVIEWTOOLS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domains: domains,
      }),
    });

    if (!response.ok) {
      throw new Error(`SEO Review Tools API error: ${response.status}`);
    }

    const data = await response.json();
    const result = {};

    if (Array.isArray(data)) {
      data.forEach(item => {
        result[item.domain] = {
          domainAuthority: item.domain_authority || 0,
          pageAuthority: item.page_authority || 0,
          mozRank: item.moz_rank || 0,
        };
      });
    }

    return result;
  } catch (error) {
    console.error(`❌ SEO Review Tools error: ${error.message}`);

    if (retries < CONFIG.MAX_RETRIES) {
      await sleep(CONFIG.RETRY_DELAY_MS * (retries + 1));
      return fetchSEOReviewTools(domains, retries + 1);
    }

    return {};
  }
}

/**
 * Process domains in batches
 */
async function processBatch(domains, cache) {
  const results = {};

  // Step 1: Get Open PageRank data for all (cheap baseline)
  console.log(`  📊 Fetching Open PageRank for ${domains.length} domains...`);
  const oprData = await fetchOpenPageRank(domains);
  await sleep(CONFIG.DELAY_MS);

  // Step 2: Get DataForSEO data for all (primary metric)
  console.log(`  📊 Fetching DataForSEO for ${domains.length} domains...`);
  const dataforSeoData = await fetchDataForSEO(domains);
  await sleep(CONFIG.DELAY_MS);

  // Step 3: Determine which domains need expensive Moz DA check
  const domainsForMozCheck = [];

  for (const domain of domains) {
    const cachedData = cache[domain];
    const newDomainRank = dataforSeoData[domain]?.domainRank || oprData[domain]?.pageRank || 0;

    // Check if significant change or in top percentage
    if (cachedData) {
      const oldDomainRank = cachedData.domainRank || 0;
      const change = Math.abs(newDomainRank - oldDomainRank);

      if (change >= CONFIG.SIGNIFICANT_CHANGE_THRESHOLD) {
        domainsForMozCheck.push(domain);
      }
    }
  }

  // Step 4: Selectively fetch Moz DA for domains with significant changes
  let mozData = {};
  if (domainsForMozCheck.length > 0) {
    console.log(`  📊 Fetching Moz DA for ${domainsForMozCheck.length} changed domains...`);
    mozData = await fetchSEOReviewTools(domainsForMozCheck);
    await sleep(CONFIG.DELAY_MS);
  }

  // Step 5: Combine all data
  for (const domain of domains) {
    results[domain] = {
      domain,
      domainRank: dataforSeoData[domain]?.domainRank || oprData[domain]?.pageRank || 0,
      pageRank: oprData[domain]?.pageRank || 0,
      domainAuthority: mozData[domain]?.domainAuthority || cache[domain]?.domainAuthority || null,
      backlinks: dataforSeoData[domain]?.backlinks || 0,
      referringDomains: dataforSeoData[domain]?.referringDomains || 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  return results;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting weekly SEO data update...\n');

  // Load directories
  console.log('📂 Loading directories...');
  const directories = await loadJSON(CONFIG.DIRECTORIES_FILE);
  if (!directories) {
    throw new Error('Failed to load directories.json');
  }
  console.log(`✅ Loaded ${directories.length} directories\n`);

  // Load cache
  console.log('💾 Loading SEO cache...');
  const cache = await loadJSON(CONFIG.CACHE_FILE) || {};
  console.log(`✅ Loaded cache with ${Object.keys(cache).length} entries\n`);

  // Extract unique domains
  const domainMap = new Map();
  for (const dir of directories) {
    const domain = extractDomain(dir.url);
    if (domain) {
      domainMap.set(domain, dir);
    }
  }

  const uniqueDomains = Array.from(domainMap.keys());
  console.log(`🌐 Processing ${uniqueDomains.length} unique domains\n`);

  // Process in batches
  const allResults = {};
  const batches = Math.ceil(uniqueDomains.length / CONFIG.BATCH_SIZE);

  for (let i = 0; i < batches; i++) {
    const start = i * CONFIG.BATCH_SIZE;
    const end = Math.min(start + CONFIG.BATCH_SIZE, uniqueDomains.length);
    const batch = uniqueDomains.slice(start, end);

    console.log(`📦 Processing batch ${i + 1}/${batches} (${batch.length} domains)...`);
    const batchResults = await processBatch(batch, cache);
    Object.assign(allResults, batchResults);

    console.log(`✅ Completed batch ${i + 1}/${batches}\n`);

    // Rate limiting between batches
    if (i < batches - 1) {
      await sleep(CONFIG.DELAY_MS * 2);
    }
  }

  // Update directories with new SEO data
  console.log('📝 Updating directories with SEO data...');
  let updatedCount = 0;

  for (const dir of directories) {
    const domain = extractDomain(dir.url);
    if (domain && allResults[domain]) {
      const seoData = allResults[domain];

      // Update directory with new data
      dir.domain_rank = seoData.domainRank;
      dir.page_rank = seoData.pageRank;
      dir.domain_authority = seoData.domainAuthority;
      dir.backlinks = seoData.backlinks;
      dir.referring_domains = seoData.referringDomains;
      dir.seo_updated_at = seoData.lastUpdated;

      updatedCount++;
    }
  }

  console.log(`✅ Updated ${updatedCount} directories\n`);

  // Save updated directories
  console.log('💾 Saving updated directories...');
  await saveJSON(CONFIG.DIRECTORIES_FILE, directories);
  console.log(`✅ Saved to ${CONFIG.DIRECTORIES_FILE}\n`);

  // Save updated cache
  console.log('💾 Saving SEO cache...');
  await saveJSON(CONFIG.CACHE_FILE, allResults);
  console.log(`✅ Saved to ${CONFIG.CACHE_FILE}\n`);

  // Generate summary
  console.log('📊 Summary:');
  console.log(`  • Total directories: ${directories.length}`);
  console.log(`  • Unique domains: ${uniqueDomains.length}`);
  console.log(`  • Updated entries: ${updatedCount}`);
  console.log(`  • Cached entries: ${Object.keys(allResults).length}`);

  const avgDomainRank = Object.values(allResults).reduce((sum, d) => sum + d.domainRank, 0) / Object.keys(allResults).length;
  console.log(`  • Average domain rank: ${avgDomainRank.toFixed(2)}`);

  console.log('\n✨ SEO data update complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main };
