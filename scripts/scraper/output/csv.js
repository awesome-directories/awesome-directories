/**
 * CSV Output Formatter
 * Exports scraped data to CSV for spreadsheet review
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';
import { extractContentForExport } from '../scrapers/content.js';

/**
 * Escape CSV field
 */
function escapeCsvField(field) {
  if (field === null || field === undefined) return '';

  const str = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Convert array of objects to CSV
 */
function arrayToCsv(data, headers) {
  const lines = [];

  // Add header row
  lines.push(headers.map(h => escapeCsvField(h)).join(','));

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => escapeCsvField(row[header]));
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

/**
 * Save CSV export of all results
 */
export async function saveCsv(allResults) {
  try {
    const exportData = allResults.map(result => {
      if (result.error) {
        return {
          directoryName: result.directory.name,
          url: result.directory.url,
          error: result.error,
          qualityScore: 0,
        };
      }

      return extractContentForExport(result);
    });

    const headers = [
      'directoryName',
      'url',
      'qualityScore',
      'suggestedDescription',
      'suggestedCategories',
      'linkQuality',
      'pricingInfo',
      'submissionProcess',
      'keyFeatures',
      'metaTitle',
      'metaDescription',
      'heroHeading',
      'heroSubheading',
      'totalLinks',
      'dofollowLinks',
      'nofollowLinks',
      'externalDofollowLinks',
      'submissionUrls',
      'scrapedAt',
      'error',
    ];

    const csv = arrayToCsv(exportData, headers);

    const filepath = path.join(config.output.baseDir, 'scraped-directories.csv');
    await fs.writeFile(filepath, csv, 'utf-8');

    logger.success('Saved CSV: scraped-directories.csv');
    return filepath;
  } catch (error) {
    logger.error('Failed to save CSV', { error: error.message });
    throw error;
  }
}

export default {
  saveCsv,
};
