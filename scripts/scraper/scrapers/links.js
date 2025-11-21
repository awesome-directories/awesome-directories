/**
 * Link Analysis Module
 * Analyzes links on page for dofollow/nofollow attributes
 */

import { logger } from '../utils/logger.js';
import { config } from '../config.js';

/**
 * Categorize link type
 */
function categorizeLink(href, baseUrl) {
  try {
    const linkUrl = new URL(href, baseUrl);
    const baseDomain = new URL(baseUrl).hostname;

    if (linkUrl.hostname === baseDomain) {
      return 'internal';
    } else {
      return 'external';
    }
  } catch (error) {
    return 'invalid';
  }
}

/**
 * Check if link matches submission patterns
 */
function isSubmissionLink(href, text) {
  const submissionKeywords = [
    'submit',
    'add',
    'list',
    'register',
    'sign-up',
    'signup',
    'join',
    'post',
  ];

  const combined = `${href} ${text}`.toLowerCase();

  return submissionKeywords.some(keyword => combined.includes(keyword));
}

/**
 * Analyze all links on page
 * @param {Page} page - Puppeteer page object
 * @param {string} url - Current page URL
 * @returns {Promise<Object>} - Link analysis results
 */
export async function analyzeLinks(page, url) {
  logger.info(`Analyzing links on: ${url}`);

  try {
    const linkData = await page.evaluate((baseUrl, maxLinks) => {
      const links = Array.from(document.querySelectorAll('a[href]'));

      return links.slice(0, maxLinks).map(link => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel') || '';
        const text = link.textContent.trim();
        const ariaLabel = link.getAttribute('aria-label') || '';

        // Determine link attributes
        const isNofollow = rel.includes('nofollow');
        const isUgc = rel.includes('ugc');
        const isSponsored = rel.includes('sponsored');
        const isDofollow = !isNofollow && !isUgc && !isSponsored;

        return {
          href,
          text,
          ariaLabel,
          rel,
          isDofollow,
          isNofollow,
          isUgc,
          isSponsored,
        };
      });
    }, url, config.links.maxLinksToAnalyze);

    // Categorize links
    const categorized = {
      internal: [],
      external: [],
      submission: [],
      invalid: [],
    };

    const linkStats = {
      total: linkData.length,
      dofollow: 0,
      nofollow: 0,
      ugc: 0,
      sponsored: 0,
      externalDofollow: 0,
      externalNofollow: 0,
      submissionLinks: 0,
    };

    linkData.forEach(link => {
      const category = categorizeLink(link.href, url);

      // Update stats
      if (link.isDofollow) linkStats.dofollow++;
      if (link.isNofollow) linkStats.nofollow++;
      if (link.isUgc) linkStats.ugc++;
      if (link.isSponsored) linkStats.sponsored++;

      // Categorize
      if (category === 'external') {
        categorized.external.push(link);
        if (link.isDofollow) linkStats.externalDofollow++;
        if (link.isNofollow) linkStats.externalNofollow++;
      } else if (category === 'internal') {
        categorized.internal.push(link);
      } else {
        categorized.invalid.push(link);
      }

      // Check if submission link
      if (isSubmissionLink(link.href, link.text)) {
        categorized.submission.push(link);
        linkStats.submissionLinks++;
      }
    });

    // Determine overall link quality
    const linkQuality = {
      providesDofollow: linkStats.externalDofollow > 0,
      dofollowPercentage: linkStats.total > 0
        ? ((linkStats.dofollow / linkStats.total) * 100).toFixed(1)
        : 0,
      hasSubmissionLinks: linkStats.submissionLinks > 0,
      submissionUrls: categorized.submission.map(l => l.href),
    };

    logger.success(`Link analysis complete: ${url}`, {
      total: linkStats.total,
      dofollow: linkStats.dofollow,
      externalDofollow: linkStats.externalDofollow,
    });

    return {
      stats: linkStats,
      categorized,
      quality: linkQuality,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Failed to analyze links: ${url}`, { error: error.message });
    throw error;
  }
}

/**
 * Find submission page URL from links
 */
export function findSubmissionUrl(linkAnalysis) {
  const submissionLinks = linkAnalysis.categorized.submission;

  if (submissionLinks.length === 0) {
    return null;
  }

  // Prioritize links with clear submission keywords
  const priorityKeywords = ['submit', 'add-listing', 'add-your'];

  for (const keyword of priorityKeywords) {
    const found = submissionLinks.find(link =>
      link.href.toLowerCase().includes(keyword) ||
      link.text.toLowerCase().includes(keyword)
    );
    if (found) return found.href;
  }

  // Return first submission link
  return submissionLinks[0].href;
}

export default {
  analyzeLinks,
  findSubmissionUrl,
};
