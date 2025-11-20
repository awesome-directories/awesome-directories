# Claude Context: Awesome Directories

## Project Overview

**Awesome Directories** is a curated directory aggregator web application that helps indie hackers, bootstrappers, and solopreneurs discover high-quality product launch directories for their SaaS products. The site aggregates 388+ verified directories with advanced filtering capabilities.

- **Live Site**: https://awesome-directories.com
- **Repository**: awesome-directories/awesome-directories
- **License**: Apache 2.0
- **Hosting**: GitHub Pages (static SSG)
- **Architecture**: Astro.js Static Site Generation with Vue.js islands for interactivity

### Core Value Proposition

- Curated, verified directories updated weekly
- Advanced filtering by Domain Rating (DR), category, pricing, and link type
- User authentication with favorites and submission tracking (implemented)
- Directory detail pages with related directories and voting
- User directory submission system with review workflow
- Automated SEO metrics updates via Ahrefs API and Supabase Edge Functions
- Comprehensive statistics page with interactive charts
- Blog with SEO-optimized content, tags, search, and RSS feed

## Technology Stack

### Frontend Framework

- **Astro.js 5** (Static Site Generation with Content Collections)
- **Vue.js 3** (Composition API for interactive islands/components)
- **Vite 7** (build tool, dev server on port 3000)
- **Tailwind CSS 4** (utility-first CSS with PostCSS)
- **TypeScript-ready** (ES modules)

**Important**: The project migrated from a Vue.js SPA to Astro.js SSG for better SEO and performance. Vue components are used for interactive features via Astro's component islands. Astro Content Collections power the blog system.

### Key Libraries

- `@supabase/supabase-js` - Database client (build-time and runtime)
- `@astrojs/rss` - RSS feed generation for blog
- `chart.js` - Interactive charts for statistics page
- `pagefind` - Static search indexing for blog
- `html2canvas + jsPDF` - PDF export functionality
- `papaparse` - CSV parsing/export
- `slugify` - URL slug generation
- `nanostores` - Lightweight state management
- `uhtml` - Lightweight DOM rendering
- `ky` - HTTP client
- `loglevel` - Logging utility

### Backend & Services

- **Supabase** - PostgreSQL + Auth + Realtime
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Edge Functions** (Deno runtime)
  - `update-seo-data` - Updates Ahrefs metrics via pg_cron scheduled jobs
- **Mautic** - Self-hosted CRM for newsletter (crm.meysam.io) - _planned/optional_
- **Pirsch** - Privacy-first analytics - _optional_
- **Ahrefs API** - SEO metrics (DR, traffic estimates)
- **Giscus** - GitHub Discussions for comments - _optional_

### Package Management

- **Bun** (primary - faster than npm/yarn)
- **npm** also supported (package-lock.json present)

### Deployment & CI/CD

- **GitHub Pages** (production hosting)
- **GitHub Actions** (build and deploy pipeline)
- **Netlify** (PR preview deployments)

## Project Structure

