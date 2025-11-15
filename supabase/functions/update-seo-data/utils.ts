export function extractDomain(url: string): string {
  try {
    var urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, "");
  } catch (error) {
    console.error(`Failed to extract domain from ${url}:`, error);
    return '';
  }
}

export function batchArray(array, size) {
  var batches = [];
  for (var i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

export async function pollApifyRun(runId: string, datasetId: string, apifyToken: string, maxWaitMinutes: number) {
  var maxWaitTime = maxWaitMinutes * 60 * 1000;
  var pollInterval = 5000;
  var startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    var statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      {
        headers: {
          Authorization: `Bearer ${apifyToken}`,
        },
      }
    );

    var statusData = await statusResponse.json();
    var status = statusData.data.status;

    console.log(`Run status: ${status}`);

    if (status === "SUCCEEDED") {
      var datasetResponse = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items`,
        {
          headers: {
            Authorization: `Bearer ${apifyToken}`,
          },
        }
      );

      var results = await datasetResponse.json();
      console.log(`Retrieved ${results.length} results from Apify`);
      return results;
    } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Actor run ${status.toLowerCase()}`);
    }

    await new Promise(function wait(resolve) { setTimeout(resolve, pollInterval); });
  }

  throw new Error("Actor run timed out");
}

export async function fetchDirectoriesFromDatabase(supabase, limitDirectories: number | null) {
  console.log("Fetching directories from database...");
  var query = supabase
    .from("directories")
    .select("id, name, url, domain_rating, last_dr_check")
    .eq("is_active", true)
    .order("last_dr_check", { ascending: true, nullsFirst: true });

  if (limitDirectories) {
    query = query.limit(limitDirectories);
  }

  var { data: directories, error: fetchError } = await query;

  if (fetchError) {
    throw fetchError;
  }

  return directories;
}

export function createDomainMapping(directories) {
  var domainToDirectory = new Map();
  var urls = [];

  for (var i = 0; i < directories.length; i++) {
    var dir = directories[i];
    var domain = extractDomain(dir.url);
    if (!domain) {
      console.error(`Skipping directory ${dir.id} due to invalid URL: ${dir.url}`);
      continue;
    }
    var fullUrl = dir.url.startsWith("http") ? dir.url : `https://${dir.url}`;
    urls.push(fullUrl);
    domainToDirectory.set(domain, dir);
  }

  return { domainToDirectory: domainToDirectory, urls: urls };
}
