export function extractDomain(url: string): string {
  try {
    var urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, "");
  } catch (error) {
    console.error(`Failed to extract domain from ${url}:`, error);
    return url;
  }
}

export function batchArray<T>(array: T[], size: number): T[][] {
  var batches = [];
  for (var i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

export async function pollApifyRun(
  runId: string,
  datasetId: string,
  apifyToken: string,
  maxAttempts: number,
): Promise<any[]> {
  var attempt = 0;
  var delay = 5000;

  while (attempt < maxAttempts) {
    var statusResponse = await fetch(
      `https://api.apify.com/v2/acts/radeance~ahrefs-scraper/runs/${runId}`,
      {
        headers: {
          Authorization: `Bearer ${apifyToken}`,
        },
      },
    );

    if (!statusResponse.ok) {
      throw new Error(
        `Failed to check run status: ${statusResponse.statusText}`,
      );
    }

    var statusData = await statusResponse.json();
    var status = statusData.data.status;

    console.log(
      `Run ${runId} status: ${status} (attempt ${attempt + 1}/${maxAttempts})`,
    );

    if (status === "SUCCEEDED") {
      var datasetResponse = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items`,
        {
          headers: {
            Authorization: `Bearer ${apifyToken}`,
          },
        },
      );

      if (!datasetResponse.ok) {
        throw new Error(
          `Failed to fetch dataset: ${datasetResponse.statusText}`,
        );
      }

      return await datasetResponse.json();
    }

    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Actor run ${status.toLowerCase()}`);
    }

    attempt++;
    await new Promise(function wait(resolve) {
      setTimeout(resolve, delay);
    });
  }

  throw new Error(`Polling timed out after ${maxAttempts} attempts`);
}

export async function fetchDirectoriesFromDatabase(
  supabase: any,
  limit: number | null,
) {
  var query = supabase
    .from("directories")
    .select("id, name, url, domain_rating, last_dr_check")
    .eq("is_active", true)
    .order("last_dr_check", { ascending: true, nullsFirst: true });

  if (limit) {
    query = query.limit(limit);
  }

  var { data, error } = await query;

  if (error) {
    console.error("Error fetching directories:", error);
    throw error;
  }

  return data;
}

export function createDomainMapping(directories: any[]) {
  var domainToDirectory = new Map();
  var urls = [];

  for (var i = 0; i < directories.length; i++) {
    var dir = directories[i];
    var domain = extractDomain(dir.url);
    domainToDirectory.set(domain, dir);
    urls.push(domain);
  }

  return { domainToDirectory: domainToDirectory, urls: urls };
}