```
/
├── .github/workflows/
│   └── ci.yml                      # CI/CD pipeline
├── public/                         # Static assets
│   ├── data/                       # Generated at build time
│   │   ├── directories.json        # All directories data
│   │   └── stats.json              # Statistics data for charts
│   ├── pagefind/                   # Search index (generated)
│   └── robots.txt                  # SEO robots file
├── src/
│   ├── pages/                      # Astro pages (file-based routing)
│   │   ├── index.astro            # Home page (directory listing)
│   │   ├── about.astro            # About page
│   │   ├── stats.astro            # Statistics page with charts
│   │   ├── terms.astro            # Terms of Service
│   │   ├── privacy.astro          # Privacy Policy
│   │   ├── favorites.astro        # User favorites page (auth required)
│   │   ├── submissions.astro      # User submissions tracker (auth required)
│   │   ├── submit.astro           # Submit new directory form (auth required)
│   │   ├── 404.astro              # 404 error page
│   │   ├── directory/
│   │   │   └── [slug].astro       # Dynamic directory detail pages
│   │   └── blog/
│   │       ├── index.astro        # Blog listing page
│   │       ├── [slug].astro       # Individual blog post pages
│   │       ├── [...page].astro    # Blog pagination
│   │       └── tags/
│   │           ├── [tag].astro    # Posts by tag
│   │           └── [tag]/[...page].astro # Tag pagination
│   ├── content/
│   │   ├── config.ts              # Content collections schema
│   │   └── blog/                  # Blog posts (Markdown)
│   │       ├── getting-started-with-directory-submissions.md
│   │       ├── building-a-launch-strategy.md
│   │       ├── top-free-directories-for-saas.md
│   │       ├── seo-benefits-of-directory-submissions.md
│   │       └── ...                # More blog posts
│   ├── layouts/
│   │   └── BaseLayout.astro       # Base HTML layout with SEO
│   ├── components/
│   │   ├── AppHeader.astro        # Main navigation (static)
│   │   ├── AppFooter.astro        # Footer (static)
│   │   ├── Logo.astro             # Logo component
│   │   ├── DirectoryCard.vue      # Directory item (Vue island)
│   │   ├── DirectoryFilter.vue    # Filters sidebar (Vue island)
│   │   ├── DirectoryListContent.vue # Main directory listing (Vue island)
│   │   ├── DirectoryDetailActions.vue # Favorite/vote actions on detail page
│   │   ├── AuthModal.vue          # OAuth modal (Vue island)
│   │   ├── AuthModalWrapper.vue   # Auth modal wrapper component
│   │   ├── ChecklistModal.vue     # Export modal (Vue island)
│   │   ├── FavoriteButton.vue     # Favorite button component
│   │   ├── FavoritesContent.vue   # Favorites page content
│   │   ├── SubmissionsContent.vue # Submissions tracker content
│   │   ├── SubmitDirectoryForm.vue # Directory submission form
│   │   ├── GithubStars.vue        # GitHub stars badge (Vue island)
│   │   ├── StatsCards.vue         # Statistics overview cards (Vue island)
│   │   ├── StatsCharts.vue        # Interactive Chart.js charts (Vue island)
│   │   ├── TopDirectoriesTable.vue # Top directories rankings (Vue island)
│   │   ├── BlogCard.astro         # Blog post card component
│   │   ├── Pagination.astro       # Pagination component
│   │   ├── RelatedPosts.astro     # Related blog posts
│   │   ├── ShareButtons.astro     # Social sharing buttons
│   │   ├── ShareButton.astro      # Individual share button
│   │   ├── TableOfContents.astro  # Blog post TOC
│   │   └── GiscusComments.astro   # GitHub Discussions comments
│   ├── composables/                # Vue Composition API logic
│   │   ├── useAuth.js             # Authentication (client-side)
│   │   ├── useDirectories.js      # Data filtering (client-side)
│   │   ├── useDirectory.js        # Single directory operations (favorite, vote)
│   │   └── useMauticNewsletter.js # Newsletter subscription
│   ├── lib/
│   │   ├── supabase-server.js     # Supabase client (build-time)
│   │   ├── supabase-client.js     # Supabase client (runtime)
│   │   ├── supabase.js            # Shared Supabase utilities
│   │   ├── logger.js              # Logging utility
│   │   ├── httpclient.js          # HTTP client wrapper
│   │   └── data/
│   │       └── directories.js     # Data fetching helpers
│   ├── stores/
│   │   └── auth.js                # Nanostores for auth state
│   ├── integrations/
│   │   ├── save-directories.js    # Astro integration to save directories
│   │   ├── save-stats.js          # Astro integration to save stats
│   │   └── pagefind.js            # Pagefind search integration
│   ├── utils/
│   │   ├── auth.js                # Authentication utilities
│   │   └── blog.ts                # Blog utilities (reading time, TOC, related posts)
│   ├── env.d.ts                   # TypeScript environment types
│   └── style.css                  # Global Tailwind imports
├── supabase/
│   ├── config.toml                # Supabase project config
│   ├── migrations/
│   │   ├── 001_initial_schema.sql # Core schema (directories, votes, favorites, etc.)
│   │   ├── 002_pending_directories.sql # User directory submissions
│   │   ├── 003_add_moz_metrics.sql # Moz API integration fields
│   │   ├── 004_setup_cron_jobs.sql # pg_cron for automated updates
│   │   └── 005_setup_http_extension.sql # HTTP extension for webhooks
│   ├── seeds/
│   │   ├── directories.sql        # SQL seed data
│   │   └── directories.json       # JSON seed data
│   └── functions/
│       └── update-seo-data/       # Edge function for SEO updates
│           ├── index.ts           # Main function handler
│           ├── ahrefs.ts          # Ahrefs API integration
│           ├── utils.ts           # Helper utilities
│           └── deno.json          # Deno configuration
├── scripts/
│   ├── parse-directories.js       # Parse dataset
│   ├── seed-database.js           # Populate database
│   ├── update-dr-scores.js        # Update DR from Moz (legacy)
│   └── convert-svgs.js            # SVG optimization
├── astro.config.mjs               # Astro configuration
├── vite.config.js                 # Vite build config (via Astro)
├── tailwind.config.js             # Tailwind config
├── tsconfig.json                  # TypeScript config
├── postcss.config.js              # PostCSS config
├── package.json                   # Dependencies & scripts
├── bun.lock                       # Bun lockfile
├── renovate.json                  # Renovate bot config
└── .env.example                   # Environment variables template
```

