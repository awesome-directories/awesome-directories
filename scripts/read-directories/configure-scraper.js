const fs = require("fs");
const { ApifyClient } = require("apify-client");

/**
 * Directory Scraper Configuration Helper
 *
 * This script helps configure and run the Puppeteer scraper for directory enrichment.
 * Add your directory URLs below and run with: node configure-scraper.js
 */

// Configuration
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || "YOUR_API_TOKEN_HERE";

// read the ./directories.txt (one domain per line)
var DIRECTORY_URLS = [];
var directoryFilePath = "./directories.txt";
if (fs.existsSync(directoryFilePath)) {
  const fileContent = fs.readFileSync(directoryFilePath, "utf-8");
  const lines = fileContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length > 0) {
    console.log(
      `✅ Loaded ${lines.length} directories from ${directoryFilePath}`,
    );
    DIRECTORY_URLS = lines.map((domain) => ({ url: `https://${domain}` }));
  } else {
    console.log(`⚠️  No directories found in ${directoryFilePath}`);
  }
} else {
  console.log(
    `⚠️  Directory file ${directoryFilePath} not found. Using hardcoded URLs.`,
  );
}

// List of directory URLs to scrape
const DEFAULT_DIRECTORY_URLS = [
  { url: "https://www.producthunt.com", name: "Product Hunt" },
  { url: "https://news.ycombinator.com", name: "Hacker News" },
  { url: "https://www.betalist.com", name: "BetaList" },
  { url: "https://www.startupbuffer.com", name: "Startup Buffer" },
  { url: "https://www.killerstartups.com", name: "Killer Startups" },
  // Add more directories here
];

if (DIRECTORY_URLS.length === 0) {
  DIRECTORY_URLS = DEFAULT_DIRECTORY_URLS;
}

/**
 * Generate Apify input configuration
 */
function generateApifyInput() {
  const baseConfig = JSON.parse(
    fs.readFileSync("./apify-complete-input.json", "utf8"),
  );

  const pageFunction = fs.readFileSync("./pageFunction.js", "utf8");
  baseConfig.pageFunction = pageFunction;

  const excludesJson = fs.readFileSync("./excludes.json", "utf8");
  baseConfig.excludes = JSON.parse(excludesJson);

  // Update start URLs
  baseConfig.startUrls = DIRECTORY_URLS.map((dir) => ({
    url: dir.url,
    userData: {
      label: "DIRECTORY_HOME",
      // depth: 2,
      directoryName: dir?.name,
    },
  }));

  return baseConfig;
}

/**
 * Run the scraper via Apify API
 */
async function runScraper() {
  if (APIFY_API_TOKEN === "YOUR_API_TOKEN_HERE") {
    console.error(
      "❌ Please set your APIFY_API_TOKEN environment variable or update the script",
    );
    console.log(
      "   Get your token from: https://console.apify.com/account/integrations",
    );
    return;
  }

  const client = new ApifyClient({ token: APIFY_API_TOKEN });
  const input = generateApifyInput();

  console.log("🚀 Starting Puppeteer Scraper...");
  console.log(`📋 Scraping ${DIRECTORY_URLS.length} directories`);

  try {
    const run = await client.actor("apify/puppeteer-scraper").call(input);

    console.log(`✅ Scraper run completed!`);
    console.log(`📊 Run ID: ${run.id}`);
    console.log(
      `🔗 View results: https://console.apify.com/actors/runs/${run.id}`,
    );
    console.log(
      `💾 Dataset: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`,
    );

    // Fetch results
    console.log("\n📥 Fetching results...");
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`\n✨ Scraped ${items.length} pages`);

    // Save results to file
    const outputFile = `directory-enrichment-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));
    console.log(`💾 Results saved to: ${outputFile}`);

    // Generate summary
    generateSummary(items);
  } catch (error) {
    console.error("❌ Error running scraper:", error.message);
  }
}

/**
 * Generate summary statistics from scraped data
 */
function generateSummary(items) {
  console.log("\n📊 Summary Statistics:");
  console.log("=".repeat(50));

  const homePages = items.filter((item) => item.depth === 0);

  homePages.forEach((item) => {
    console.log(`\n🌐 ${item.directoryName || item.url}`);
    console.log(`   Pricing: ${item.pricing.model}`);
    console.log(
      `   DoFollow: ${item.seo.doFollowPercentage}% (${item.seo.doFollowLinks}/${item.seo.totalLinks})`,
    );
    console.log(
      `   External DoFollow: ${item.seo.externalDoFollowPercentage}% (${item.seo.externalDoFollow}/${item.seo.externalLinks})`,
    );
    console.log(
      `   Has Submission Form: ${item.submission.hasSubmissionForm ? "✅" : "❌"}`,
    );
    console.log(
      `   Features: ${
        Object.entries(item.features)
          .filter(([k, v]) => v && k !== "estimatedListings")
          .map(([k]) => k)
          .join(", ") || "None detected"
      }`,
    );
  });

  console.log("\n" + "=".repeat(50));
}

/**
 * Save configuration only (don't run scraper)
 */
function saveConfigOnly() {
  const input = generateApifyInput();
  const outputFile = "apify-configured-input.json";
  fs.writeFileSync(outputFile, JSON.stringify(input, null, 2));
  console.log(`✅ Configuration saved to: ${outputFile}`);
  console.log(
    "📝 You can now upload this file to Apify Console or use it with the API",
  );
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--config-only")) {
    saveConfigOnly();
  } else if (args.includes("--run")) {
    runScraper();
  } else {
    console.log("Directory Scraper Configuration Helper");
    console.log("");
    console.log("Usage:");
    console.log(
      "  node configure-scraper.js --config-only  # Generate config file only",
    );
    console.log(
      "  node configure-scraper.js --run          # Run scraper via API",
    );
    console.log("");
    console.log("Before running:");
    console.log("  1. Set APIFY_API_TOKEN environment variable");
    console.log("  2. Update DIRECTORY_URLS in the script");
    console.log("  3. Adjust SCRAPER_CONFIG as needed");
  }
}

module.exports = { generateApifyInput, runScraper, saveConfigOnly };
