/**
 * Stealth and Anti-Detection Utilities
 * Makes the scraper behave more like a human user
 */

import { userAgents, viewportSizes, config } from "../config.js";

/**
 * Get random user agent
 */
export function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Get random viewport size
 */
export function getRandomViewport() {
  return viewportSizes[Math.floor(Math.random() * viewportSizes.length)];
}

/**
 * Get random timezone from common US timezones
 */
export function getRandomTimezone() {
  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "America/Denver",
    "America/Phoenix",
  ];
  return timezones[Math.floor(Math.random() * timezones.length)];
}

/**
 * Simulate human-like mouse movement on page
 */
export async function simulateMouseMovement(page) {
  if (!config.stealth.emulateMouse) return;

  try {
    const viewport = page.viewport();
    const steps = Math.floor(Math.random() * 5) + 3; // 3-7 movements

    for (let i = 0; i < steps; i++) {
      const x = Math.floor(Math.random() * viewport.width);
      const y = Math.floor(Math.random() * viewport.height);
      await page.mouse.move(x, y, {
        steps: Math.floor(Math.random() * 10) + 5,
      });
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 100 + 50),
      );
    }
  } catch (error) {
    // Ignore mouse movement errors
  }
}

/**
 * Simulate human-like scrolling
 */
export async function simulateScrolling(page) {
  try {
    const scrolls = Math.floor(Math.random() * 3) + 2; // 2-4 scrolls

    for (let i = 0; i < scrolls; i++) {
      await page.evaluate(
        (scroll) => {
          window.scrollBy(0, scroll);
        },
        Math.floor(Math.random() * 500) + 300,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 500 + 300),
      );
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
  } catch (error) {
    // Ignore scroll errors
  }
}

/**
 * Apply stealth techniques to page
 */
export async function applyStealthTechniques(page) {
  // Override navigator properties to avoid detection
  await page.evaluateOnNewDocument(() => {
    // Override the navigator.webdriver property
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });

    // Override navigator.plugins to appear more realistic
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });

    // Override navigator.languages
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });

    // Mock chrome runtime
    window.chrome = {
      runtime: {},
    };

    // Override permissions query
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });
}

/**
 * Generate browser fingerprint variations
 */
export function getBrowserFingerprint() {
  const viewport = config.stealth.randomizeViewport
    ? getRandomViewport()
    : config.browser.defaultViewport;

  const userAgent = config.stealth.randomizeUserAgent
    ? getRandomUserAgent()
    : undefined;

  const timezone = config.stealth.emulateTimezone
    ? getRandomTimezone()
    : undefined;

  return {
    viewport,
    userAgent,
    timezone,
  };
}

export default {
  getRandomUserAgent,
  getRandomViewport,
  getRandomTimezone,
  simulateMouseMovement,
  simulateScrolling,
  applyStealthTechniques,
  getBrowserFingerprint,
};