## Development Setup

### Prerequisites

- Bun (primary) or Node.js 18+
- Supabase account (free tier)
- GitHub account (for Giscus - optional)

### Quick Start

```bash
# Install dependencies
bun install  # or: npm install

# Copy environment variables
cp .env.example .env

# Start dev server (Astro dev mode)
bun start  # Runs on http://localhost:3000

# Build for production (static site)
bun run build

# Preview production build
bun run preview
```

### Environment Variables

Required in `.env`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Optional (for full features):

```env
VITE_MAUTIC_BASE_URL=https://mautic.your-domain.com
VITE_MAUTIC_FORM_ID=<form-id>
VITE_PIRSCH_SITE_ID=<site-id>
VITE_GITHUB_REPO=awesome-directories/awesome-directories
VITE_GITHUB_REPO_ID=<repo-id>
VITE_GITHUB_CATEGORY=Announcements
VITE_GITHUB_CATEGORY_ID=<category-id>
```

For Supabase Edge Functions:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
APIFY_API_TOKEN=<apify-token>  # For Ahrefs data scraping
FUNCTION_SECRET=<optional-secret>  # For function authentication
```

### Available Scripts

- `bun start` - Start Astro development server (port 3000)
- `bun run build` - Build static site for production
- `bun run preview` - Preview production build locally

## Database Schema

### Core Tables

1. **directories**
   - Primary table for all directory listings
   - Slug-based unique identifiers
   - Includes: DR scores, categories (array), pricing, traffic estimates
   - Engagement: helpful_count, view_count
   - Status tracking and timestamps
   - SEO fields: domain_rating, organic_traffic, organic_keywords
   - Metadata: is_affiliate, affiliate_url, github_pr_number, added_by

2. **directory_votes**
   - IP-based voting for "helpful" clicks
   - One vote per IP per directory
   - Supports both authenticated and anonymous voting
   - Auto-increments/decrements helpful_count via triggers

3. **user_favorites**
   - User-specific saved directories (auth required)
   - One-to-many relationship: user → directories
   - Unique constraint per user/directory pair

4. **user_submissions**
   - Track user submission status per directory
   - Status: pending, submitted, approved, rejected
   - Personal notes field for tracking
   - Unique constraint per user/directory pair

5. **pending_directories**
   - User-submitted directories awaiting admin review
   - Full directory information (name, URL, description, categories, etc.)
   - Review workflow: pending → approved/rejected
   - Admin notes and reviewer tracking
   - Unique constraint per user/URL to prevent duplicates

6. **newsletter_signups**
   - Email capture with Mautic integration
   - Tracks subscription/unsubscription status
   - Mautic contact ID for synchronization

### Key Indexes

- Categories: GIN index for array queries
- Domain Rating: DESC (nulls last)
- Slug, is_active status, pricing type

### Row Level Security (RLS)

- Enabled on user-specific tables (favorites, submissions)
- Public read access on directories table

## Architecture Patterns

### Build-time vs Runtime

**Build-time** (Astro SSG):

- Fetch all directories from Supabase during build
- Generate static HTML pages with full content
- Save directories.json to `public/data/` for client-side filtering
- SEO metadata embedded in static HTML

**Runtime** (Client-side):

- Load directories.json for filtering/search
- Interactive Vue components for filters, modals
- Optional: Auth, favorites, voting (requires Supabase client)

### Data Flow

1. **Build Process**:

   ```
   Supabase DB → Astro Build → Static HTML + directories.json → GitHub Pages
   ```

2. **Client Interaction**:

   ```
   User → Vue Component → directories.json → Filtered Results
   User → Vote/Favorite → Supabase API → Database
   ```

3. **SEO Updates** (Automated):
   ```
   Supabase pg_cron → Edge Function → Ahrefs API → Update DB → Rebuild Site
   ```

### Key Integrations

#### Save Directories Integration

Custom Astro integration (`src/integrations/save-directories.js`):

- Hooks into `astro:server:setup` and `astro:build:done`
- Fetches all directories from Supabase
- Saves to `public/data/directories.json` for client-side use
- Ensures data is available in both dev and production

#### Save Stats Integration

Custom Astro integration (`src/integrations/save-stats.js`):

- Calculates comprehensive statistics from directories data
- Saves to `public/data/stats.json` for client-side charts
- Statistics include:
  - Total counts (directories, votes, categories)
  - Category distribution
  - Pricing breakdown (free/paid/freemium)
  - Link type distribution (dofollow/nofollow)
  - Domain Rating ranges
  - Recent additions timeline

#### Pagefind Integration

Custom Astro integration (`src/integrations/pagefind.js`):

- Generates static search index for blog posts
- Runs after build to index content
- Outputs to `public/pagefind/`
- Provides fast, client-side search without server

#### Supabase Edge Function

`supabase/functions/update-seo-data/`:

- Deno-based serverless function
- Triggered by Supabase pg_cron (scheduled jobs)
- Fetches Ahrefs metrics via Apify API
- Updates directories table with latest SEO data
- Batch processing to avoid API rate limits

## Key Composables & Logic

### useDirectories.js

Client-side data filtering and search:

- Loads directories from `/data/directories.json`
- Methods: `filterDirectories()`, `searchDirectories()`, `sortDirectories()`
- Filters: category, DR range, link type, pricing, search query
- Sorting: Most Helpful, Highest DR, Newest, Alphabetical
- Client-side pagination

### useAuth.js

Manages authentication state:

- State: `user`, `session`, `loading`
- Methods: `signInWithGoogle()`, `signInWithGithub()`, `signOut()`, `refreshSession()`
- Auto-refresh token and persistent session
- Auth state change listener
- Used by protected pages (favorites, submissions, submit)

### useDirectory.js

Single directory operations and state management:

- Methods: `toggleFavorite()`, `toggleHelpful()`, `checkFavoriteStatus()`, `checkVoteStatus()`
- Manages user interactions with individual directories
- Handles favorite/unfavorite actions with optimistic updates
- IP-based voting for anonymous users
- User-based voting for authenticated users
- Real-time state synchronization with Supabase

### useMauticNewsletter.js (Optional)

Newsletter subscription to Mautic CRM:

- Captures email, name, product name
- Error handling and validation

## Routing

### File-based Routing (Astro)

- `/` - Home (index.astro) - directory listing with filters
- `/about` - About page (about.astro)
- `/stats` - Statistics page (stats.astro) - interactive charts and analytics
- `/terms` - Terms of Service (terms.astro)
- `/privacy` - Privacy Policy (privacy.astro)
- `/favorites` - User favorites page (favorites.astro) - requires authentication
- `/submissions` - User submissions tracker (submissions.astro) - requires authentication
- `/submit` - Submit new directory form (submit.astro) - requires authentication
- `/directory/[slug]` - Dynamic directory detail pages (directory/[slug].astro)
  - Generated statically at build time via `getStaticPaths()`
  - Includes SEO metrics, related directories, and user actions
  - Breadcrumb navigation and structured data
- `/blog` - Blog listing with search and pagination
- `/blog/[slug]` - Individual blog posts with TOC, related posts, comments
- `/blog/[...page]` - Blog pagination (page 2, 3, etc.)
- `/blog/tags/[tag]` - Posts filtered by tag
- `/blog/tags/[tag]/[...page]` - Tag pagination
- `/404` - 404 error page (404.astro)

### Dynamic Route Generation

The `/directory/[slug]` route uses Astro's static path generation:

- All directory pages are pre-rendered at build time
- Uses `getStaticPaths()` to fetch all directories from Supabase
- Each page includes full SEO metadata and structured data (Product schema)
- Related directories are computed based on shared categories
- Supports social sharing with OpenGraph and Twitter Cards

### Blog System

The blog uses Astro Content Collections with Markdown files:

- **Content schema**: Defined in `src/content/config.ts` with Zod validation
- **Post frontmatter**: title, description, date, tags, author, coverImage, draft, relatedPosts
- **Utilities**: `src/utils/blog.ts` provides helpers for:
  - `getPublishedPosts()` - Fetch and filter published posts
  - `calculateReadingTime()` - Estimate reading time
  - `generateTableOfContents()` - Extract headings for TOC
  - `findRelatedPosts()` - Find posts with shared tags
  - `getAllTags()` - Get unique tags across all posts
  - `paginate()` - Paginate any item array
- **Search**: Pagefind integration for static search
- **Comments**: Giscus (GitHub Discussions) integration

Blog posts support:

- Draft mode (hidden in production)
- Future scheduling (hidden until publish date)
- Auto-generated related posts based on tags
- Custom related posts via frontmatter
- Social sharing buttons (X, LinkedIn, Facebook, Reddit)
- BlogPosting schema structured data

## Build Configuration

### Astro Config (`astro.config.mjs`)

- **Output**: `static` (SSG mode)
- **Site**: https://awesome-directories.com
- **Dev server**: port 3000
- **Integrations**:
  - `@astrojs/vue` - Vue component support
  - `@astrojs/sitemap` - Automatic sitemap generation
  - `@playform/compress` - Gzip + Brotli compression
  - `saveDirectoriesIntegration()` - Custom integration to save directories.json
  - `saveStatsIntegration()` - Custom integration to save stats.json
  - `pagefindIntegration()` - Static search indexing for blog

### Vite Config (via Astro)

- **Minification**: Terser (production)
  - Drop console logs in production
  - Safari 10 compatibility
  - Multiple compression passes
- **CSS minification**: LightningCSS
- **Code splitting**: Automatic with manual chunk optimization
  - Separate chunks for: supabase, html2canvas, jspdf, papaparse, nanostores, chartjs, vue
- **Bundle analysis**: Available via visualizer plugin
- **Aliases**: `@` → `./src`

### Tailwind Config

- Content paths: `src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}`
- Minimal config (uses Tailwind v4 defaults)
- PostCSS plugin integration

## Deployment Pipeline

### GitHub Actions (`ci.yml`)

**On Pull Request:**

1. Checkout code
2. Cache node_modules
3. Setup Bun
4. Install dependencies (`bun install`)
5. Build with environment secrets (`bun run build`)
6. Upload Pages artifact
7. Deploy to Netlify for preview
8. Comment on PR with preview URL

**On Push to Main:**

1. Checkout code
2. Cache node_modules
3. Setup Bun
4. Setup GitHub Pages
5. Install dependencies (`bun install`)
6. Build with environment secrets (`bun run build`)
7. Upload Pages artifact
8. Deploy to GitHub Pages

**Scheduled (daily at midnight UTC):**

- Placeholder for future automated DR updates (currently handled by Supabase pg_cron)

### Required Secrets

For GitHub Actions:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_MAUTIC_BASE_URL`, `VITE_MAUTIC_FORM_ID` (optional)
- `VITE_PIRSCH_SITE_ID` (optional)
- `VITE_GITHUB_*` (optional, for Giscus)
- `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

For Supabase Edge Functions:

- `SUPABASE_SERVICE_ROLE_KEY`
- `APIFY_API_TOKEN` (for Ahrefs data)
- `FUNCTION_SECRET` (optional)

## SEO & Performance Optimization

### SEO Features

- **Structured Data**: Schema.org markup (WebSite, WebApplication, BreadcrumbList)
- **Meta Tags**: Comprehensive Open Graph, Twitter Cards
- **Canonical URLs**: Proper canonical link tags
- **Sitemap**: Auto-generated via `@astrojs/sitemap`
- **Robots.txt**: Configured for crawlers with sitemap reference
- **Performance Headers**: DNS prefetch, preconnect
- **Security Headers**: Content security, referrer policy

### Performance Optimizations

- **Static Site Generation**: Fast page loads, no client-side routing overhead
- **Code Splitting**: Vendor chunks for optimal caching
- **Compression**: Gzip level 9 + Brotli level 11
- **Image Optimization**: Sharp for image processing
- **CSS Optimization**: LightningCSS minification
- **JS Optimization**: Terser with aggressive settings
- **Bundle Analysis**: Visualizer plugin for monitoring

## Data Management

### Seed Data

- 388+ directories in JSON format
- Location: `supabase/seeds/directories.json`
- Parser script: `scripts/parse-directories.js`
- Manual updates via PR to seed data file

### SEO Metrics Updates

- **Automated** via Supabase pg_cron (daily/weekly)
- Triggers `update-seo-data` Edge Function
- Fetches Ahrefs metrics (DR, organic traffic, keywords)
- Updates directories table
- Site rebuild triggered automatically (if configured)

### DR Score Updates (Legacy)

- Legacy script: `scripts/update-dr-scores.js` (Moz API)
- Replaced by Ahrefs integration via Edge Function

## Important Patterns & Conventions

### Component Structure

- **Astro Components** (`.astro`): For static, server-rendered content
- **Vue Components** (`.vue`): For interactive features (islands)
- Vue 3 Composition API with `<script setup>`
- Composables for shared logic
- Prop validation and TypeScript types where applicable

### Key Vue Island Components

1. **DirectoryListContent.vue** - Main directory listing with filters and search
2. **DirectoryDetailActions.vue** - Favorite/vote actions on directory detail pages
3. **FavoritesContent.vue** - User's saved directories with management
4. **SubmissionsContent.vue** - User's submission tracking dashboard
5. **SubmitDirectoryForm.vue** - Directory submission form with validation
6. **FavoriteButton.vue** - Reusable favorite toggle button
7. **DirectoryFilter.vue** - Advanced filtering sidebar
8. **DirectoryCard.vue** - Individual directory card component
9. **AuthModal.vue** / **AuthModalWrapper.vue** - Authentication modals
10. **ChecklistModal.vue** - Multi-select export functionality
11. **StatsCards.vue** - Overview statistics cards
12. **StatsCharts.vue** - Interactive Chart.js charts (pie, bar, doughnut)
13. **TopDirectoriesTable.vue** - Top directories rankings by various metrics

### Key Astro Components

1. **BlogCard.astro** - Blog post preview card
2. **Pagination.astro** - Reusable pagination component
3. **RelatedPosts.astro** - Related blog posts section
4. **ShareButtons.astro** - Social sharing buttons
5. **TableOfContents.astro** - Sticky blog post TOC
6. **GiscusComments.astro** - GitHub Discussions comments

All Vue components use `client:load` directive in Astro pages for client-side hydration.

### State Management

- **Nanostores** for minimal global state (auth)
- Composables for component-level state
- No Vuex/Pinia
- Client-side caching where needed

### API Interactions

- **Build-time**: Supabase server client (`src/lib/supabase-server.js`)
- **Runtime**: Supabase client (`src/lib/supabase-client.js`)
- Error handling with user-friendly messages
- Loading states for async operations
- Logging via `loglevel`

### Styling

- Tailwind CSS utility classes
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance (goal)
- Semantic HTML structure

### Authentication

- Google & GitHub OAuth via Supabase
- Session persistence in localStorage
- Auth state reactivity via nanostores
- Protected pages: `/favorites`, `/submissions`, `/submit`
- Auth utilities in `src/utils/auth.js`
- Client-side auth checks in Vue components

## Common Development Tasks

### Adding a New Page

1. Create `.astro` file in `src/pages/`
2. Use `BaseLayout` for consistent SEO and structure
3. Include `AppHeader` and `AppFooter` components
4. Add meta information via BaseLayout props

Example:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import AppHeader from "@/components/AppHeader.astro";
import AppFooter from "@/components/AppFooter.astro";
---

<BaseLayout
  title="Page Title | Awesome Directories"
  description="Page description for SEO"
>
  <AppHeader />

  <main>
    <!-- Page content -->
  </main>

  <AppFooter />
</BaseLayout>
```

