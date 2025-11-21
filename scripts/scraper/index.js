#!/usr/bin/env node

/**
 * Awesome Directories Web Scraper
 * Main CLI entry point
 */

import { parseArgs } from "node:util";
import { logger } from "./utils/logger.js";
import { config } from "./config.js";
import {
  fetchDirectories,
  getFilterStats,
  getAvailableCategories,
} from "./data-fetcher.js";
import {
  launchBrowser,
  createStealthPage,
  navigateToUrl,
  takeScreenshot,
  closeBrowser,
  closePage,
} from "./browser.js";
import { scrapeHomepage } from "./scrapers/homepage.js";
import { analyzeLinks, findSubmissionUrl } from "./scrapers/links.js";
import { smartCrawl } from "./scrapers/smart-crawl.js";
import {
  compileScrapedData,
  generateCurationSuggestions,
} from "./scrapers/content.js";
import { saveDirectoryJson, saveSummaryJson } from "./output/json.js";
import {
  saveDirectoryMarkdown,
  saveSummaryMarkdown,
} from "./output/markdown.js";
import { saveCsv } from "./output/csv.js";
import { humanDelay } from "./utils/retry.js";
import path from "path";
import fs from "fs/promises";

/**
 * Parse CLI arguments
 */
function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      // Data source
      source: { type: "string", short: "s", default: "pending" },
      status: { type: "string", default: "pending" },

      // Filters
      categories: { type: "string" },
      "pricing-type": { type: "string" },
      "min-dr": { type: "string" },
      "max-dr": { type: "string" },
      dofollow: { type: "boolean" },

      // Pagination
      limit: { type: "string", short: "l", default: "10" },
      offset: { type: "string", default: "0" },

      // Scraping options
      proxy: { type: "boolean", default: false },
      "smart-crawl": { type: "boolean", default: true },
      screenshots: { type: "boolean", default: true },

      // Output options
      output: {
        type: "string",
        short: "o",
        default: "./scripts/scraper-outputs",
      },

      // Help
      help: { type: "boolean", short: "h" },
    },
  });

  return values;
}

/**
 * Display help message
 */
async function showHelp() {
  const stats = await getFilterStats();
  const categories = await getAvailableCategories();

  console.log(`
Awesome Directories Web Scraper
================================

Usage: bun run scrape [options]

Data Source Options:
  -s, --source <type>       Data source: 'pending' or 'directories' (default: pending)
  --status <status>         Status filter for pending: 'pending', 'approved', 'rejected', 'all' (default: pending)

Filter Options:
  --categories <cats>       Filter by categories (comma-separated)
  --pricing-type <type>     Filter by pricing: 'free', 'paid', 'freemium'
  --min-dr <number>         Minimum domain rating
  --max-dr <number>         Maximum domain rating
  --dofollow               Only directories with dofollow links

Pagination:
  -l, --limit <number>      Number of directories to scrape (default: 10)
  --offset <number>         Pagination offset (default: 0)

Scraping Options:
  --proxy                  Enable Apify residential proxy (requires APIFY_PROXY_PASSWORD)
  --smart-crawl            Enable smart crawling of additional pages (default: true)
  --screenshots            Take screenshots of pages (default: true)

Output Options:
  -o, --output <dir>       Output directory (default: ./scripts/scraper-outputs)

Other:
  -h, --help               Show this help message

Environment Variables:
  VITE_SUPABASE_URL        Supabase project URL (required)
  VITE_SUPABASE_ANON_KEY   Supabase anonymous key (required)
  APIFY_PROXY_PASSWORD          Apify API token for proxy (optional)
  USE_PROXY                Set to 'true' to enable proxy (optional)
  CHROME_PATH              Custom Chrome executable path (optional)
  LOG_LEVEL                Log level: DEBUG, INFO, WARN, ERROR (default: INFO)

Database Statistics:
  Total Pending Directories: ${stats.totalPending}
  Total Active Directories: ${stats.totalDirectories}

Available Categories:
  ${categories.slice(0, 10).join(", ")}${categories.length > 10 ? `, ... (${categories.length - 10} more)` : ""}

Examples:
  # Scrape 5 pending directories
  bun run scrape --limit 5

  # Scrape approved directories with dofollow links
  bun run scrape --status approved --dofollow --limit 20

  # Scrape directories in specific categories
  bun run scrape --categories "SaaS,Marketing" --limit 10

  # Use proxy for scraping
  bun run scrape --proxy --limit 5

  # Scrape from main directories table
  bun run scrape --source directories --min-dr 50 --limit 10
`);
}

/**
 * Initialize output directories
 */
