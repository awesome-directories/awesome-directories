const fs = require("fs");
const { ApifyClient } = require("apify-client");

/**
 * Batch Directory Scraper
 *
 * Processes large lists of directories in batches to stay within limits
 * Supports CSV input and automatic batch management
 *
 * Usage: node batch-scraper.js <csv-file> [batch-size]
 */

class BatchScraper {
  constructor(apiToken, batchSize = 10) {
    this.client = new ApifyClient({ token: apiToken });
    this.batchSize = batchSize;
    this.results = [];
  }

  /**
   * Parse CSV file with directory URLs
   * Expected format: url,name
   */
  parseCSV(filename) {
    const content = fs.readFileSync(filename, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    // Skip header if present
    const startIdx = lines[0].toLowerCase().includes("url") ? 1 : 0;

    return lines.slice(startIdx).map((line) => {
      const [url, name] = line
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, ""));
      return { url, name: name || new URL(url).hostname };
    });
  }

  /**
   * Split directories into batches
   */
  createBatches(directories) {
    const batches = [];
    for (let i = 0; i < directories.length; i += this.batchSize) {
      batches.push(directories.slice(i, i + this.batchSize));
    }
    return batches;
  }

  /**
   * Generate Apify input for a batch
   */
  generateBatchInput(batch) {
    const baseConfig = JSON.parse(
      fs.readFileSync("./apify-complete-input.json", "utf8"),
    );

    baseConfig.startUrls = batch.map((dir) => ({
      url: dir.url,
      userData: {
        label: "DIRECTORY_HOME",
        depth: 0,
        directoryName: dir.name,
      },
    }));

    return baseConfig;
  }

  /**
   * Run a single batch
   */
  async runBatch(batchNum, totalBatches, batch) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 Running Batch ${batchNum}/${totalBatches}`);
    console.log(`📋 Processing ${batch.length} directories`);
    console.log("=".repeat(60));

    batch.forEach((dir, idx) => {
      console.log(`   ${idx + 1}. ${dir.name} (${dir.url})`);
    });

    const input = this.generateBatchInput(batch);

    try {
      const run = await this.client
        .actor("apify/puppeteer-scraper")
        .call(input);

      console.log(`\n✅ Batch ${batchNum} completed!`);
      console.log(`   Run ID: ${run.id}`);
      console.log(`   Status: ${run.status}`);

      // Fetch results
      const { items } = await this.client
        .dataset(run.defaultDatasetId)
        .listItems();
      console.log(`   Results: ${items.length} pages scraped`);

      // Store results
      this.results.push({
        batchNum,
        runId: run.id,
        datasetId: run.defaultDatasetId,
        items,
        directories: batch,
        timestamp: new Date().toISOString(),
      });

      return { success: true, items };
    } catch (error) {
      console.error(`\n❌ Batch ${batchNum} failed:`, error.message);

      this.results.push({
        batchNum,
        error: error.message,
        directories: batch,
        timestamp: new Date().toISOString(),
      });

      return { success: false, error };
    }
  }

  /**
   * Run all batches with delay between them
   */
  async runAll(directories, delayMinutes = 2) {
    const batches = this.createBatches(directories);
    const totalBatches = batches.length;

    console.log("\n" + "=".repeat(60));
    console.log("BATCH DIRECTORY SCRAPER");
    console.log("=".repeat(60));
    console.log(`📊 Total directories: ${directories.length}`);
    console.log(`📦 Batch size: ${this.batchSize}`);
    console.log(`🔢 Total batches: ${totalBatches}`);
    console.log(`⏱️  Delay between batches: ${delayMinutes} minutes`);
    console.log("=".repeat(60));

    const startTime = Date.now();

    for (let i = 0; i < batches.length; i++) {
      await this.runBatch(i + 1, totalBatches, batches[i]);

      // Delay between batches (except after last batch)
      if (i < batches.length - 1) {
        const delayMs = delayMinutes * 60 * 1000;
        console.log(
          `\n⏳ Waiting ${delayMinutes} minutes before next batch...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    this.generateFinalReport(duration);
    this.saveResults();
  }

  /**
   * Generate final report
   */
  generateFinalReport(duration) {
    console.log("\n\n" + "=".repeat(60));
    console.log("FINAL REPORT");
    console.log("=".repeat(60));

    const successfulBatches = this.results.filter((r) => r.items).length;
    const failedBatches = this.results.filter((r) => r.error).length;
    const totalPages = this.results.reduce(
      (sum, r) => sum + (r.items?.length || 0),
      0,
    );

    console.log(`\n📊 Summary:`);
    console.log(`   Total batches: ${this.results.length}`);
    console.log(`   Successful: ${successfulBatches} ✓`);
    console.log(`   Failed: ${failedBatches} ✗`);
    console.log(`   Total pages scraped: ${totalPages}`);
    console.log(`   Duration: ${duration} minutes`);

    if (failedBatches > 0) {
      console.log(`\n⚠️  Failed Batches:`);
      this.results
        .filter((r) => r.error)
        .forEach((r) => {
          console.log(`   Batch ${r.batchNum}: ${r.error}`);
          r.directories.forEach((dir) => {
            console.log(`      - ${dir.name}`);
          });
        });
    }

    console.log(`\n💰 Estimated Cost:`);
    const computeUnits = totalPages * 0.035; // Rough estimate
    const cost = computeUnits * 0.01; // $0.01 per CU
    console.log(`   Compute Units: ~${computeUnits.toFixed(1)}`);
    console.log(`   Cost: ~$${cost.toFixed(2)}`);
  }

  /**
   * Save all results to file
   */
  saveResults() {
    const timestamp = Date.now();

    // Save combined results
    const allItems = this.results
      .filter((r) => r.items)
      .flatMap((r) => r.items);

    const resultsFile = `batch-results-${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(allItems, null, 2));
    console.log(`\n💾 Combined results saved to: ${resultsFile}`);

    // Save batch metadata
    const metaFile = `batch-metadata-${timestamp}.json`;
    fs.writeFileSync(metaFile, JSON.stringify(this.results, null, 2));
    console.log(`📋 Batch metadata saved to: ${metaFile}`);

    // Generate CSV summary
    this.generateCSVSummary(timestamp);
  }

  /**
   * Generate CSV summary of all directories
   */
  generateCSVSummary(timestamp) {
    const allItems = this.results
      .filter((r) => r.items)
      .flatMap((r) => r.items)
      .filter((item) => item.depth === 0); // Only home pages

    const headers = [
      "Directory Name",
      "URL",
      "Pricing Model",
      "DoFollow %",
      "External DoFollow %",
      "Has Form",
      "SEO Score",
      "Batch Number",
      "Scraped At",
    ];

    const rows = allItems.map((item) => {
      const batch = this.results.find(
        (r) => r.items && r.items.some((i) => i.url === item.url),
      );

      return [
        item.directoryName || "",
        item.url,
        item.pricing.model,
        item.seo.doFollowPercentage,
        item.seo.externalDoFollowPercentage,
        item.submission.hasSubmissionForm ? "Yes" : "No",
        this.calculateSEOScore(item),
        batch ? batch.batchNum : "N/A",
        item.timestamp,
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell,
          )
          .join(","),
      ),
    ].join("\n");

    const csvFile = `batch-summary-${timestamp}.csv`;
    fs.writeFileSync(csvFile, csv);
    console.log(`📊 CSV summary saved to: ${csvFile}`);
  }

  /**
   * Calculate SEO score (simplified version)
   */
  calculateSEOScore(page) {
    let score = 0;
    score += parseFloat(page.seo.externalDoFollowPercentage) * 0.4;
    if (page.pricing.model === "free") score += 20;
    else if (page.pricing.model === "freemium") score += 10;
    if (page.submission.hasSubmissionForm) score += 15;
    const featureCount = Object.values(page.features).filter(
      (v) => typeof v === "boolean" && v,
    ).length;
    score += Math.min(featureCount * 3.5, 25);
    return Math.round(score);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Batch Directory Scraper");
    console.log("");
    console.log(
      "Usage: node batch-scraper.js <csv-file> [batch-size] [delay-minutes]",
    );
    console.log("");
    console.log("Arguments:");
    console.log(
      "  csv-file       CSV file with directory URLs (format: url,name)",
    );
    console.log("  batch-size     Directories per batch (default: 10)");
    console.log(
      "  delay-minutes  Minutes to wait between batches (default: 2)",
    );
    console.log("");
    console.log("Example:");
    console.log("  node batch-scraper.js directories.csv 10 5");
    console.log("");
    console.log("CSV Format:");
    console.log("  url,name");
    console.log("  https://www.producthunt.com,Product Hunt");
    console.log("  https://www.betalist.com,BetaList");
    process.exit(1);
  }

  const csvFile = args[0];
  const batchSize = parseInt(args[1]) || 10;
  const delayMinutes = parseInt(args[2]) || 2;

  const apiToken = process.env.APIFY_API_TOKEN;

  if (!apiToken) {
    console.error("❌ APIFY_API_TOKEN environment variable not set");
    console.log(
      "   Get your token from: https://console.apify.com/account/integrations",
    );
    process.exit(1);
  }

  if (!fs.existsSync(csvFile)) {
    console.error(`❌ CSV file not found: ${csvFile}`);
    process.exit(1);
  }

  (async () => {
    try {
      const scraper = new BatchScraper(apiToken, batchSize);
      const directories = scraper.parseCSV(csvFile);

      console.log(
        `\n📂 Loaded ${directories.length} directories from ${csvFile}`,
      );

      // Confirm before running
      console.log("\nPress Ctrl+C to cancel, or wait 5 seconds to start...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await scraper.runAll(directories, delayMinutes);
    } catch (error) {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    }
  })();
}

module.exports = BatchScraper;
