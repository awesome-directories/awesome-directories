import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getAllDirectories } from "../lib/data/directories.js";
import log from "../lib/logger.js";

/**
 * Calculate comprehensive statistics from directories data
 */
async function calculateStats(directories) {
  const stats = {
    overview: {
      totalDirectories: 0,
      averageDR: 0,
      totalCategories: 0,
      freeCount: 0,
      paidCount: 0,
      freemiumCount: 0,
      totalVotes: 0,
      totalViews: 0,
    },
    categories: [],
    pricing: {
      free: 0,
      paid: 0,
      freemium: 0,
    },
    linkTypes: {
      dofollow: 0,
      nofollow: 0,
    },
    drRanges: {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0,
    },
    topByVotes: [],
    topByDR: [],
    recentAdditions: {
      last30Days: 0,
      last60Days: 0,
      last90Days: 0,
    },
  };

  if (!directories || directories.length === 0) {
    log.warn("No directories data available for stats calculation");
    return stats;
  }

  stats.overview.totalDirectories = directories.length;

  let totalDR = 0;
  let drCount = 0;
  const categoryCounts = {};
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  directories.forEach((dir) => {
    // Pricing stats
    const pricing = (dir.pricing_type || "free").toLowerCase();
    if (pricing === "free") {
      stats.pricing.free++;
      stats.overview.freeCount++;
    } else if (pricing === "paid") {
      stats.pricing.paid++;
      stats.overview.paidCount++;
    } else if (pricing === "freemium") {
      stats.pricing.freemium++;
      stats.overview.freemiumCount++;
    }

    // Category stats
    if (dir.categories && Array.isArray(dir.categories)) {
      dir.categories.forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }

    // DR stats
    if (dir.domain_rating != null && dir.domain_rating > 0) {
      totalDR += dir.domain_rating;
      drCount++;

      // DR ranges
      const dr = dir.domain_rating;
      if (dr <= 20) stats.drRanges["0-20"]++;
      else if (dr <= 40) stats.drRanges["21-40"]++;
      else if (dr <= 60) stats.drRanges["41-60"]++;
      else if (dr <= 80) stats.drRanges["61-80"]++;
      else stats.drRanges["81-100"]++;
    }

    // Link type stats
    if (dir.is_dofollow) {
      stats.linkTypes.dofollow++;
    } else {
      stats.linkTypes.nofollow++;
    }

    // Engagement stats
    if (dir.helpful_count) {
      stats.overview.totalVotes += dir.helpful_count;
    }
    if (dir.view_count) {
      stats.overview.totalViews += dir.view_count;
    }

    // Recent additions
    if (dir.created_at) {
      const createdDate = new Date(dir.created_at);
      if (createdDate >= thirtyDaysAgo) {
        stats.recentAdditions.last30Days++;
      }
      if (createdDate >= sixtyDaysAgo) {
        stats.recentAdditions.last60Days++;
      }
      if (createdDate >= ninetyDaysAgo) {
        stats.recentAdditions.last90Days++;
      }
    }
  });

  // Calculate average DR
  stats.overview.averageDR =
    drCount > 0 ? Math.round((totalDR / drCount) * 10) / 10 : 0;

  // Convert category counts to array and sort by count
  stats.categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  stats.overview.totalCategories = stats.categories.length;

  // Top directories by votes (top 10)
  stats.topByVotes = directories
    .filter((dir) => dir.helpful_count > 0)
    .sort((a, b) => b.helpful_count - a.helpful_count)
    .slice(0, 10)
    .map((dir) => ({
      name: dir.name,
      slug: dir.slug,
      url: dir.url,
      categories: dir.categories || [],
      helpful_count: dir.helpful_count || 0,
      domain_rating: dir.domain_rating,
    }));

  // Top directories by DR (top 10)
  stats.topByDR = directories
    .filter((dir) => dir.domain_rating != null && dir.domain_rating > 0)
    .sort((a, b) => b.domain_rating - a.domain_rating)
    .slice(0, 10)
    .map((dir) => ({
      name: dir.name,
      slug: dir.slug,
      url: dir.url,
      categories: dir.categories || [],
      domain_rating: dir.domain_rating,
      helpful_count: dir.helpful_count || 0,
    }));

  return stats;
}

async function saveStatsToPath(dataDir) {
  const directories = await getAllDirectories();
  const stats = await calculateStats(directories);

  await mkdir(dataDir, { recursive: true });

  const filePath = join(dataDir, "stats.json");
  await writeFile(filePath, JSON.stringify(stats, null, 2));

  log.info(`Saved stats for ${directories.length} directories to ${filePath}`);
}

export function saveStatsIntegration() {
  return {
    name: "save-stats",
    hooks: {
      "astro:server:setup": async function handleServerSetup() {
        const dataDir = join(process.cwd(), "public", "data");
        await saveStatsToPath(dataDir);
      },
      "astro:build:done": async function handleBuildDone({ dir }) {
        const dataDir = join(dir.pathname, "data");
        await saveStatsToPath(dataDir);
      },
    },
  };
}
