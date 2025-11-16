import {
  extractDomain,
  batchArray,
  pollApifyRun,
  fetchDirectoriesFromDatabase,
  createDomainMapping,
} from "./utils.ts";

interface Directory {
  id: string;
  name: string;
  url: string;
  domain_rating: number | null;
  last_dr_check: string | null;
}

interface AhrefsMetrics {
  data_captured_at?: string;
  type?: string;
  domain?: string;
  mode?: string;
  website_authority?: {
    domainRating?: number;
    urlRating?: number;
    backlinks?: number;
    refdomains?: number;
    dofollowBacklinks?: number;
    dofollowRefdomains?: number;
  };
  website_overall_search_traffic?: number;
  website_traffic?: {
    trafficMonthlyAvg?: number;
    costMontlyAvg?: number;
  };
  referal_domains_overall?: number;
  backlink_check?: {
    domainRating?: number;
    backlinks?: number;
    refdomains?: number;
  };
}

async function fetchAhrefsMetrics(
  urls: string[],
  apifyToken: string,
): Promise<AhrefsMetrics[]> {
  var input = {
    urls: urls,
    include_web_authority: true,
    include_traffic: true,
    include_backlinks: true,
    include_keywords: false,
    include_keywords_difficulty: false,
    include_keywords_ranking: false,
    include_serp: false,
    include_broken_links: false,
    include_competitors: false,
    include_top_websites: false,
    mode: "subdomains",
    country: "us",
  };

  try {
    console.log(`Calling Apify for URLs: ${urls.join(", ")}`);

    var runResponse = await fetch(
      "https://api.apify.com/v2/acts/radeance~ahrefs-scraper/runs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apifyToken}`,
        },
        body: JSON.stringify(input),
      },
    );

    if (!runResponse.ok) {
      throw new Error(
        `Apify API error: ${runResponse.status} ${runResponse.statusText}`,
      );
    }

    var runData = await runResponse.json();
    var runId = runData.data.id;
    var defaultDatasetId = runData.data.defaultDatasetId;

    console.log(`Actor run started: ${runId}`);

    return await pollApifyRun(runId, defaultDatasetId, apifyToken, 10);
  } catch (error) {
    console.error("Error fetching Ahrefs metrics:", error);
    throw error;
  }
}

async function updateDirectoryMetrics(
  supabaseClient,
  directoryId: string,
  metricsArray: AhrefsMetrics[],
) {
  var domainRating = null;
  var backlinksCount = null;
  var referringDomains = null;
  var organicTraffic = null;
  var consolidatedData = {};

  for (var i = 0; i < metricsArray.length; i++) {
    var metrics = metricsArray[i];

    if (metrics.type === "authority" && metrics.website_authority) {
      domainRating = metrics.website_authority.domainRating ?? domainRating;
      backlinksCount = metrics.website_authority.backlinks ?? backlinksCount;
      referringDomains =
        metrics.website_authority.refdomains ?? referringDomains;
      consolidatedData.authority = metrics.website_authority;
    }

    if (metrics.type === "backlinks" && metrics.backlink_check) {
      domainRating =
        domainRating ?? metrics.backlink_check.domainRating ?? null;
      backlinksCount =
        backlinksCount ?? metrics.backlink_check.backlinks ?? null;
      referringDomains =
        referringDomains ?? metrics.backlink_check.refdomains ?? null;
      consolidatedData.backlinks = metrics.backlink_check;
      if (metrics.top_backlinks) {
        consolidatedData.top_backlinks = metrics.top_backlinks;
      }
    }

    if (metrics.type === "traffic") {
      if (
        metrics.website_traffic &&
        metrics.website_traffic.trafficMonthlyAvg !== undefined
      ) {
        organicTraffic = metrics.website_traffic.trafficMonthlyAvg;
      }
      consolidatedData.traffic = {
        monthly_avg: metrics.website_traffic?.trafficMonthlyAvg,
        history: metrics.website_traffic_history,
        by_country: metrics.website_traffic_by_country,
        top_pages: metrics.website_traffic_top_pages,
        top_keywords: metrics.website_traffic_top_keywords,
      };
    }
  }

  var updateData = {
    domain_rating: domainRating,
    backlinks_count: backlinksCount,
    referring_domains: referringDomains,
    linking_root_domains: referringDomains,
    organic_search_traffic: organicTraffic,
    seo_data: consolidatedData,
    last_dr_check: new Date().toISOString(),
  };

  var { error } = await supabaseClient
    .from("directories")
    .update(updateData)
    .eq("id", directoryId);

  if (error) {
    console.error(`Failed to update directory ${directoryId}:`, error);
    throw error;
  }

  console.log(`Updated directory ${directoryId} with new metrics`);
}

export async function updateAhrefsMetrics(
  supabase,
  apifyToken: string,
  batchSize: number,
  limitDirectories: number | null,
) {
  var directories = await fetchDirectoriesFromDatabase(
    supabase,
    limitDirectories,
  );

  if (!directories || directories.length === 0) {
    return {
      success: true,
      message: "No directories to update",
      updated: 0,
    };
  }

  console.log(`Found ${directories.length} directories to update`);

  var { domainToDirectory, urls } = createDomainMapping(directories);
  var batches = batchArray(urls, batchSize);
  var totalUpdated = 0;
  var totalFailed = 0;
  var errors = [];

  console.log(
    `Processing ${batches.length} batches of up to ${batchSize} URLs each`,
  );

  for (var i = 0; i < batches.length; i++) {
    var batch = batches[i];
    console.log(`Processing batch ${i + 1}/${batches.length}`);

    try {
      var results = await fetchAhrefsMetrics(batch, apifyToken);

      var domainMetrics = new Map();

      for (var j = 0; j < results.length; j++) {
        var result = results[j];
        if (result.domain) {
          if (!domainMetrics.has(result.domain)) {
            domainMetrics.set(result.domain, []);
          }
          domainMetrics.get(result.domain).push(result);
        }
      }

      for (var entry of domainMetrics.entries()) {
        var domain = entry[0];
        var metrics = entry[1];

        try {
          var directory = domainToDirectory.get(domain);
          if (directory) {
            await updateDirectoryMetrics(supabase, directory.id, metrics);
            totalUpdated++;
          } else {
            console.error(`No directory found for domain ${domain}`);
            errors.push(`${domain}: Directory not found in mapping`);
            totalFailed++;
          }
        } catch (error) {
          console.error(`Error updating directory for ${domain}:`, error);
          errors.push(`${domain}: ${error.message}`);
          totalFailed++;
        }
      }

      if (i < batches.length - 1) {
        await new Promise(function wait(resolve) {
          setTimeout(resolve, 3000);
        });
      }
    } catch (error) {
      console.error(`Error processing batch ${i + 1}:`, error);
      errors.push(`Batch ${i + 1}: ${error.message}`);
      totalFailed += batch.length;
    }
  }

  return {
    success: true,
    totalDirectories: directories.length,
    totalUpdated: totalUpdated,
    totalFailed: totalFailed,
    errors: errors.length > 0 ? errors : undefined,
  };
}
