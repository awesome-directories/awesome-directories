import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import supabase from "../../src/lib/supabase-server.js";

var __filename = fileURLToPath(import.meta.url);

function generateSlug(url) {
  try {
    var urlObj = new URL(url);
    var domain = urlObj.hostname.replace(/^www\./, "");
    return domain
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  } catch (e) {
    return crypto.createHash("md5").update(url).digest("hex").substring(0, 16);
  }
}

function extractDomain(url) {
  try {
    var urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch (e) {
    return url;
  }
}

function extractCategories(data) {
  var categories = [];

  if (data.features && data.features.hasCategories) {
    categories.push("general");
  }

  if (data.title) {
    var title = data.title.toLowerCase();
    if (title.includes("startup")) categories.push("startups");
    if (title.includes("saas")) categories.push("saas");
    if (title.includes("product")) categories.push("products");
    if (title.includes("tech")) categories.push("technology");
    if (title.includes("ai")) categories.push("ai");
  }

  return categories.length > 0 ? categories : ["general"];
}

function determinePricingType(pricingData) {
  if (!pricingData) return "free";

  var hasFree = pricingData.hasFree === true;
  var hasPaid = pricingData.hasPaid === true;

  if (hasFree && hasPaid) return "freemium";
  if (hasPaid) return "paid";
  return "free";
}

function extractPricingAmount(pricingData) {
  if (!pricingData || !pricingData.pricingElements) return null;

  var amounts = [];
  for (var i = 0; i < pricingData.pricingElements.length; i++) {
    var element = pricingData.pricingElements[i];
    if (!element?.match) continue;
    var match = element.match(/\$(\d+)/);
    if (match) {
      amounts.push(parseInt(match[1]));
    }
  }

  return amounts.length > 0 ? Math.min.apply(Math, amounts) : null;
}

function estimateTraffic(listingCount, seoData) {
  if (!listingCount) return "low";

  var doFollowPct = parseFloat(seoData.doFollowPercentage || 0);

  if (listingCount > 1000 && doFollowPct > 70) return "high";
  if (listingCount > 500 || doFollowPct > 50) return "medium";
  return "low";
}

function transformDataForDB(record) {
  var slug = generateSlug(record.url);
  var name = record.directoryName || record.title || extractDomain(record.url);
  var pricingType = determinePricingType(record.pricing);

  return {
    slug: slug,
    name: name,
    description: record.description || null,
    url: record.url,
    logo_url: null,
    domain_rating: null,
    is_dofollow: parseFloat(record.seo.doFollowPercentage || 0) > 50,
    categories: extractCategories(record),
    pricing_type: pricingType,
    pricing_amount: extractPricingAmount(record.pricing),
    traffic_estimate: estimateTraffic(
      record.features.estimatedListings,
      record.seo,
    ),
    avg_approval_days: null,
    submission_url:
      record.submission &&
      record.submission.forms &&
      record.submission.forms.length > 0
        ? record.submission.forms[0].action || record.url
        : record.url,
    is_affiliate: false,
    affiliate_url: null,
    helpful_count: 0,
    view_count: 0,
    is_active: true,
    spam_score: null,
    linking_root_domains: null,
    ranking_keywords: null,
    backlinks_count: null,
    referring_domains: null,
    organic_search_traffic: null,
    seo_data: {
      dofollow_percentage: parseFloat(record.seo.doFollowPercentage || 0),
      external_dofollow_percentage: parseFloat(
        record.seo.externalDoFollowPercentage || 0,
      ),
      total_links: record.seo.totalLinks || 0,
      external_dofollow_count: record.seo.externalDoFollow || 0,
      meta_keywords: record.seo.metaKeywords || "",
      has_submission_form: record.submission
        ? record.submission.hasSubmissionForm
        : false,
      form_count:
        record.submission && record.submission.forms
          ? record.submission.forms.length
          : 0,
      estimated_listings: record.features.estimatedListings || 0,
      has_search: record.features.hasSearch || false,
      has_categories: record.features.hasCategories || false,
      has_ratings: record.features.hasRatings || false,
      scraped_at: record.timestamp || new Date().toISOString(),
    },
  };
}

function printDryRunSummary(records, transformedData) {
  console.log("\n" + "=".repeat(80));
  console.log("DRY RUN MODE - No data will be written to database");
  console.log("=".repeat(80) + "\n");

  console.log("Summary:");
  console.log("  Total records to process: " + records.length);
  console.log(
    "  Depth 0 records (main pages): " +
      records.filter(function (r) {
        return r.depth === 0;
      }).length,
  );
  console.log(
    "  Records with errors: " +
      records.filter(function (r) {
        return r["#error"] === true;
      }).length,
  );
  console.log("\n");

  var pricingCounts = { free: 0, paid: 0, freemium: 0 };
  var trafficCounts = { high: 0, medium: 0, low: 0 };
  var doFollowCount = 0;
  var hasFormCount = 0;

  for (var i = 0; i < transformedData.length; i++) {
    var data = transformedData[i];
    pricingCounts[data.pricing_type]++;
    trafficCounts[data.traffic_estimate]++;
    if (data.is_dofollow) doFollowCount++;
    if (data.seo_data.has_submission_form) hasFormCount++;
  }

  console.log("Pricing Distribution:");
  console.log("  Free: " + pricingCounts.free);
  console.log("  Paid: " + pricingCounts.paid);
  console.log("  Freemium: " + pricingCounts.freemium);
  console.log("\n");

  console.log("Traffic Estimates:");
  console.log("  High: " + trafficCounts.high);
  console.log("  Medium: " + trafficCounts.medium);
  console.log("  Low: " + trafficCounts.low);
  console.log("\n");

  console.log("SEO Metrics:");
  console.log(
    "  DoFollow directories: " +
      doFollowCount +
      " (" +
      ((doFollowCount / transformedData.length) * 100).toFixed(1) +
      "%)",
  );
  console.log(
    "  Has submission form: " +
      hasFormCount +
      " (" +
      ((hasFormCount / transformedData.length) * 100).toFixed(1) +
      "%)",
  );
  console.log("\n");

  console.log("Sample Records (first 3):");
  console.log("-".repeat(80));

  for (var i = 0; i < Math.min(3, transformedData.length); i++) {
    var sample = transformedData[i];
    console.log("\n" + (i + 1) + ". " + sample.name);
    console.log("   URL: " + sample.url);
    console.log("   Slug: " + sample.slug);
    console.log(
      "   Pricing: " +
        sample.pricing_type +
        (sample.pricing_amount ? " ($" + sample.pricing_amount + ")" : ""),
    );
    console.log("   Traffic: " + sample.traffic_estimate);
    console.log(
      "   DoFollow: " +
        (sample.is_dofollow ? "Yes" : "No") +
        " (" +
        sample.seo_data.dofollow_percentage.toFixed(1) +
        "%)",
    );
    console.log(
      "   Has Form: " + (sample.seo_data.has_submission_form ? "Yes" : "No"),
    );
    console.log("   Categories: [" + sample.categories.join(", ") + "]");
    console.log("   Estimated Listings: " + sample.seo_data.estimated_listings);
  }

  console.log("\n" + "-".repeat(80));
  console.log("\nTo write these records to the database, run:");
  console.log("  node save-result-to-db.js <json-file> --write");
  console.log("\n");
}

function validateRecord(record) {
  var errors = [];

  if (!record.url) errors.push("Missing URL");
  if (!record.name) errors.push("Missing name");
  if (
    record.pricing_type &&
    !["free", "paid", "freemium"].includes(record.pricing_type)
  ) {
    errors.push("Invalid pricing_type: " + record.pricing_type);
  }
  if (
    record.traffic_estimate &&
    !["high", "medium", "low"].includes(record.traffic_estimate)
  ) {
    errors.push("Invalid traffic_estimate: " + record.traffic_estimate);
  }

  return errors;
}

async function writeToDatabase(supabase, transformedData, dryRun) {
  if (dryRun) {
    console.log("Skipping database write (dry run mode)");
    return { success: true, inserted: 0, updated: 0, errors: [] };
  }

  console.log("\n" + "=".repeat(80));
  console.log("WRITE MODE - Writing to database");
  console.log("=".repeat(80) + "\n");

  var results = {
    success: true,
    inserted: 0,
    updated: 0,
    errors: [],
  };

  for (var i = 0; i < transformedData.length; i++) {
    var record = transformedData[i];

    var validationErrors = validateRecord(record);
    if (validationErrors.length > 0) {
      results.errors.push({
        record: record.name,
        errors: validationErrors,
      });
      continue;
    }

    try {
      console.log(
        "Processing (" +
          (i + 1) +
          "/" +
          transformedData.length +
          "): " +
          record.name,
      );

      var checkResult = await supabase
        .from("directories")
        .select("id, slug")
        .eq("slug", record.slug)
        .maybeSingle();

      if (checkResult.error) {
        throw checkResult.error;
      }

      if (checkResult.data) {
        var updateResult = await supabase
          .from("directories")
          .update(record)
          .eq("id", checkResult.data.id);

        if (updateResult.error) {
          throw updateResult.error;
        }

        results.updated++;
        console.log("  ✓ Updated existing record");
      } else {
        var insertResult = await supabase.from("directories").insert([record]);

        if (insertResult.error) {
          throw insertResult.error;
        }

        results.inserted++;
        console.log("  ✓ Inserted new record");
      }
    } catch (error) {
      results.success = false;
      results.errors.push({
        record: record.name,
        errors: [error.message],
      });
      console.log("  ✗ Error: " + error.message);
    }
  }

  return results;
}

async function main() {
  var args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage: node save-result-to-db.js <json-file> [--write]");
    console.log("");
    console.log("Options:");
    console.log("  --write    Actually write to database (default is dry-run)");
    console.log("  --help     Show this help message");
    console.log("");
    console.log("Examples:");
    console.log("  node save-result-to-db.js results.json           # Dry run");
    console.log(
      "  node save-result-to-db.js results.json --write   # Actually write",
    );
    process.exit(0);
  }

  var jsonFile = args[0];
  var writeMode = args.includes("--write");

  if (!fs.existsSync(jsonFile)) {
    console.error("Error: File not found: " + jsonFile);
    process.exit(1);
  }

  console.log("Reading file: " + jsonFile);
  var rawData = fs.readFileSync(jsonFile, "utf8");
  var records = JSON.parse(rawData);

  if (!Array.isArray(records)) {
    console.error("Error: JSON file must contain an array of records");
    process.exit(1);
  }

  var mainRecords = records.filter(function (r) {
    return r.depth === 0 && r["#error"] !== true && r.url;
  });

  console.log(
    "Found " + mainRecords.length + " valid main records (depth 0, no errors)",
  );

  if (mainRecords.length === 0) {
    console.error("Error: No valid records found to process");
    process.exit(1);
  }

  var transformedData = mainRecords.map(transformDataForDB);

  printDryRunSummary(records, transformedData);

  if (writeMode) {
    var results = await writeToDatabase(supabase, transformedData, false);

    console.log("\n" + "=".repeat(80));
    console.log("Write Results:");
    console.log("  Inserted: " + results.inserted);
    console.log("  Updated: " + results.updated);
    console.log("  Errors: " + results.errors.length);

    if (results.errors.length > 0) {
      console.log("\nErrors:");
      for (var i = 0; i < results.errors.length; i++) {
        var error = results.errors[i];
        console.log("  - " + error.record + ": " + error.errors.join(", "));
      }
    }

    console.log("=".repeat(80) + "\n");

    if (!results.success) {
      process.exit(1);
    }
  }
}

main().catch(function (error) {
  console.error("Fatal error:", error);
  process.exit(1);
});