### Adding a New Directory

**Option 1: Via User Submission (Recommended)**

1. Use the `/submit` page to submit a directory
2. Directory appears in `pending_directories` table with status 'pending'
3. Admin reviews and approves via Supabase dashboard
4. Approved directories are moved to `directories` table
5. Site rebuild required to reflect changes

**Option 2: Direct Database Insert**

1. Update `supabase/seeds/directories.json`
2. Run seed script or manually insert via Supabase SQL Editor
3. Verify on dev/staging before deploying
4. Rebuild site to reflect changes

### Working with Directory Detail Pages

Directory detail pages are generated statically:

1. Each directory gets its own page at `/directory/{slug}`
2. Pages are generated at build time via `getStaticPaths()`
3. To add new fields to detail pages:
   - Update `src/pages/directory/[slug].astro`
   - Ensure field is fetched in `getAllDirectories()`
   - Rebuild to see changes
4. Related directories use category matching logic
5. SEO metadata includes Product schema with AggregateRating

### Managing User Features

**Favorites:**

- User clicks favorite button → stored in `user_favorites` table
- View all favorites at `/favorites`
- Managed via `useDirectory.js` composable

**Submissions Tracking:**

- User tracks which directories they've submitted to
- Stored in `user_submissions` table
- Status: pending, submitted, approved, rejected
- View and manage at `/submissions`

