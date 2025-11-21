/**
 * Scraper Configuration
 * Centralized configuration for web scraping operations
 */

export const config = {
  // Browser settings
  browser: {
    headless: true,
    executablePath: process.env.CHROME_PATH || undefined, // Auto-detect or use custom path
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--disable-blink-features=AutomationControlled',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
  },

  // Apify residential proxy configuration
  proxy: {
    enabled: process.env.USE_PROXY === 'true',
    apifyToken: process.env.APIFY_API_TOKEN || '',
    // Apify proxy format: http://auto:${token}@proxy.apify.com:8000
    getProxyUrl() {
      if (!this.enabled || !this.apifyToken) return null;
      return `http://auto:${this.apifyToken}@proxy.apify.com:8000`;
    },
  },

  // Stealth and anti-detection settings
  stealth: {
    enabled: true,
    randomizeUserAgent: true,
    randomizeViewport: true,
    emulateTimezone: true,
    emulateMouse: true,
  },

  // Navigation and timing
  navigation: {
    timeout: 30000, // 30 seconds
    waitUntil: 'networkidle2', // Wait for network to be mostly idle
    minDelay: 2000, // Minimum delay between requests (ms)
    maxDelay: 5000, // Maximum delay between requests (ms)
  },

  // Smart crawl settings
  crawl: {
    maxDepth: 2, // Maximum pages to crawl per directory
    maxPages: 5, // Maximum total pages to visit
    relevantKeywords: [
      'submit',
      'submission',
      'add',
      'pricing',
      'price',
      'about',
      'how-it-works',
      'guidelines',
      'terms',
    ],
    excludePatterns: [
      '/blog/',
      '/article/',
      '/news/',
      '/faq/',
      '/contact/',
      '/support/',
      '/privacy/',
    ],
  },

  // Link analysis settings
  links: {
    analyzeExternal: true,
    analyzeInternal: false,
    maxLinksToAnalyze: 100,
    relevantLinkPatterns: [
      'submit',
      'add-listing',
      'directory',
      'listing',
    ],
  },

  // Content extraction settings
  content: {
    extractHero: true,
    extractHeadings: true,
    extractFeatures: true,
    extractPricing: true,
    maxContentLength: 5000, // Max characters to extract
  },

  // Output settings
  output: {
    baseDir: './scripts/scraper-outputs',
    dataDir: './scripts/scraper-outputs/data',
    reportsDir: './scripts/scraper-outputs/reports',
    screenshotsDir: './scripts/scraper-outputs/screenshots',
    formats: {
      json: true,
      markdown: true,
      csv: true,
      screenshots: true,
    },
  },

  // Retry and error handling
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
  },

  // Supabase filters mapping
  filters: {
    // Map CLI args to Supabase column filters
    status: ['pending', 'approved', 'rejected', 'all'],
    limit: 10, // Default limit
    offset: 0,
  },
};

// User agent rotation
export const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
];

// Viewport sizes for randomization
export const viewportSizes = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
];

export default config;
