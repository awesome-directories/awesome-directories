/**
 * Retry Utility with Exponential Backoff
 * Handles retries for network requests and scraping operations
 */

import { logger } from "./logger.js";
import { config } from "../config.js";

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Random delay between min and max
 */
export const randomDelay = (min = 2000, max = 15000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return sleep(delay);
};

/**
 * Execute function with retry logic and exponential backoff
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the function
 */
export async function withRetry(fn, options = {}) {
  const {
    maxAttempts = config.retry.maxAttempts,
    backoffMultiplier = config.retry.backoffMultiplier,
    initialDelay = config.retry.initialDelay,
    onRetry = null,
    context = "operation",
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        logger.error(`${context} failed after ${maxAttempts} attempts`, {
          error: error.message,
        });
        throw error;
      }

      const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
      logger.warn(
        `${context} failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`,
        {
          error: error.message,
        },
      );

      if (onRetry) {
        await onRetry(attempt, error);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Human-like delay between actions
 */
export async function humanDelay() {
  const { minDelay, maxDelay } = config.navigation;
  await randomDelay(minDelay, maxDelay);
}

export default {
  sleep,
  randomDelay,
  withRetry,
  humanDelay,
};
