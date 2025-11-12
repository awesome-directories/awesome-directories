# Claude Context: Awesome Directories

## Project Overview

**Awesome Directories** is a curated directory aggregator web application that helps indie hackers, bootstrappers, and solopreneurs discover high-quality product launch directories for their SaaS products. The site aggregates 388+ verified directories with advanced filtering capabilities.

- **Live Site**: https://awesome-directories.com
- **Repository**: awesome-directories/awesome-directories
- **License**: Apache 2.0
- **Hosting**: GitHub Pages (static SPA)

### Core Value Proposition
- Curated, verified directories updated weekly
- Advanced filtering by Domain Rating (DR), category, pricing, and link type
- Submission tracking and favorites management
- Weekly automated DR updates via Moz API

## Technology Stack

### Frontend
- **Vue.js 3** (Composition API)
- **Vue Router 4** (client-side routing with lazy loading)
- **Vite 7** (build tool, dev server on port 3000)
- **Tailwind CSS 4** (utility-first CSS)
- **TypeScript-ready** (ES modules)

### Key Libraries
- `@supabase/supabase-js` - Database and auth client
- `@vueuse/core` - Vue composition utilities
- `html2canvas + jsPDF` - PDF export functionality
- `papaparse` - CSV parsing/export
- `slugify` - URL slug generation

### Backend & Services
- **Supabase** - PostgreSQL + Auth + Realtime
- **PostgreSQL** with Row Level Security (RLS)
- **Mautic** - Self-hosted CRM for newsletter (crm.meysam.io)
- **Pirsch** - Privacy-first analytics
- **Moz API** - Domain Rating scores (optional)
- **Giscus** - GitHub Discussions for comments

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
├── .github/workflows/ci.yml        # CI/CD pipeline
├── public/                          # Static assets
├── src/
│   ├── components/                 # Vue components
│   │   ├── AppHeader.vue          # Main navigation
│   │   ├── AppFooter.vue          # Footer
│   │   ├── AuthModal.vue          # OAuth modal
│   │   ├── ChecklistModal.vue     # Export modal
│   │   └── DirectoryCard.vue      # Directory item
│   ├── composables/               # Composition API logic
│   │   ├── useAuth.js            # Authentication
│   │   ├── useDirectories.js     # Data fetching & filtering
│   │   └── useMauticNewsletter.js # Newsletter
│   ├── lib/
│   │   └── supabase.js           # Supabase client
│   ├── router/index.js           # Route configuration
│   ├── views/                    # Page components
│   │   ├── HomeView.vue          # Directory listing
│   │   ├── DirectoryDetailView.vue
│   │   ├── SubmitView.vue        # Submit directory
│   │   ├── FavoritesView.vue     # User favorites
│   │   ├── SubmissionsView.vue   # Submission tracking
│   │   ├── StatsView.vue         # Public stats
│   │   ├── AboutView.vue
│   │   ├── TermsView.vue         # Terms of Service
│   │   └── PrivacyView.vue       # Privacy Policy
│   ├── App.vue                   # Root component
│   ├── main.js                   # Entry point
│   └── style.css                 # Global Tailwind imports
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_pending_directories.sql
│   ├── seeds/
│   │   ├── directories.sql       # SQL seed data
│   │   └── directories.json      # JSON seed data
│   └── config.toml
├── scripts/
│   ├── parse-directories.js      # Parse dataset
│   ├── seed-database.js          # Populate database
│   ├── update-dr-scores.js       # Update DR from Moz
│   └── convert-svgs.js
├── vite.config.js                # Build configuration
├── tailwind.config.js            # Tailwind config
├── package.json                  # Dependencies & scripts
└── .env.example                  # Environment variables template
```

## Development Setup

### Prerequisites
- Bun (primary) or Node.js 18+
- Supabase account (free tier)
- GitHub account (for Giscus)

### Quick Start
```bash
# Install dependencies
bun install  # or: npm install