async function initializeOutputDirs() {
  const dirs = [
    config.output.baseDir,
    config.output.dataDir,
    config.output.reportsDir,
    config.output.screenshotsDir,
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Scrape a single directory
 */
async function scrapeDirectory(browser, directory, options) {
  const { smartCrawlEnabled, screenshotsEnabled } = options;

  logger.info(`Starting scrape: ${directory.name}`);

  let page = null;

  try {
    // Create stealth page
    page = await createStealthPage(browser);

    // Navigate to homepage
    await navigateToUrl(page, directory.url);

    // Take screenshot if enabled
    if (screenshotsEnabled) {
      const screenshotPath = path.join(
        config.output.screenshotsDir,
        `${directory.id}.png`,
      );
      await takeScreenshot(page, screenshotPath);
    }

    // Scrape homepage data
    const homepageData = await scrapeHomepage(page, directory.url);

    // Analyze links
    const linkData = await analyzeLinks(page, directory.url);

    // Smart crawl additional pages
    let smartCrawlData = null;
    if (smartCrawlEnabled) {
      smartCrawlData = await smartCrawl(
        browser,
        page,
        directory.url,
        scrapeHomepage,
        analyzeLinks,
      );
    }

    // Compile all data
    const compiledData = compileScrapedData(
      directory,
      homepageData,
      linkData,
      smartCrawlData,
    );

    // Generate curation suggestions
    compiledData.curationSuggestions =
      generateCurationSuggestions(compiledData);

    // Close page
    await closePage(page);

    logger.success(`Completed scrape: ${directory.name}`, {
      qualityScore: compiledData.curationSuggestions.qualityScore,
    });

    return compiledData;
  } catch (error) {
    logger.error(`Failed to scrape: ${directory.name}`, {
      error: error.message,
    });

    if (page && !page.isClosed()) {
      await closePage(page);
    }

    return {
      directory,
      error: error.message,
      scrapedAt: new Date().toISOString(),
    };
  }
}

/**
 * Main scraping workflow
 */
async function main() {
  const args = parseCliArgs();

  if (args.help) {
    await showHelp();
    process.exit(0);
  }

  logger.info("Awesome Directories Web Scraper");
  logger.info("================================");
  logger.info("");

  try {
    // Initialize output directories
    await initializeOutputDirs();

    // Parse filters
    const filters = {
      source: args.source,
      status: args.status,
      categories: args.categories
        ? args.categories.split(",").map((c) => c.trim())
        : null,
      pricingType: args["pricing-type"] || null,
      minDr: args["min-dr"] ? parseInt(args["min-dr"]) : null,
      maxDr: args["max-dr"] ? parseInt(args["max-dr"]) : null,
      isDofollow: args.dofollow || null,
      limit: parseInt(args.limit),
      offset: parseInt(args.offset),
    };

    // Update config with CLI options
    config.proxy.enabled = args.proxy;
    config.output.baseDir = args.output;
    config.output.dataDir = path.join(args.output, "data");
    config.output.reportsDir = path.join(args.output, "reports");
    config.output.screenshotsDir = path.join(args.output, "screenshots");

    // Fetch directories from Supabase
    logger.info("Fetching directories from database...");
    const directories = await fetchDirectories(filters);

    if (directories.length === 0) {
      logger.warn("No directories found matching filters");
      process.exit(0);
    }

    logger.info(`Found ${directories.length} directories to scrape`);
    logger.info("");

    // Launch browser
    const browser = await launchBrowser();

    // Scrape each directory
    const results = [];

    for (let i = 0; i < directories.length; i++) {
      const directory = directories[i];

      logger.progress(i + 1, directories.length, directory.name);

      const result = await scrapeDirectory(browser, directory, {
        smartCrawlEnabled: args["smart-crawl"],
        screenshotsEnabled: args.screenshots,
      });

      results.push(result);

      // Save individual outputs
      await saveDirectoryJson(result);
      await saveDirectoryMarkdown(result);

      // Human-like delay between directories
      if (i < directories.length - 1) {
        await humanDelay();
      }
    }

    // Close browser
    await closeBrowser();

    logger.info("");
    logger.info("Generating summary reports...");

    // Generate summary outputs
    await saveSummaryJson(results);
    await saveSummaryMarkdown(results);
    await saveCsv(results);

    // Final stats
    const successCount = results.filter((r) => !r.error).length;
    const errorCount = results.filter((r) => r.error).length;
    const avgQualityScore =
      results
        .filter((r) => r.curationSuggestions)
        .reduce((sum, r) => sum + r.curationSuggestions.qualityScore, 0) /
      successCount;

    logger.info("");
    logger.success("Scraping complete!");
    logger.info("");
    logger.info("Summary:");
    logger.info(`  Total: ${results.length}`);
    logger.info(`  Success: ${successCount}`);
    logger.info(`  Errors: ${errorCount}`);
    logger.info(`  Avg Quality Score: ${avgQualityScore.toFixed(1)}/100`);
    logger.info("");
    logger.info(`Output directory: ${config.output.baseDir}`);
  } catch (error) {
    logger.error("Fatal error", { error: error.message });
    console.error(error);
    process.exit(1);
  }
}

// Run CLI
main();
