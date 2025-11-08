import { createClient } from "@supabase/supabase-js";
import https from "https";
import crypto from "crypto";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const mozAccessId = process.env.MOZ_API_ACCESS_ID;
const mozSecretKey = process.env.MOZ_API_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

if (!mozAccessId || !mozSecretKey) {
  console.warn("Missing Moz API credentials - skipping DR updates");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate Moz API authentication header
 */
function generateMozAuth() {
  const expires = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
  const stringToSign = `${mozAccessId}\n${expires}`;
  const signature = crypto
    .createHmac("sha1", mozSecretKey)
    .update(stringToSign)
    .digest("base64");

  return `${mozAccessId}:${signature}:${expires}`;
}

/**
 * Fetch DR score from Moz API for a URL
 */
async function fetchDRScore(url) {
  return new Promise((resolve, reject) => {
    const auth = generateMozAuth();
    const postData = JSON.stringify({
      targets: [url],
      metrics: ["domain_authority", "page_authority"],
    });

    const options = {
      hostname: "lsapi.seomoz.com",
      path: "/v2/url_metrics",
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(auth).toString("base64")}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.results && parsed.results.length > 0) {
            // Moz returns DA (Domain Authority), which is similar to DR
            const da = parsed.results[0].domain_authority || null;
            resolve(da);
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Update DR scores for all directories
 */
async function updateDRScores() {
  console.log("Starting DR score update...");

  try {
    // Fetch all active directories
    const { data: directories, error } = await supabase
      .from("directories")
      .select("id, slug, url, domain_rating")
      .eq("is_active", true);

    if (error) throw error;

    console.log(`Found ${directories.length} directories to update`);

    let updated = 0;
    let failed = 0;
    let unchanged = 0;

    // Process in batches of 10 to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < directories.length; i += batchSize) {
      const batch = directories.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (dir) => {
          try {
            const dr = await fetchDRScore(dir.url);

            if (dr !== null && dr !== dir.domain_rating) {
              const { error: updateError } = await supabase
                .from("directories")
                .update({
                  domain_rating: dr,
                  last_dr_check: new Date().toISOString(),
                })
                .eq("id", dir.id);

              if (updateError) throw updateError;

              console.log(
                `✅ Updated ${dir.slug}: ${dir.domain_rating} → ${dr}`,
              );
              updated++;
            } else {
              // Update last_dr_check even if score hasn't changed
              await supabase
                .from("directories")
                .update({ last_dr_check: new Date().toISOString() })
                .eq("id", dir.id);

              unchanged++;
            }
          } catch (error) {
            console.error(`❌ Failed to update ${dir.slug}:`, error.message);
            failed++;
          }
        }),
      );

      // Wait 2 seconds between batches to respect rate limits
      if (i + batchSize < directories.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log("\n=== Update Summary ===");
    console.log(`Total directories: ${directories.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Unchanged: ${unchanged}`);
    console.log(`Failed: ${failed}`);
    console.log("=====================\n");

    if (failed > 0) {
      console.warn(`⚠️  ${failed} directories failed to update`);
    }

    console.log("✅ DR score update completed");
  } catch (error) {
    console.error("❌ Fatal error during DR score update:", error);
    process.exit(1);
  }
}

// Run the update
updateDRScores();
