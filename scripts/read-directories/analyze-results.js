const fs = require("fs");

/**
 * Directory Enrichment Results Analyzer
 *
 * Analyzes scraped directory data and generates comprehensive reports
 * Usage: node analyze-results.js <results-file.json>
 */

class DirectoryAnalyzer {
  constructor(data) {
    this.data = data;
    this.homePages = data.filter((item) => item.depth === 0);
    this.allPages = data;
  }

  /**
   * Generate comprehensive summary
   */
  generateSummary() {
    console.log("\n" + "=".repeat(80));
    console.log("DIRECTORY ENRICHMENT ANALYSIS");
    console.log("=".repeat(80));

    console.log(`\n📊 Overview:`);
    console.log(`   Total directories analyzed: ${this.homePages.length}`);
    console.log(`   Total pages crawled: ${this.allPages.length}`);
    console.log(
      `   Average pages per directory: ${(this.allPages.length / this.homePages.length).toFixed(1)}`,
    );

    this.analyzePricingModels();
    this.analyzeSEOMetrics();
    this.analyzeSubmissionMethods();
    this.analyzeFeatures();
    this.generateTopDirectories();
  }

  /**
   * Analyze pricing models
   */
  analyzePricingModels() {
    console.log(`\n💰 Pricing Model Distribution:`);

    const models = {};
    this.homePages.forEach((page) => {
      const model = page.pricing.model;
      models[model] = (models[model] || 0) + 1;
    });

    Object.entries(models)
      .sort((a, b) => b[1] - a[1])
      .forEach(([model, count]) => {
        const percentage = ((count / this.homePages.length) * 100).toFixed(1);
        console.log(
          `   ${model.padEnd(12)}: ${count.toString().padStart(3)} (${percentage}%)`,
        );
      });

    // Free vs Paid breakdown
    const hasFree = this.homePages.filter((p) => p.pricing.hasFree).length;
    const hasPaid = this.homePages.filter((p) => p.pricing.hasPaid).length;

    console.log(
      `\n   Offering free option:  ${hasFree} (${((hasFree / this.homePages.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `   Offering paid option:  ${hasPaid} (${((hasPaid / this.homePages.length) * 100).toFixed(1)}%)`,
    );
  }

  /**
   * Analyze SEO metrics
   */
  analyzeSEOMetrics() {
    console.log(`\n🔗 SEO Metrics:`);

    const doFollowPercentages = this.homePages.map((p) =>
      parseFloat(p.seo.doFollowPercentage),
    );
    const extDoFollowPercentages = this.homePages.map((p) =>
      parseFloat(p.seo.externalDoFollowPercentage),
    );

    const avgDoFollow = (
      doFollowPercentages.reduce((a, b) => a + b, 0) /
      doFollowPercentages.length
    ).toFixed(1);
    const avgExtDoFollow = (
      extDoFollowPercentages.reduce((a, b) => a + b, 0) /
      extDoFollowPercentages.length
    ).toFixed(1);

    console.log(`   Average DoFollow percentage:          ${avgDoFollow}%`);
    console.log(`   Average External DoFollow percentage: ${avgExtDoFollow}%`);

    // Count directories with high dofollow
    const highDoFollow = this.homePages.filter(
      (p) => parseFloat(p.seo.externalDoFollowPercentage) > 50,
    ).length;
    console.log(
      `   Directories with >50% external dofollow: ${highDoFollow} (${((highDoFollow / this.homePages.length) * 100).toFixed(1)}%)`,
    );

    // Link statistics
    const totalLinks = this.homePages.map((p) => p.seo.totalLinks);
    const avgLinks = (
      totalLinks.reduce((a, b) => a + b, 0) / totalLinks.length
    ).toFixed(0);
    const maxLinks = Math.max(...totalLinks);
    const minLinks = Math.min(...totalLinks);

    console.log(
      `\n   Links per directory (avg/min/max): ${avgLinks} / ${minLinks} / ${maxLinks}`,
    );
  }

  /**
   * Analyze submission methods
   */
  analyzeSubmissionMethods() {
    console.log(`\n📝 Submission Methods:`);

    const withForms = this.homePages.filter(
      (p) => p.submission.hasSubmissionForm,
    ).length;
    const withButtons = this.homePages.filter(
      (p) => p.submission.submissionButtons.length > 0,
    ).length;

    console.log(
      `   Directories with submission forms:   ${withForms} (${((withForms / this.homePages.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `   Directories with submission buttons: ${withButtons} (${((withButtons / this.homePages.length) * 100).toFixed(1)}%)`,
    );

    // Analyze form complexity
    const formsData = this.homePages
      .filter((p) => p.submission.forms.length > 0)
      .map((p) => p.submission.forms[0]);

    if (formsData.length > 0) {
      const avgFields = (
        formsData.reduce((sum, f) => sum + f.fieldCount, 0) / formsData.length
      ).toFixed(1);
      const avgRequired = (
        formsData.reduce((sum, f) => sum + f.requiredFields, 0) /
        formsData.length
      ).toFixed(1);

      console.log(`\n   Average form fields: ${avgFields}`);
      console.log(`   Average required fields: ${avgRequired}`);
    }
  }

  /**
   * Analyze directory features
   */
  analyzeFeatures() {
    console.log(`\n🎯 Directory Features:`);

    const features = [
      "hasSearch",
      "hasCategories",
      "hasTags",
      "hasRatings",
      "hasReviews",
      "hasFilters",
      "hasSorting",
    ];

    const featureLabels = {
      hasSearch: "Search",
      hasCategories: "Categories",
      hasTags: "Tags",
      hasRatings: "Ratings",
      hasReviews: "Reviews",
      hasFilters: "Filters",
      hasSorting: "Sorting",
    };

    features.forEach((feature) => {
      const count = this.homePages.filter((p) => p.features[feature]).length;
      const percentage = ((count / this.homePages.length) * 100).toFixed(1);
      const label = featureLabels[feature].padEnd(12);
      console.log(
        `   ${label}: ${count.toString().padStart(3)} (${percentage}%)`,
      );
    });

    // Estimated listings
    const listings = this.homePages.map(
      (p) => p.features.estimatedListings || 0,
    );
    const avgListings = (
      listings.reduce((a, b) => a + b, 0) / listings.length
    ).toFixed(0);
    console.log(`\n   Average estimated listings: ${avgListings}`);
  }

  /**
   * Generate top directories ranking
   */
  generateTopDirectories() {
    console.log(`\n🏆 Top Directories by SEO Value:`);

    const ranked = this.homePages
      .map((p) => ({
        name: p.directoryName || p.url,
        url: p.url,
        score: this.calculateSEOScore(p),
        extDoFollow: parseFloat(p.seo.externalDoFollowPercentage),
        pricing: p.pricing.model,
        hasForm: p.submission.hasSubmissionForm,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log(`\n   Rank  Score  ExtDF%  Pricing     Form  Directory`);
    console.log(`   ${"-".repeat(70)}`);

    ranked.forEach((dir, idx) => {
      const rank = (idx + 1).toString().padStart(4);
      const score = dir.score.toString().padStart(5);
      const extDoFollow = dir.extDoFollow.toFixed(1).padStart(6);
      const pricing = dir.pricing.padEnd(10);
      const hasForm = dir.hasForm ? "✓" : "✗";
      const name = dir.name.substring(0, 30);

      console.log(
        `   ${rank}  ${score}  ${extDoFollow}  ${pricing}  ${hasForm}    ${name}`,
      );
    });
  }

  /**
   * Calculate SEO score (0-100)
   */
  calculateSEOScore(page) {
    let score = 0;

    // External dofollow links (40 points)
    score += parseFloat(page.seo.externalDoFollowPercentage) * 0.4;

    // Free submission (20 points)
    if (page.pricing.model === "free") score += 20;
    else if (page.pricing.model === "freemium") score += 10;

    // Has submission form (15 points)
    if (page.submission.hasSubmissionForm) score += 15;

    // Features (25 points)
    const featureCount = Object.values(page.features).filter(
      (v) => typeof v === "boolean" && v,
    ).length;
    score += Math.min(featureCount * 3.5, 25);

    return Math.round(score);
  }

  /**
   * Export to CSV
   */
  exportToCSV(filename = "directory-analysis.csv") {
    const headers = [
      "Directory Name",
      "URL",
      "Pricing Model",
      "Has Free",
      "Has Paid",
      "Total Links",
      "DoFollow Links",
      "DoFollow %",
      "External Links",
      "External DoFollow",
      "External DoFollow %",
      "Has Submission Form",
      "Submission Buttons",
      "Has Search",
      "Has Categories",
      "Has Tags",
      "Has Ratings",
      "Has Reviews",
      "Estimated Listings",
      "Email Addresses",
      "SEO Score",
    ];

    const rows = this.homePages.map((p) => [
      p.directoryName || "",
      p.url,
      p.pricing.model,
      p.pricing.hasFree,
      p.pricing.hasPaid,
      p.seo.totalLinks,
      p.seo.doFollowLinks,
      p.seo.doFollowPercentage,
      p.seo.externalLinks,
      p.seo.externalDoFollow,
      p.seo.externalDoFollowPercentage,
      p.submission.hasSubmissionForm,
      p.submission.submissionButtons.length,
      p.features.hasSearch,
      p.features.hasCategories,
      p.features.hasTags,
      p.features.hasRatings,
      p.features.hasReviews,
      p.features.estimatedListings,
      p.contact.emails.join(";"),
      this.calculateSEOScore(p),
    ]);

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

    fs.writeFileSync(filename, csv);
    console.log(`\n💾 CSV exported to: ${filename}`);
  }

  /**
   * Generate detailed report for each directory
   */
  generateDetailedReports() {
    console.log(`\n\n${"=".repeat(80)}`);
    console.log("DETAILED DIRECTORY REPORTS");
    console.log("=".repeat(80));

    this.homePages.forEach((page, idx) => {
      console.log(
        `\n\n[${idx + 1}/${this.homePages.length}] ${page.directoryName || page.url}`,
      );
      console.log("-".repeat(80));
      console.log(`URL: ${page.url}`);
      console.log(`Title: ${page.title}`);
      console.log(`Description: ${page.description.substring(0, 100)}...`);

      console.log(`\n📊 SEO Metrics:`);
      console.log(
        `   Links: ${page.seo.totalLinks} (${page.seo.doFollowLinks} dofollow, ${page.seo.noFollowLinks} nofollow)`,
      );
      console.log(
        `   External: ${page.seo.externalLinks} (${page.seo.externalDoFollow} dofollow - ${page.seo.externalDoFollowPercentage}%)`,
      );

      console.log(`\n💰 Pricing:`);
      console.log(`   Model: ${page.pricing.model}`);
      console.log(`   Free option: ${page.pricing.hasFree ? "Yes" : "No"}`);
      console.log(`   Paid option: ${page.pricing.hasPaid ? "Yes" : "No"}`);

      console.log(`\n📝 Submission:`);
      console.log(
        `   Form available: ${page.submission.hasSubmissionForm ? "Yes" : "No"}`,
      );
      console.log(
        `   Submission CTAs: ${page.submission.submissionButtons.length}`,
      );
      if (page.submission.submissionButtons.length > 0) {
        page.submission.submissionButtons.slice(0, 3).forEach((btn) => {
          console.log(`      - "${btn.text}"`);
        });
      }

      console.log(`\n🎯 Features:`);
      Object.entries(page.features).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          console.log(`   ${key}: ${value ? "✓" : "✗"}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      });

      if (page.contact.emails.length > 0) {
        console.log(`\n📧 Contact:`);
        page.contact.emails.forEach((email) => {
          console.log(`   ${email}`);
        });
      }

      console.log(`\n⭐ SEO Score: ${this.calculateSEOScore(page)}/100`);
    });
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: node analyze-results.js <results-file.json> [options]");
    console.log("");
    console.log("Options:");
    console.log("  --detailed    Generate detailed reports for each directory");
    console.log("  --csv         Export results to CSV");
    console.log("");
    console.log("Example:");
    console.log(
      "  node analyze-results.js directory-enrichment-1234567890.json --csv --detailed",
    );
    process.exit(1);
  }

  const filename = args[0];
  const detailed = args.includes("--detailed");
  const exportCSV = args.includes("--csv");

  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));
    const analyzer = new DirectoryAnalyzer(data);

    analyzer.generateSummary();

    if (exportCSV) {
      analyzer.exportToCSV();
    }

    if (detailed) {
      analyzer.generateDetailedReports();
    }

    console.log(`\n${"=".repeat(80)}\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

module.exports = DirectoryAnalyzer;