**Directory Submission:**

- Users submit new directories via `/submit`
- Stored in `pending_directories` table
- Admin reviews in Supabase dashboard
- On approval, move to `directories` table manually

### Adding a Blog Post

1. Create a new `.md` file in `src/content/blog/`
2. Add required frontmatter:

   ```markdown
   ---
   title: "Your Post Title"
   description: "Brief description for SEO"
   date: 2025-01-15
   tags: ["SEO", "Marketing", "SaaS"]
   author: "Awesome Directories Team"
   coverImage: "/og-image.png"
   draft: false
   ---

   Your markdown content here...
   ```

3. Use headings (h2, h3) for automatic table of contents
4. Optionally specify `relatedPosts: ["post-slug-1", "post-slug-2"]` for custom related posts
5. Set `draft: true` to hide in production while working
6. Rebuild site to see changes

### Working with Statistics Page

The statistics page displays interactive charts using Chart.js:

1. Data is generated at build time by `saveStatsIntegration()`
2. Charts load from `/data/stats.json`
3. To add new statistics:
   - Update `src/integrations/save-stats.js` to calculate new metrics
   - Add new chart component or update existing in `src/components/StatsCharts.vue`
   - Rebuild to see changes

### Updating SEO Metrics

**Automated** (Recommended):

- Configure Supabase pg_cron to trigger `update-seo-data` Edge Function
- Metrics update automatically on schedule

