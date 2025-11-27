import {
  extractDomain,
  batchArray,
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

async function pollApifyRunWithBackoff(
  runId: string,
  defaultDatasetId: string,
  apifyToken: string,
  maxAttempts: number,
  initialIntervalMs: number,
  maxIntervalMs: number,
): Promise<AhrefsMetrics[]> {
  var attempt = 0;
  var intervalMs = initialIntervalMs;

  while (attempt < maxAttempts) {
    attempt++;

    console.log(
      `Polling attempt ${attempt}/${maxAttempts} for run ${runId} (interval: ${intervalMs}ms)`,
    );

    var statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      {
        headers: {
          Authorization: `Bearer ${apifyToken}`,
        },
      },
    );

    if (!statusResponse.ok) {
      console.error(`Failed to get run status: ${statusResponse.status}`);
      await sleep(intervalMs);
      intervalMs = Math.min(intervalMs * 1.5, maxIntervalMs);
      continue;
    }

    var statusData = await statusResponse.json();
    var status = statusData.data.status;

    console.log(`Run ${runId} status: ${status}`);

    if (status === "SUCCEEDED") {
      var datasetResponse = await fetch(
        `https://api.apify.com/v2/datasets/${defaultDatasetId}/items`,
        {
          headers: {
            Authorization: `Bearer ${apifyToken}`,
          },
        },
      );

      if (!datasetResponse.ok) {
        throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`);
      }

      return await datasetResponse.json();
    }

    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify run ${runId} ended with status: ${status}`);
    }

    await sleep(intervalMs);
    intervalMs = Math.min(intervalMs * 1.5, maxIntervalMs);
  }

  throw new Error(
    `Polling timed out after ${maxAttempts} attempts for run ${runId}`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(function sleepResolve(resolve) {
    setTimeout(resolve, ms);
  });
}

async function fetchAhrefsMetrics(
  urls: string[],
  apifyToken: string,
  proxyUrl: string,
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

  if (proxyUrl) {
    input.proxy = proxyUrl;
  }

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

    var maxAttempts = 60;
    var initialIntervalMs = 5000;
    var maxIntervalMs = 60000;

    return await pollApifyRunWithBackoff(
      runId,
      defaultDatasetId,
      apifyToken,
      maxAttempts,
      initialIntervalMs,
      maxIntervalMs,
    );
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
      if (metrics.referal_domains_overall !== undefined) {
        consolidatedData.referal_domains_overall =
          metrics.referal_domains_overall;
      }
      if (metrics.referal_domains_history) {
        consolidatedData.referal_domains_history =
          metrics.referal_domains_history;
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
        overall_search_traffic: metrics.website_overall_search_traffic,
        overall_search_traffic_last_month:
          metrics.website_overall_search_traffic_last_month,
        overall_search_traffic_value:
          metrics.website_overall_search_traffic_value,
        history: metrics.website_traffic_history,
        by_country: metrics.website_traffic_by_country,
        top_pages: metrics.website_traffic_top_pages,
        top_keywords: metrics.website_traffic_top_keywords,
        top_countries: metrics.website_traffic_top_countries,
      };
    }

    if (metrics.type === "competitors" && metrics.competitors) {
      consolidatedData.competitors = metrics.competitors;
    }

    if (metrics.type === "keywords" && metrics.keyword_ideas) {
      consolidatedData.keywords = {
        ideas: metrics.keyword_ideas,
        ideas_count: metrics.keyword_ideas_count,
        questions: metrics.keyword_ideas_questions,
        questions_count: metrics.keyword_ideas_questions_count,
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
  proxyUrl: string,
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
      var results = await fetchAhrefsMetrics(batch, apifyToken, proxyUrl);

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
