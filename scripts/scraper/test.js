#!/usr/bin/env node

/**
 * Web Scraper Test Suite
 * Tests core scraping functions on real-world URLs
 */

import { logger } from "./utils/logger.js";
import {
  launchBrowser,
  createStealthPage,
  navigateToUrl,
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

// Test URLs (popular directory sites)
const TEST_URLS = [
  {
    id: "test-1",
    name: "Product Hunt",
    url: "https://www.producthunt.com",
    categories: ["Startup", "Product"],
    pricingType: "free",
  },
  {
    id: "test-2",
    name: "Indie Hackers",
    url: "https://www.indiehackers.com",
    categories: ["Startup", "Community"],
    pricingType: "free",
  },
];

/**
 * Run test on a single URL
 */
async function testUrl(browser, testSite) {
  console.log("\n" + "=".repeat(80));
  console.log(`Testing: ${testSite.name}`);
  console.log("=".repeat(80) + "\n");

  let page = null;

  try {
    // Create page
    page = await createStealthPage(browser);

    // Navigate
    await navigateToUrl(page, testSite.url);

    console.log("✓ Page loaded successfully\n");

    // Test homepage scraping
    console.log("Testing homepage scraper...");
    const homepageData = await scrapeHomepage(page, testSite.url);

    console.log("✓ Homepage data extracted:");
    console.log(`  - Title: ${homepageData.metadata.title}`);
    console.log(
      `  - Description: ${homepageData.metadata.description?.slice(0, 100)}...`,
    );
    console.log(`  - Hero: ${homepageData.hero.heading}`);
    console.log(`  - Features: ${homepageData.features.length} found`);
    console.log(
      `  - Pricing: ${homepageData.pricing.found ? "Found" : "Not found"}\n`,
    );

    // Test link analysis
    console.log("Testing link analyzer...");
    const linkData = await analyzeLinks(page, testSite.url);

    console.log("✓ Links analyzed:");
    console.log(`  - Total links: ${linkData.stats.total}`);
    console.log(`  - Dofollow: ${linkData.stats.dofollow}`);
    console.log(`  - Nofollow: ${linkData.stats.nofollow}`);
    console.log(`  - External dofollow: ${linkData.stats.externalDofollow}`);
    console.log(`  - Submission links: ${linkData.stats.submissionLinks}`);
    console.log(
      `  - Provides dofollow: ${linkData.quality.providesDofollow ? "Yes ✓" : "No ✗"}\n`,
    );

    if (linkData.quality.submissionUrls.length > 0) {
      console.log("  Submission URLs found:");
      linkData.quality.submissionUrls.slice(0, 3).forEach((url) => {
        console.log(`    - ${url}`);
      });
      console.log("");
    }

    // Test smart crawl (limited)
    console.log("Testing smart crawl...");
    const smartCrawlData = await smartCrawl(
      browser,
      page,
      testSite.url,
      scrapeHomepage,
      analyzeLinks,
    );

    console.log("✓ Smart crawl complete:");
    console.log(`  - Additional pages found: ${smartCrawlData.pages.length}`);
    console.log(
      `  - Submission URLs found: ${smartCrawlData.submissionUrls.length}\n`,
    );

    // Compile data
    const compiledData = compileScrapedData(
      testSite,
      homepageData,
      linkData,
      smartCrawlData,
    );

    // Generate suggestions
    compiledData.curationSuggestions =
      generateCurationSuggestions(compiledData);

    console.log("Testing curation suggestions...");
    console.log("✓ Suggestions generated:");
    console.log(
      `  - Quality Score: ${compiledData.curationSuggestions.qualityScore}/100`,
    );
    console.log(
      `  - Short Description: ${compiledData.curationSuggestions.shortDescription?.slice(0, 100)}...`,
    );
    console.log(
      `  - Suggested Categories: ${compiledData.curationSuggestions.categories.join(", ")}`,
    );
    console.log(
      `  - Link Quality: ${compiledData.curationSuggestions.linkQuality}`,
    );
    console.log(
      `  - Key Features: ${compiledData.curationSuggestions.keyFeatures.length} found\n`,
    );

    // Close page
    await closePage(page);

    console.log("✅ All tests passed for " + testSite.name);

    return {
      success: true,
      site: testSite.name,
      qualityScore: compiledData.curationSuggestions.qualityScore,
    };
  } catch (error) {
    console.error(`❌ Test failed for ${testSite.name}:`, error.message);

    if (page && !page.isClosed()) {
      await closePage(page);
    }

    return {
      success: false,
      site: testSite.name,
      error: error.message,
    };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║          Awesome Directories Web Scraper Test Suite           ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );

  try {
    // Launch browser
    console.log("\n🚀 Launching browser...");
    const browser = await launchBrowser();
    console.log("✓ Browser ready\n");

    // Run tests
    const results = [];

    for (const testSite of TEST_URLS) {
      const result = await testUrl(browser, testSite);
      results.push(result);

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Close browser
    await closeBrowser();

    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("Test Summary");
    console.log("=".repeat(80) + "\n");

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ${failed > 0 ? "❌" : ""}`);
    console.log("");

    results.forEach((result) => {
      if (result.success) {
        console.log(
          `✅ ${result.site} - Quality Score: ${result.qualityScore}/100`,
        );
      } else {
        console.log(`❌ ${result.site} - Error: ${result.error}`);
      }
    });

    console.log("\n");

    if (failed === 0) {
      console.log("🎉 All tests passed!\n");
      process.exit(0);
    } else {
      console.log(
        "⚠️  Some tests failed. Check the output above for details.\n",
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