**Manual**:

```bash
# Call Edge Function directly
curl -X POST https://your-project.supabase.co/functions/v1/update-seo-data \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10, "limit": 100}'
```

### Database Migrations

```bash
# Create new migration
supabase migration new <migration_name>

# Apply migrations locally
supabase db reset

# Push to remote
supabase db push
```

### Debugging

- **Build-time errors**: Check Astro build output
- **Client-side errors**: Browser console
- **Supabase queries**: Supabase dashboard logs
- **Network requests**: Browser Network tab
- **Vue components**: Vue DevTools (in dev mode)
- **Server logs**: `loglevel` debug mode

## Security Considerations

### Row Level Security (RLS)

- Always enable RLS on user-specific tables
- Test policies thoroughly before production
- Use `auth.uid()` for user identification
- Public read access on directories table

### Environment Variables

- Never commit `.env` file
- Use GitHub Secrets for CI/CD
- Validate required variables at build time
- Use `VITE_` prefix for client-side variables

### Authentication

- OAuth tokens handled by Supabase
- Session tokens stored securely
- HTTPS only in production (GitHub Pages enforces this)

### Edge Function Security

- Use `FUNCTION_SECRET` for authenticated requests
- Validate request authorization headers
- Rate limiting via Supabase (built-in)
- Sanitize user inputs

