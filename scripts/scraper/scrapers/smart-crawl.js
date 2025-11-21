/**
 * Smart Crawl Module
 * Intelligently finds and crawls relevant pages (submission, pricing, about)
 */

import { logger } from '../utils/logger.js';
import { config } from '../config.js';
import { navigateToUrl } from '../browser.js';
import { humanDelay } from '../utils/retry.js';

/**
 * Score link relevance based on keywords
 */
function scoreLinkRelevance(href, text, keywords) {
  const combined = `${href} ${text}`.toLowerCase();
  let score = 0;

  keywords.forEach((keyword, index) => {
    if (combined.includes(keyword)) {
      // Higher score for earlier keywords (higher priority)
      score += keywords.length - index;
    }
  });

  return score;
}

/**
 * Check if URL should be excluded
 */
function shouldExclude(url) {
  const pathname = new URL(url).pathname.toLowerCase();

  return config.crawl.excludePatterns.some(pattern =>
    pathname.includes(pattern.replace(/\//g, ''))
  );
}

/**
 * Find relevant internal pages to crawl
 * @param {Page} page - Puppeteer page object
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Array>} - Sorted list of relevant pages to visit
 */
export async function findRelevantPages(page, baseUrl) {
  logger.info('Finding relevant pages to crawl...');

  try {
    const relevantLinks = await page.evaluate((base, keywords, maxPages) => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const candidates = [];

      links.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();

        try {
          const fullUrl = new URL(href, base);
          const baseDomain = new URL(base).hostname;

          // Only internal links
          if (fullUrl.hostname === baseDomain) {
            candidates.push({
              url: fullUrl.href,
              text,
              href,
            });
          }
        } catch (error) {
          // Invalid URL, skip
        }
      });

      return candidates;
    }, baseUrl, config.crawl.relevantKeywords, config.crawl.maxPages);

    // Filter and score links
    const scored = relevantLinks
      .filter(link => !shouldExclude(link.url))
      .map(link => ({
        ...link,
        score: scoreLinkRelevance(link.href, link.text, config.crawl.relevantKeywords),
      }))
      .filter(link => link.score > 0) // Only keep relevant links
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, config.crawl.maxPages); // Limit results

    // Deduplicate by URL
    const uniqueUrls = new Map();
    scored.forEach(link => {
      if (!uniqueUrls.has(link.url)) {
        uniqueUrls.set(link.url, link);
      }
    });

    const pages = Array.from(uniqueUrls.values());

    logger.success(`Found ${pages.length} relevant pages to crawl`);
    return pages;
  } catch (error) {
    logger.error('Failed to find relevant pages', { error: error.message });
    return [];
  }
}

/**
 * Crawl a single page and extract content
 * @param {Browser} browser - Puppeteer browser instance
 * @param {string} url - URL to crawl
 * @returns {Promise<Object>} - Page data
 */
export async function crawlPage(browser, url, scrapeHomepage, analyzeLinks) {
  logger.info(`Crawling page: ${url}`);

  let page = null;

  try {
    const { createStealthPage } = await import('../browser.js');
    page = await createStealthPage(browser);

    // Navigate to URL
    await navigateToUrl(page, url);

    // Extract data
    const [homepageData, linkData] = await Promise.all([
      scrapeHomepage(page, url),
      analyzeLinks(page, url),
    ]);

    await page.close();

    return {
      url,
      ...homepageData,
      links: linkData,
    };
  } catch (error) {
    logger.error(`Failed to crawl page: ${url}`, { error: error.message });

    if (page && !page.isClosed()) {
      await page.close();
    }

    return {
      url,
      error: error.message,
    };
  }
}

/**
 * Smart crawl: Visit homepage + relevant pages
 * @param {Browser} browser - Puppeteer browser instance
 * @param {Page} homePage - Homepage Puppeteer page
 * @param {string} baseUrl - Base URL
 * @returns {Promise<Object>} - All crawled data
 */
export async function smartCrawl(browser, homePage, baseUrl, scrapeHomepage, analyzeLinks) {
  logger.info(`Starting smart crawl for: ${baseUrl}`);

  const crawledData = {
    baseUrl,
    pages: [],
    submissionUrls: [],
    pricingInfo: null,
  };

  try {
    // Find relevant pages
    const relevantPages = await findRelevantPages(homePage, baseUrl);

    if (relevantPages.length === 0) {
      logger.info('No additional relevant pages found, crawling homepage only');
      return crawledData;
    }

    logger.info(`Crawling ${relevantPages.length} additional pages...`);

    // Crawl each relevant page
    for (const [index, pageInfo] of relevantPages.entries()) {
      logger.info(`[${index + 1}/${relevantPages.length}] Crawling: ${pageInfo.text}`);

      // Human-like delay between pages
      if (index > 0) {
        await humanDelay();
      }

      const pageData = await crawlPage(browser, pageInfo.url, scrapeHomepage, analyzeLinks);
      crawledData.pages.push(pageData);

      // Extract submission URLs
      if (pageData.links && pageData.links.quality.hasSubmissionLinks) {
        crawledData.submissionUrls.push(...pageData.links.quality.submissionUrls);
      }

      // Extract pricing info
      if (pageData.pricing && pageData.pricing.found && !crawledData.pricingInfo) {
        crawledData.pricingInfo = pageData.pricing;
      }
    }

    // Deduplicate submission URLs
    crawledData.submissionUrls = [...new Set(crawledData.submissionUrls)];

    logger.success(`Smart crawl complete: ${crawledData.pages.length} pages crawled`);
  } catch (error) {
    logger.error('Smart crawl failed', { error: error.message });
  }

  return crawledData;
}

export default {
  findRelevantPages,
  crawlPage,
  smartCrawl,
};
