# Awesome Directories Web Scraper

Automated web scraper to speed up directory curation by extracting metadata, analyzing links, and generating curation suggestions.

## Features

- 🔍 **Smart Crawling**: Automatically finds submission, pricing, and about pages
- 🔗 **Link Analysis**: Detects dofollow/nofollow links and submission URLs
- 📝 **Content Extraction**: Extracts hero copy, features, and pricing information
- 🤖 **Human-like Behavior**: Stealth mode with randomized fingerprints
- 🌐 **Proxy Support**: Apify residential proxy integration
- 📊 **Multiple Outputs**: JSON, Markdown reports, and CSV exports
- 🎯 **Quality Scoring**: Auto-calculates quality scores for curation priority
- 🗄️ **Supabase Integration**: Fetch directories with flexible filtering

## Installation

### Prerequisites

1. **Bun or Node.js 18+**
2. **Chrome/Chromium** (required for Puppeteer)
3. **Supabase credentials**
4. **Apify API token** (optional, for proxy)

### Install Chrome/Chromium

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install chromium-browser
```

**macOS:**
```bash
brew install --cask google-chrome
```

**Or specify custom Chrome path:**
```bash
export CHROME_PATH=/path/to/chrome
```

### Install Dependencies

```bash
# Already installed if you set up the main project
bun install
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Required: Supabase credentials
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Apify proxy
APIFY_API_TOKEN=your-apify-token
USE_PROXY=false

# Optional: Custom Chrome path
CHROME_PATH=/usr/bin/chromium-browser

# Optional: Logging
LOG_LEVEL=INFO
```

## Usage

### Basic Usage

```bash
# Scrape 10 pending directories
bun run scrape

# Scrape with specific limit
bun run scrape --limit 5

# Show help
bun run scrape --help
```

### Filter Options

```bash
# Filter by status
bun run scrape --status pending --limit 10
bun run scrape --status approved --limit 20

# Filter by categories
bun run scrape --categories "SaaS,Marketing" --limit 10

# Filter by pricing type
bun run scrape --pricing-type free --limit 10

# Filter by domain rating
bun run scrape --min-dr 50 --max-dr 80 --limit 10

# Only dofollow directories
bun run scrape --dofollow --limit 10

# Combine filters
bun run scrape --status pending --categories "Developer Tools" --dofollow --limit 5
```

### Data Source

```bash
# Scrape from pending_directories table (default)
bun run scrape --source pending --limit 10

# Scrape from main directories table
bun run scrape --source directories --limit 10
```

### Advanced Options

```bash
# Enable Apify proxy
bun run scrape --proxy --limit 5

# Disable smart crawl (homepage only)
bun run scrape --smart-crawl false --limit 10

# Disable screenshots
bun run scrape --screenshots false --limit 10

# Custom output directory
bun run scrape --output ./my-scrapes --limit 5