# Copy environment variables
cp .env.example .env

# Start dev server
bun start  # Runs on http://localhost:3000

# Build for production
bun run build

# Preview production build
bun run preview
```

### Environment Variables

Required in `.env`:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_MAUTIC_BASE_URL=https://mautic.your-domain.com
VITE_MAUTIC_FORM_ID=<form-id>
```

Optional:
```env
VITE_PIRSCH_SITE_ID=<site-id>
VITE_GITHUB_REPO=awesome-directories/awesome-directories
VITE_GITHUB_REPO_ID=<repo-id>
VITE_GITHUB_CATEGORY=Announcements
VITE_GITHUB_CATEGORY_ID=<category-id>
```

### Available Scripts
- `bun start` - Start development server (port 3000)
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint with auto-fix

## Database Schema

### Core Tables

1. **directories**
   - Primary table for all directory listings
   - Slug-based unique identifiers
   - Includes: DR scores, categories (array), pricing, traffic estimates
   - Engagement: helpful_count, view_count
   - Status tracking and timestamps

2. **directory_votes**
   - IP-based voting for "helpful" clicks
   - One vote per IP per directory

3. **user_favorites**
   - User-specific saved directories
   - Requires authentication

4. **user_submissions**
   - Track user submission status (pending/submitted/approved/rejected)
   - Personal notes field

5. **newsletter_signups**
   - Email capture with Mautic integration

### Key Indexes
- Categories: GIN index for array queries
- Domain Rating: DESC (nulls last)
- Slug, active status, pricing type

### Row Level Security (RLS)
- Enabled on user-specific tables (favorites, submissions)
- Public read access on directories table

## Key Composables & Logic

### useAuth.js
Manages authentication state and methods:
- State: `user`, `session`, `loading`
- Methods: `signInWithGoogle()`, `signInWithGithub()`, `signOut()`, `refreshSession()`
- Auto-refresh token and persistent session
- Auth state change listener

### useDirectories.js
Core data fetching and filtering:
- Fetches directories from Supabase with pagination (50 per page)
- 5-minute client-side cache
- Methods: `fetchDirectories()`, `loadMore()`, `getDirectoryBySlug()`
- Filters: category, DR range, link type, pricing, search
- Sorting: Most Helpful, Highest DR, Newest, Alphabetical
- Auto-increment view count on detail view

### useMauticNewsletter.js
Newsletter subscription to Mautic CRM:
- Captures email, name, product name
- Error handling and validation

## Routing

### Page Structure
- `/` - Home (directory listing with filters)
- `/directory/:slug` - Directory detail page
- `/submit` - Submit new directory form
- `/about` - About page
- `/stats` - Public statistics dashboard
- `/favorites` - User favorites (auth required)
- `/submissions` - Submission tracking (auth required)
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

### Route Features
- Lazy loading for performance
- Scroll behavior management
- Page title updates via meta
- Authentication guards on protected routes

## Build Configuration

### Vite Config (`vite.config.js`)
- Output: `dist/` directory
- Dev server: port 3000
- Minification: Terser (production)
- CSS minification: LightningCSS
- Code splitting: Automatic with manual chunk optimization
- Compression: Gzip (level 9) + Brotli (level 11)
- Source maps: Inline (dev), disabled (prod)
- Bundle analysis: Available via visualizer plugin

### Tailwind Config
- Content paths configured for all Vue files
- Custom theme extensions as needed
- PostCSS plugin integration

## Deployment Pipeline

### GitHub Actions (`ci.yml`)

**On Pull Request:**
- Build with environment secrets
- Deploy to Netlify for preview
- Comment on PR with preview URL

**On Push to Main:**
- Build with environment secrets
- Deploy to GitHub Pages
- Automatic deployment

**Scheduled (daily at midnight UTC):**

