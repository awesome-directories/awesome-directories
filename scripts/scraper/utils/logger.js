/**
 * Structured Logger Utility
 * Provides consistent logging across the scraper
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(level = 'INFO') {
    this.level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    this.startTime = Date.now();
  }

  _log(level, message, data = {}) {
    if (LOG_LEVELS[level] < this.level) return;

    const timestamp = new Date().toISOString();
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);

    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';

    const prefix = `${colors[level]}[${level}]${reset} [${elapsed}s]`;

    if (Object.keys(data).length > 0) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  debug(message, data) {
    this._log('DEBUG', message, data);
  }

  info(message, data) {
    this._log('INFO', message, data);
  }

  warn(message, data) {
    this._log('WARN', message, data);
  }

  error(message, data) {
    this._log('ERROR', message, data);
  }

  success(message, data) {
    const green = '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(`${green}✓${reset} ${message}`, data || '');
  }

  progress(current, total, item = '') {
    const percentage = ((current / total) * 100).toFixed(1);
    const bar = this._createProgressBar(current, total);
    process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total}) ${item}`.padEnd(100));
    if (current === total) {
      process.stdout.write('\n');
    }
  }

  _createProgressBar(current, total, width = 30) {
    const filled = Math.floor((current / total) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}

export const logger = new Logger(process.env.LOG_LEVEL || 'INFO');
export default logger;