# Pagination
bun run scrape --limit 10 --offset 10
```

## Output Files

The scraper generates multiple output formats in `scripts/scraper-outputs/`:

```
scraper-outputs/
├── data/
│   ├── {directory-id}.json          # Individual JSON data files
│   └── ...
├── reports/
│   ├── {directory-id}.md            # Individual Markdown reports
│   └── ...
├── screenshots/
│   ├── {directory-id}.png           # Homepage screenshots
│   └── ...
├── summary.json                     # Aggregated JSON summary
├── SUMMARY.md                       # Human-readable summary report
└── scraped-directories.csv          # CSV export for spreadsheet review
```

### JSON Output

Each directory gets a detailed JSON file with:
- Metadata (title, description, keywords)
- Hero section content
- Features list
- Pricing information
- Link analysis (dofollow/nofollow stats)
- Submission URLs
- Smart crawl results
- Curation suggestions
- Quality score

### Markdown Reports

Human-readable reports with:
- Quality score indicator
- Curation suggestions
- Link analysis
- Submission process info
- Pricing insights
- Page content summaries

### CSV Export

Spreadsheet-friendly export with columns:
- Directory name and URL
- Quality score
- Suggested description and categories
- Link quality assessment
- Pricing info
- Submission URLs
- Statistics (total links, dofollow/nofollow counts)

## Testing

Run the test suite to verify scraper functionality:

```bash
bun run scrape:test
```

This tests core functions on real-world directory sites (Product Hunt, Indie Hackers).

## Architecture

### Core Modules

- **browser.js** - Puppeteer setup with stealth and proxy
- **data-fetcher.js** - Supabase integration with filtering
- **scrapers/homepage.js** - Homepage content extraction
- **scrapers/links.js** - Link analysis and dofollow detection
- **scrapers/smart-crawl.js** - Intelligent page discovery
- **scrapers/content.js** - Curation suggestion generation
- **output/** - JSON, Markdown, and CSV formatters
- **utils/** - Logger, retry logic, stealth techniques

### Scraping Flow

1. **Fetch** directories from Supabase with filters
2. **Launch** browser with stealth configuration
3. **Navigate** to homepage with human-like behavior
4. **Extract** metadata, hero, features, pricing
5. **Analyze** all links for dofollow/nofollow
6. **Crawl** relevant pages (submission, pricing, about)
7. **Compile** all data and generate suggestions
8. **Export** to JSON, Markdown, and CSV
9. **Repeat** for each directory with delays

### Anti-Detection Features

- Puppeteer Stealth Plugin
- Randomized user agents
- Randomized viewport sizes
- Timezone emulation
- Mouse movement simulation
- Human-like delays between actions
- Apify residential proxy support

## Quality Scoring

Directories are scored 0-100 based on:

- **Description quality** (20 points) - Has meaningful description
- **Features** (20 points) - Has 3+ features listed
- **Dofollow links** (30 points) - Provides dofollow backlinks
- **Submission links** (15 points) - Has clear submission process
- **Pricing info** (15 points) - Pricing is visible

## CLI Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `-s, --source` | string | `pending` | Data source: `pending` or `directories` |
| `--status` | string | `pending` | Status filter: `pending`, `approved`, `rejected`, `all` |
| `--categories` | string | - | Comma-separated categories |
| `--pricing-type` | string | - | Pricing type: `free`, `paid`, `freemium` |
| `--min-dr` | number | - | Minimum domain rating |
| `--max-dr` | number | - | Maximum domain rating |
| `--dofollow` | boolean | - | Only dofollow directories |
| `-l, --limit` | number | `10` | Number of directories to scrape |
| `--offset` | number | `0` | Pagination offset |
| `--proxy` | boolean | `false` | Enable Apify proxy |
| `--smart-crawl` | boolean | `true` | Enable smart crawling |
| `--screenshots` | boolean | `true` | Take screenshots |
| `-o, --output` | string | `./scripts/scraper-outputs` | Output directory |
| `-h, --help` | boolean | - | Show help message |

## Troubleshooting

### Chrome not found

If you get "Chrome not found" errors:

1. Install Chrome/Chromium:
   ```bash
   sudo apt install chromium-browser  # Ubuntu/Debian
   brew install --cask google-chrome  # macOS
   ```

2. Or set custom path:
   ```bash
   export CHROME_PATH=/usr/bin/chromium-browser
   ```

### Supabase connection errors

Make sure your `.env` file has valid credentials:
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Proxy errors

If using `--proxy`, ensure you have a valid Apify token:
```bash
APIFY_API_TOKEN=your-token
USE_PROXY=true
```

### Rate limiting

If you encounter rate limiting:

1. Reduce concurrency (scrape fewer at a time)
2. Enable proxy: `--proxy`
3. Increase delays in `config.js`

## Examples

### Typical Workflow

```bash
# 1. Scrape 10 pending directories to review
bun run scrape --status pending --limit 10

# 2. Review the CSV in spreadsheet software
open scripts/scraper-outputs/scraped-directories.csv

# 3. Read detailed markdown reports
cat scripts/scraper-outputs/reports/*.md

# 4. Scrape more with specific filters
bun run scrape --status pending --dofollow --min-dr 40 --limit 20

# 5. Export high-quality directories
bun run scrape --source directories --min-dr 70 --limit 50
```

### Curation Priority

```bash
# High-quality free directories
bun run scrape --pricing-type free --dofollow --min-dr 50 --limit 20

# SaaS-focused directories
bun run scrape --categories "SaaS,Developer Tools" --limit 15

# New submissions to review
bun run scrape --status pending --limit 30
```

## Performance

- **Average scrape time**: 10-20 seconds per directory
- **With smart crawl**: 30-60 seconds per directory
- **Recommended batch size**: 10-20 directories at a time
- **Proxy recommended for**: 50+ directories

## License

Apache 2.0 (same as parent project)

## Support

For issues or questions:
- Check this README
- Review test output: `bun run scrape:test`
- Check logs (set `LOG_LEVEL=DEBUG`)
- Open an issue in the main repository
