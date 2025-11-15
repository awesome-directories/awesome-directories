import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface Directory {
  id: string;
  name: string;
  url: string;
  domain_rating: number | null;
  last_dr_check: string | null;
}

interface ApifyInput {
  domains: string[];
  outputFormat: string;
  maxRetries: number;
  useProxy: boolean;
  proxyType: string;
}

interface MozMetrics {
  domain_authority?: number;
  spam_score?: number;
  linking_root_domains?: number;
  ranking_keywords?: number;
}

interface ApifyResult {
  success: boolean;
  domain: string;
  data?: MozMetrics;
  error?: string;
}

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, "");
  } catch (error) {
    console.error(`Failed to extract domain from ${url}:`, error);
    return url;
  }
}

// Helper function to batch array into chunks
function batchArray<T>(array: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

// Call Apify actor to get Moz metrics
async function fetchMozMetrics(
  domains: string[],
  apifyToken: string
): Promise<ApifyResult[]> {
  const input: ApifyInput = {
    domains,
    outputFormat: "json",
    maxRetries: 3,
    useProxy: false,
    proxyType: "DATACENTER",
  };

  try {
    console.log(`Calling Apify for domains: ${domains.join(", ")}`);

    // Start the actor run
    const runResponse = await fetch(
      "https://api.apify.com/v2/acts/jdtpnjtp~moz-domain-authority-checker/runs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apifyToken}`,
        },
        body: JSON.stringify(input),
      }
    );

    if (!runResponse.ok) {
      throw new Error(`Apify API error: ${runResponse.status} ${runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;
    const defaultDatasetId = runData.data.defaultDatasetId;

    console.log(`Actor run started: ${runId}`);

    // Poll for completion (wait up to 5 minutes)
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const pollInterval = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/jdtpnjtp~moz-domain-authority-checker/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${apifyToken}`,
          },
        }
      );

      const statusData = await statusResponse.json();
      const status = statusData.data.status;

      console.log(`Run status: ${status}`);

      if (status === "SUCCEEDED") {
        // Fetch results from dataset
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/datasets/${defaultDatasetId}/items`,
          {
            headers: {
              Authorization: `Bearer ${apifyToken}`,
            },
          }
        );

        const results = await datasetResponse.json();
        console.log(`Retrieved ${results.length} results from Apify`);
        return results;
      } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
        throw new Error(`Actor run ${status.toLowerCase()}`);
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error("Actor run timed out");
  } catch (error) {
    console.error("Error fetching Moz metrics:", error);
    throw error;
  }
}

// Update directory in database with new metrics
async function updateDirectoryMetrics(
  supabaseClient: any,
  directoryId: string,
  metrics: MozMetrics,
  fullData: any
) {
  const updateData: any = {
    domain_rating: metrics.domain_authority ?? null,
    spam_score: metrics.spam_score ?? null,
    linking_root_domains: metrics.linking_root_domains ?? null,
    ranking_keywords: metrics.ranking_keywords ?? null,
    moz_data: fullData,
    last_dr_check: new Date().toISOString(),
  };

  const { error } = await supabaseClient
    .from("directories")
    .update(updateData)
    .eq("id", directoryId);

  if (error) {
    console.error(`Failed to update directory ${directoryId}:`, error);
    throw error;
  }

  console.log(`Updated directory ${directoryId} with new metrics`);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    const functionSecret = Deno.env.get("FUNCTION_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    if (!apifyToken) {
      throw new Error("Missing APIFY_API_TOKEN environment variable");
    }

    // Verify authorization if secret is set
    if (functionSecret) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${functionSecret}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for options
    let batchSize = 3; // Apify limit
    let limitDirectories: number | null = null;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.batchSize && body.batchSize <= 3) {
          batchSize = body.batchSize;
        }
        if (body.limit) {
          limitDirectories = body.limit;
        }
      } catch {
        // Use defaults if no valid body
      }
    }

    // Fetch active directories from database
    console.log("Fetching directories from database...");
    let query = supabase
      .from("directories")
      .select("id, name, url, domain_rating, last_dr_check")
      .eq("is_active", true)
      .order("last_dr_check", { ascending: true, nullsFirst: true });

    if (limitDirectories) {
      query = query.limit(limitDirectories);
    }

    const { data: directories, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!directories || directories.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No directories to update",
          updated: 0,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${directories.length} directories to update`);

    // Create domain to directory mapping
    const domainToDirectory = new Map<string, Directory>();
    const domains: string[] = [];

    for (const dir of directories) {
      const domain = extractDomain(dir.url);
      domains.push(domain);
      domainToDirectory.set(domain, dir);
    }

    // Process domains in batches
    const batches = batchArray(domains, batchSize);
    let totalUpdated = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    console.log(`Processing ${batches.length} batches of up to ${batchSize} domains each`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length}`);

      try {
        const results = await fetchMozMetrics(batch, apifyToken);

        for (const result of results) {
          try {
            if (result.success && result.data) {
              const directory = domainToDirectory.get(result.domain);
              if (directory) {
                await updateDirectoryMetrics(
                  supabase,
                  directory.id,
                  result.data,
                  result
                );
                totalUpdated++;
              }
            } else {
              console.error(`Failed to get metrics for ${result.domain}: ${result.error}`);
              errors.push(`${result.domain}: ${result.error || "Unknown error"}`);
              totalFailed++;
            }
          } catch (error) {
            console.error(`Error updating directory for ${result.domain}:`, error);
            errors.push(`${result.domain}: ${error.message}`);
            totalFailed++;
          }
        }

        // Add a small delay between batches to avoid rate limiting
        if (i < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error);
        errors.push(`Batch ${i + 1}: ${error.message}`);
        totalFailed += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalDirectories: directories.length,
        totalUpdated,
        totalFailed,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in update-moz-metrics function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
