/**
 * Homepage Scraper
 * Extracts basic information from directory homepage
 */

import { logger } from '../utils/logger.js';
import { config } from '../config.js';

/**
 * Extract metadata from page
 */
async function extractMetadata(page) {
  return await page.evaluate(() => {
    const getMetaContent = (selector) => {
      const element = document.querySelector(selector);
      return element ? element.getAttribute('content') : null;
    };

    return {
      title: document.title || '',
      description: getMetaContent('meta[name="description"]') ||
                   getMetaContent('meta[property="og:description"]') ||
                   '',
      keywords: getMetaContent('meta[name="keywords"]') || '',
      ogImage: getMetaContent('meta[property="og:image"]') || '',
      siteName: getMetaContent('meta[property="og:site_name"]') || '',
      twitterCard: getMetaContent('meta[name="twitter:card"]') || '',
    };
  });
}

/**
 * Extract hero section content
 */
async function extractHeroContent(page) {
  return await page.evaluate(() => {
    const selectors = [
      'h1',
      '[class*="hero"] h1',
      '[class*="Hero"] h1',
      '[class*="heading"] h1',
      '[id*="hero"] h1',
    ];

    let heading = '';
    let subheading = '';

    // Find main heading
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        heading = element.textContent.trim();

        // Try to find subheading nearby
        const nextElement = element.nextElementSibling;
        if (nextElement && (nextElement.tagName === 'P' || nextElement.tagName === 'H2')) {
          subheading = nextElement.textContent.trim();
        }

        break;
      }
    }

    return { heading, subheading };
  });
}

/**
 * Extract key features or value propositions
 */
async function extractFeatures(page) {
  return await page.evaluate(() => {
    const features = [];

    // Look for common feature sections
    const selectors = [
      '[class*="feature"]',
      '[class*="Feature"]',
      '[class*="benefit"]',
      '[class*="Benefit"]',
      '[class*="why"]',
      '[class*="Why"]',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const heading = el.querySelector('h2, h3, h4');
        const text = el.querySelector('p');

        if (heading || text) {
          features.push({
            title: heading ? heading.textContent.trim() : '',
            description: text ? text.textContent.trim() : '',
          });
        }
      });

      if (features.length >= 5) break; // Limit to 5 features
    }

    return features;
  });
}

/**
 * Extract pricing information
 */
async function extractPricingInfo(page) {
  return await page.evaluate(() => {
    const pricing = {
      found: false,
      plans: [],
      freeOption: false,
    };

    // Look for pricing sections
    const selectors = [
      '[class*="pricing"]',
      '[class*="Pricing"]',
      '[class*="price"]',
      '[class*="Price"]',
      '[class*="plan"]',
      '[class*="Plan"]',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);

      elements.forEach(el => {
        const priceText = el.textContent.toLowerCase();

        // Check for free plan
        if (priceText.includes('free') && !priceText.includes('trial')) {
          pricing.freeOption = true;
          pricing.found = true;
        }

        // Extract price amounts
        const priceMatch = priceText.match(/\$(\d+(?:\.\d{2})?)/);
        if (priceMatch) {
          pricing.plans.push({
            amount: priceMatch[1],
            period: priceText.includes('month') ? 'month' : priceText.includes('year') ? 'year' : 'unknown',
          });
          pricing.found = true;
        }
      });

      if (pricing.found) break;
    }

    return pricing;
  });
}

/**
 * Extract all text content for description generation
 */
async function extractPageContent(page) {
  return await page.evaluate((maxLength) => {
    // Get main content, avoiding nav, footer, etc.
    const mainSelectors = [
      'main',
      '[role="main"]',
      '[class*="content"]',
      '[class*="Content"]',
      'article',
      'body',
    ];

    let contentElement = null;
    for (const selector of mainSelectors) {
      contentElement = document.querySelector(selector);
      if (contentElement) break;
    }

    if (!contentElement) {
      contentElement = document.body;
    }

    // Extract all paragraphs and headings
    const textElements = contentElement.querySelectorAll('h1, h2, h3, h4, p, li');
    const textContent = Array.from(textElements)
      .map(el => el.textContent.trim())
      .filter(text => text.length > 20) // Filter out very short text
      .join(' ')
      .slice(0, maxLength);

    return textContent;
  }, config.content.maxContentLength);
}

/**
 * Scrape homepage data
 * @param {Page} page - Puppeteer page object
 * @param {string} url - URL to scrape
 * @returns {Promise<Object>} - Scraped homepage data
 */
export async function scrapeHomepage(page, url) {
  logger.info(`Scraping homepage: ${url}`);

  try {
    const [metadata, hero, features, pricing, content] = await Promise.all([
      extractMetadata(page),
      extractHeroContent(page),
      extractFeatures(page),
      extractPricingInfo(page),
      extractPageContent(page),
    ]);

    const homepageData = {
      url,
      metadata,
      hero,
      features,
      pricing,
      content,
      scrapedAt: new Date().toISOString(),
    };

    logger.success(`Homepage scraped successfully: ${url}`);
    return homepageData;
  } catch (error) {
    logger.error(`Failed to scrape homepage: ${url}`, { error: error.message });
    throw error;
  }
}

export default scrapeHomepage;