### Required Secrets
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_MAUTIC_BASE_URL`, `VITE_MAUTIC_FORM_ID`
- Optional: `VITE_PIRSCH_SITE_ID`, `VITE_GITHUB_*`
- CI/CD: `SUPABASE_SERVICE_KEY`, MOZ_API credentials
- `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

## Code Quality & Tooling

### Pre-commit Hooks
- **oxlint** - Fast Rust-based linter
- **prettier** - Code formatting
- **eslint** - JavaScript linting
- **commitlint** - Conventional commits
- Large file detection (2MB limit)
- JSON/YAML validation
- Private key detection
- Trailing whitespace fix

### Dependency Management
- **Renovate bot** - Auto-upgrade dependencies
- Auto-merge for patch versions
- Configuration in `renovate.json`

## Important Patterns & Conventions

### Component Structure
- Vue 3 Composition API with `<script setup>`
- Composables for shared logic
- Prop validation and TypeScript types where applicable

### State Management
- Composables for state (no Vuex/Pinia)
- Client-side caching for performance
- Supabase Realtime for live updates

### API Interactions
- Supabase client via `src/lib/supabase.js`
- Error handling with user-friendly messages
- Loading states for async operations

### Styling
- Tailwind CSS utility classes
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Semantic HTML structure

### Authentication
- Optional Google & GitHub OAuth via Supabase
- Session persistence in localStorage
- Auth state reactivity across components
- Protected routes with navigation guards

## Data Management

### Seed Data
- 388+ directories in JSON format
- Location: `supabase/seeds/directories.json`
- Parser script: `scripts/parse-directories.js`
- Manual updates via PR to seed data file

### DR Score Updates
- Weekly automated updates via GitHub Actions
- Moz API integration in `scripts/update-dr-scores.js`
- Fallback for missing API credentials

## SEO & Analytics

### SEO Optimization
- Comprehensive meta tags (Open Graph, Twitter Cards)
- Schema.org structured data (WebSite, WebApplication, BreadcrumbList)
- Canonical URLs
- Sitemap support ready

### Analytics
- Pirsch (privacy-first analytics)
- Giscus (GitHub Discussions integration)
- Public stats dashboard at `/stats`

## Common Tasks

### Adding a New Directory
1. Update `supabase/seeds/directories.json`
2. Run seed script or manually insert via SQL
3. Verify on dev/staging before deploying

### Updating DR Scores
```bash
bun run scripts/update-dr-scores.js
```

### Database Migrations
```bash
# Create new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push
```

### Debugging
- Check browser console for client errors
- Supabase dashboard for database queries
- Network tab for API requests
- Vue DevTools for component inspection

## Security Considerations

### Row Level Security (RLS)
- Always enable RLS on user-specific tables
- Test policies thoroughly before production
- Use `auth.uid()` for user identification

### Environment Variables
- Never commit `.env` file
- Use GitHub Secrets for CI/CD
- Validate required variables at build time

### Authentication
- OAuth tokens handled by Supabase
- Session tokens stored securely
- HTTPS only in production

## Key Features in Development

### Pending Submissions
- New table: `002_pending_directories.sql`
- Community-submitted directories
- Admin review workflow

### Advanced Analytics
- Detailed metrics dashboard
- User engagement tracking
- Popular directories insights

## Additional Resources

- **README.md** - Main documentation
- **SETUP_GUIDE.md** - Detailed setup instructions
- **Supabase Docs** - https://supabase.com/docs
- **Vue 3 Docs** - https://vuejs.org/
- **Tailwind CSS** - https://tailwindcss.com/

## Notes for Claude

- This is a static SPA hosted on GitHub Pages
- Supabase provides the backend (no custom server)
- Authentication is optional (guest browsing allowed)
- Focus on performance and user experience
- Maintain accessibility standards (WCAG 2.1 AA)
- Test responsive design on mobile devices
- Consider SEO implications for SPA routing
- Keep bundle size optimized (code splitting)