## Migration Notes (Vue.js → Astro.js)

### What Changed

- **Framework**: Vue.js SPA → Astro.js SSG
- **Routing**: Vue Router → File-based (Astro)
- **Data Fetching**: Runtime (Supabase client) → Build-time + Runtime
- **SEO**: Client-side meta tags → Server-rendered HTML
- **Bundle Size**: Single SPA bundle → Multiple static pages

### What Stayed

- Vue components for interactivity
- Tailwind CSS for styling
- Supabase for database and auth
- Same directory data structure
- Most composables still functional

### Benefits of Migration

- ✅ Better SEO (static HTML with content)
- ✅ Faster initial page loads
- ✅ Improved Core Web Vitals
- ✅ Automatic code splitting
- ✅ Reduced JavaScript bundle size
- ✅ Better caching (static assets)

## Additional Resources

- **README.md** - Main documentation and setup guide
- **SETUP_GUIDE.md** - Detailed setup instructions (if exists)
- **Astro Docs** - https://docs.astro.build
- **Supabase Docs** - https://supabase.com/docs
- **Vue 3 Docs** - https://vuejs.org/
- **Tailwind CSS** - https://tailwindcss.com/

## Notes for AI Assistants

### Architecture Understanding

- This is a **static site** (Astro SSG), not a SPA
- Data is fetched at **build time** from Supabase
- Vue components are **islands** for interactivity only
- Pages are **statically generated** HTML files
- Client-side features load data from `directories.json`

### Development Guidelines

- **Prefer Astro components** for static content
- **Use Vue islands** only for interactive features
- **Maintain SEO**: All content should be in static HTML
- **Performance**: Minimize client-side JavaScript
- **Accessibility**: Follow WCAG 2.1 AA standards
- **Mobile-first**: Test responsive design
- **Code quality**: Use TypeScript types where possible

### Common Pitfalls to Avoid

- ❌ Don't add client-side routing (use Astro file-based)
- ❌ Don't fetch data in Vue components at runtime for directory listings (use build-time)
- ❌ Don't rely on `window` in server-side Astro code
- ❌ Don't commit environment variables or `.env` file
- ❌ Don't skip accessibility testing
- ❌ Don't forget to test production builds
- ❌ Don't forget to rebuild site after database changes (directories are static)
- ❌ Don't modify legacy `src/views/` or `src/router/` (kept for reference only)

### Testing Checklist

**Build & Basic Functionality:**

- [ ] Build succeeds without errors (`bun run build`)
- [ ] Preview works locally (`bun run preview`)
- [ ] All pages load correctly (/, /about, /stats, /blog, /terms, /privacy, /404)
- [ ] Filters and search work on home page
- [ ] SEO meta tags are correct on all pages
- [ ] Images load and are optimized
- [ ] No console errors in production build
- [ ] Lighthouse score > 95 (Performance, SEO, Accessibility)

**Directory Detail Pages:**

- [ ] All directory detail pages generate correctly
- [ ] Related directories show up based on categories
- [ ] Breadcrumb navigation works
- [ ] Structured data (Product schema) is present
- [ ] Social sharing metadata (OG, Twitter) is correct

**Authentication & Protected Pages:**

- [ ] OAuth sign-in works (Google & GitHub)
- [ ] Auth state persists across page reloads
- [ ] Protected pages redirect to auth when not logged in
- [ ] Sign out works correctly

**User Features:**

- [ ] Favorite button toggles correctly
- [ ] Favorites page shows user's saved directories
- [ ] Submission tracker works and saves status
- [ ] Directory submission form validates and submits
- [ ] Helpful voting works (anonymous and authenticated)

**Database & State:**

