/**
 * Browser Setup and Management
 * Handles Puppeteer browser initialization with stealth and proxy support
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import {
  getBrowserFingerprint,
  applyStealthTechniques,
  simulateMouseMovement,
  simulateScrolling,
} from "./utils/stealth.js";
import { withRetry } from "./utils/retry.js";

// Add stealth plugin
puppeteer.use(StealthPlugin());

let browserInstance = null;

/**
 * Launch browser with stealth and proxy configuration
 */
export async function launchBrowser() {
  if (browserInstance) {
    return browserInstance;
  }

  logger.info("Launching browser...");

  const { viewport, userAgent, timezone } = getBrowserFingerprint();
  const proxyUrl = config.proxy.getProxyUrl();

  const launchOptions = {
    ...config.browser,
    defaultViewport: viewport,
  };

  // Add proxy if enabled
  if (proxyUrl) {
    logger.info("Using Apify residential proxy");
    launchOptions.args.push(`--proxy-server=${proxyUrl}`);
  } else {
    logger.info("Running without proxy (direct connection)");
  }

  try {
    browserInstance = await puppeteer.launch(launchOptions);
    logger.success("Browser launched successfully");
    return browserInstance;
  } catch (error) {
    logger.error("Failed to launch browser", { error: error.message });
    throw error;
  }
}

/**
 * Create a new page with stealth configuration
 */
export async function createStealthPage(browser) {
  const page = await browser.newPage();

  // Set user agent if randomized
  const { userAgent, timezone } = getBrowserFingerprint();
  if (userAgent) {
    await page.setUserAgent(userAgent);
  }

  // Set timezone if enabled
  if (timezone) {
    await page.emulateTimezone(timezone);
  }

  // Apply additional stealth techniques
  await applyStealthTechniques(page);

  // Set extra HTTP headers to appear more human
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    DNT: "1",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
  });

  return page;
}

/**
 * Navigate to URL with retry logic and human-like behavior
 */
export async function navigateToUrl(page, url) {
  return await withRetry(
    async () => {
      logger.info(`Navigating to ${url}`);

      await page.goto(url, {
        waitUntil: config.navigation.waitUntil,
        timeout: config.navigation.timeout,
      });

      // Simulate human-like behavior
      await simulateMouseMovement(page);
      await simulateScrolling(page);

      logger.success(`Loaded ${url}`);
      return page;
    },
    {
      context: `Navigation to ${url}`,
      maxAttempts: 3,
    },
  );
}

/**
 * Take screenshot of current page
 */
export async function takeScreenshot(page, filepath) {
  try {
    await page.screenshot({
      path: filepath,
      fullPage: false,
      type: "png",
    });
    logger.debug(`Screenshot saved to ${filepath}`);
  } catch (error) {
    logger.warn("Failed to take screenshot", { error: error.message });
  }
}

/**
 * Close browser instance
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    logger.info("Browser closed");
  }
}

/**
 * Safe page close with error handling
 */
export async function closePage(page) {
  try {
    if (page && !page.isClosed()) {
      await page.close();
    }
  } catch (error) {
    logger.warn("Error closing page", { error: error.message });
  }
}

export default {
  launchBrowser,
  createStealthPage,
  navigateToUrl,
  takeScreenshot,
  closeBrowser,
  closePage,
};
