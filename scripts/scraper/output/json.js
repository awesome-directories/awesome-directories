/**
 * JSON Output Formatter
 * Saves scraped data as JSON files
 */

import fs from "fs/promises";
import path from "path";
import { logger } from "../utils/logger.js";
import { config } from "../config.js";

/**
 * Save individual directory data as JSON
 */
export async function saveDirectoryJson(directoryData) {
  try {
    const filename = `${directoryData.directory.id}.json`;
    const filepath = path.join(config.output.dataDir, filename);

    await fs.writeFile(
      filepath,
      JSON.stringify(directoryData, null, 2),
      "utf-8",
    );

    logger.debug(`Saved JSON: ${filename}`);
    return filepath;
  } catch (error) {
    logger.error("Failed to save JSON", { error: error.message });
    throw error;
  }
}

/**
 * Save aggregated summary JSON
 */
export async function saveSummaryJson(allResults) {
  try {
    const summary = {
      totalScraped: allResults.length,
      successCount: allResults.filter((r) => !r.error).length,
      errorCount: allResults.filter((r) => r.error).length,
      timestamp: new Date().toISOString(),
      averageQualityScore: 0,
      directories: allResults.map((result) => ({
        id: result.directory.id,
        name: result.directory.name,
        url: result.directory.url,
        qualityScore: result.curationSuggestions?.qualityScore || 0,
        hasError: !!result.error,
        error: result.error || null,
      })),
    };

    // Calculate average quality score
    const scores = summary.directories
      .filter((d) => !d.hasError)
      .map((d) => d.qualityScore);

    if (scores.length > 0) {
      summary.averageQualityScore = (
        scores.reduce((a, b) => a + b, 0) / scores.length
      ).toFixed(1);
    }

    const filepath = path.join(config.output.baseDir, "summary.json");
    await fs.writeFile(filepath, JSON.stringify(summary, null, 2), "utf-8");

    logger.success(`Saved summary JSON: summary.json`);
    return filepath;
  } catch (error) {
    logger.error("Failed to save summary JSON", { error: error.message });
    throw error;
  }
}

export default {
  saveDirectoryJson,
  saveSummaryJson,
};