- [ ] Favorites sync with `user_favorites` table
- [ ] Submissions sync with `user_submissions` table
- [ ] Pending directories appear in `pending_directories` table
- [ ] Votes increment/decrement `helpful_count` correctly

**Blog:**

- [ ] Blog listing page shows published posts
- [ ] Individual blog posts render correctly
- [ ] Table of contents generates from headings
- [ ] Related posts show based on tags
- [ ] Pagefind search works on blog listing
- [ ] Tag filtering works correctly
- [ ] Pagination works on blog listing and tag pages
- [ ] Social sharing buttons function correctly
- [ ] Giscus comments load (if configured)
- [ ] Draft posts hidden in production
- [ ] Future-dated posts hidden until publish date
- [ ] BlogPosting structured data present

**Statistics Page:**

- [ ] Stats page loads without errors
- [ ] All charts render correctly (category, pricing, link type, DR, timeline)
- [ ] Stats data loads from `/data/stats.json`
- [ ] Charts are responsive on mobile
- [ ] Chart tooltips show correct data

### When Making Changes

1. **Read existing code** to understand patterns
2. **Test locally** before pushing
3. **Check build output** for errors
4. **Verify SEO impact** (meta tags, structured data)
5. **Test interactivity** (Vue components)
6. **Monitor bundle size** (use visualizer)
7. **Update documentation** if needed

### Supabase Edge Functions

- Written in **TypeScript/Deno** (not Node.js)
- Use Deno imports: `https://deno.land/std/...`
- Test locally with `supabase functions serve`
- Deploy with `supabase functions deploy`
- Monitor logs in Supabase dashboard

### Git Workflow

- Work on feature branch: `claude/feature-name-<session-id>`
- Create clear, descriptive commit messages
- Push with: `git push -u origin <branch-name>`
- Branch must start with `claude/` and end with session ID
- Retry network failures with exponential backoff

---

## Recent Updates

### Commit History (Most Recent)

- **012d454** - feat: add blogging with Astro dynamic routing (#28)
  - Full blog system with Astro Content Collections
  - Pagefind search integration
  - Tags, pagination, and related posts
  - Table of contents and social sharing

- **72296a7** - feat: Add comprehensive statistics page with interactive charts (#29)
  - Chart.js integration for interactive visualizations
  - Category, pricing, link type, and DR distribution charts
  - Top directories tables
  - Stats data generation via custom integration

- **e5cf0c3** - fix: address contract issue
  - Bug fixes and improvements

- **1e1ec4c** - fix: make the homepage fully responsive
  - Mobile-first responsive design improvements

- **3c7eded** - feat: improve lighthouse metrics to above 95+
  - Performance optimizations
  - Lighthouse score improvements

- **713c8b7** - chore(deps): update astro to v5
  - Major Astro framework upgrade

- **ee4c7d7** - fix(auth): fix session detection and persistence after login (#27)
  - Auth session improvements

- **9a05666** - feat: finalize auth system with Vue island components (#25)
  - Authentication system implementation
  - Protected pages: favorites, submissions, submit

### Features Since Last Documentation Update

1. **Blog System** (Commit 012d454)
   - Astro Content Collections with Markdown
   - `/blog` listing with Pagefind search
   - `/blog/[slug]` individual posts with TOC
   - Tag filtering and pagination
   - Related posts (auto or custom)
   - Social sharing (X, LinkedIn, Facebook, Reddit)
   - Giscus comments integration
   - BlogPosting schema structured data
   - Draft and future scheduling support

2. **Statistics Page** (Commit 72296a7)
   - `/stats` with interactive Chart.js charts
   - Category distribution pie chart
   - Pricing breakdown doughnut chart
   - Link type bar chart
   - Domain Rating distribution horizontal bar
   - Recent additions timeline
   - Top directories tables
   - Stats data generated at build time

3. **Performance Improvements**
   - Lighthouse scores above 95+
   - Astro v5 upgrade
   - Fully responsive homepage
   - Optimized bundle splitting

4. **New Components**
   - StatsCards, StatsCharts, TopDirectoriesTable (Vue)
   - BlogCard, Pagination, RelatedPosts (Astro)
   - ShareButtons, TableOfContents, GiscusComments (Astro)

5. **New Integrations**
   - `saveStatsIntegration()` - Generate stats.json
   - `pagefindIntegration()` - Blog search indexing

6. **New Utilities**
   - `src/utils/blog.ts` - Blog helpers (reading time, TOC, related posts)

---

**Last Updated**: 2025-11-19 (Updated with commits through 012d454)
**Architecture**: Astro.js 5 SSG with Vue.js Islands
**Lighthouse Score**: 95+ (Performance, SEO, Accessibility, Best Practices)
**Latest Features**: Blog system, statistics page, responsive design (commits 012d454, 72296a7)
