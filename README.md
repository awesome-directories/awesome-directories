# Awesome Directories

> Find the top 20 launch directories worth your time in under 3 minutes—curated, verified, and updated weekly.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub Stars](https://img.shields.io/github/stars/awesome-directories/awesome-directories)](https://github.com/awesome-directories/awesome-directories)

A curated directory aggregator that helps indie hackers, bootstrappers, and solopreneurs discover the highest-quality launch directories for their SaaS products. Built with Vue.js 3, Supabase, and deployed on GitHub Pages.

🌐 **Live Site:** [awesome-directories.github.io/awesome-directories](https://awesome-directories.github.io/awesome-directories)

---

## Features

### Core Features

- ✅ **388+ Curated Directories** - Pre-loaded with quality directories
- 🔍 **Advanced Filtering** - Filter by DR, category, pricing, dofollow status
- ⚡ **Instant Search** - Real-time search across names, descriptions, categories
- 📋 **Multi-Select Checklist** - Select directories and export as PDF or CSV
- 📊 **Domain Ratings** - Weekly automated DR updates via Moz API
- 👍 **Community Voting** - IP-based "helpful" voting system
- 💬 **Giscus Comments** - Community reviews powered by GitHub Discussions

### User Features

- 🔐 **Optional Authentication** - Google & GitHub OAuth via Supabase
- ❤️ **Favorites** - Save directories to your personal collection
- ✅ **Submission Tracking** - Track which directories you've submitted to
- 📧 **Newsletter Integration** - Mautic-powered email capture
- 📈 **Public Stats** - Transparent analytics dashboard
- 🎨 **Screenshot Generation** - Social media sharing cards

### Technical Features

- 🚀 **Static SPA** - Blazing fast Vue.js 3 + Vite
- 📦 **GitHub Pages Hosting** - Free, reliable hosting
- 🔄 **Weekly Automation** - GitHub Actions for DR updates
- 🎯 **Privacy-First Analytics** - Pirsch integration
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 📱 **Responsive** - Mobile-first design with Tailwind CSS

---

## Tech Stack

- **Frontend:** Vue.js 3 (Composition API), Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Hosting:** GitHub Pages (Static SPA)
- **Newsletter:** Mautic (self-hosted at crm.meysam.io)
- **Analytics:** Pirsch (privacy-first)
- **Comments:** Giscus (GitHub Discussions)
- **CI/CD:** GitHub Actions
- **APIs:** Moz API for Domain Rating scores

---

## Quick Start

### Prerequisites

- Bun
- Supabase account (free tier works)
- Mautic instance (or use environment variable stubs)
- GitHub repository for Giscus

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/awesome-directories/awesome-directories.git
   cd awesome-directories
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:

   ```env
   # Required
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Required for newsletter
   VITE_MAUTIC_BASE_URL=https://crm.meysam.io
   VITE_MAUTIC_FORM_ID=your-form-id

   # Optional
   VITE_PIRSCH_SITE_ID=
   VITE_GITHUB_REPO=awesome-directories/awesome-directories
   VITE_GITHUB_REPO_ID=
   VITE_GITHUB_CATEGORY=Announcements
   VITE_GITHUB_CATEGORY_ID=
   ```

4. **Set up Supabase database:**

   - Create a new Supabase project
   - Run the migration: `supabase/migrations/001_initial_schema.sql`
   - Seed the database with: `supabase/seed-data.json`

   ```sql
   -- In Supabase SQL Editor, paste the contents of:
   -- supabase/migrations/001_initial_schema.sql

   -- Then insert seed data (you can do this via the Supabase dashboard or API)
   ```

5. **Configure Supabase Auth:**

   - Go to Authentication → Providers in Supabase
   - Enable Google OAuth (add Client ID and Secret)
   - Enable GitHub OAuth (add Client ID and Secret)
   - Add redirect URL: `http://localhost:3000/awesome-directories`

6. **Run development server:**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### GitHub Pages Deployment

1. **Enable GitHub Pages:**

   - Go to repository Settings → Pages
   - Source: GitHub Actions

2. **Add GitHub Secrets:**

   - Go to Settings → Secrets and variables → Actions
   - Add the following secrets:
     ```
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     VITE_MAUTIC_BASE_URL
     VITE_MAUTIC_FORM_ID
     VITE_PIRSCH_SITE_ID
     VITE_GITHUB_REPO
     VITE_GITHUB_REPO_ID
     VITE_GITHUB_CATEGORY
     VITE_GITHUB_CATEGORY_ID
     SUPABASE_SERVICE_KEY (for DR updates)
     MOZ_API_ACCESS_ID (optional)
     MOZ_API_SECRET_KEY (optional)
     ```

3. **Deploy:**
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy
   - Site will be live at: `https://your-username.github.io/awesome-directories`

### Manual Build

```bash
bun run build
```

Output will be in `dist/` directory.

---

## Configuration

### Supabase Setup

1. **Database Schema:**
   Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor

2. **Seed Data:**
   Import directories from `supabase/seed-data.json`:

   ```javascript
   // Use Supabase JavaScript client
   import { createClient } from "@supabase/supabase-js";
   import seedData from "./supabase/seed-data.json";

   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

   for (const directory of seedData) {
     await supabase.from("directories").insert(directory);
   }
   ```

3. **Row Level Security (RLS):**
   Policies are defined in the migration file and will be automatically applied

### Mautic Setup

1. Create a form in Mautic with fields: `email`, `name`, `product_name`
2. Get the form ID from the Mautic dashboard
3. Add to environment variables

### Giscus Setup

1. Install Giscus app on your GitHub repository
2. Enable Discussions in repository settings
3. Get repo ID and category ID from [giscus.app](https://giscus.app)
4. Add to environment variables

### Pirsch Analytics

1. Create account at [pirsch.io](https://pirsch.io)
2. Add your domain
3. Get site ID
4. Add to environment variables

---

## Data Management

### Updating Directory Data

1. **Manual Update:**
   Edit `supabase/seed-data.json` and re-import

2. **Via Pull Request:**

   - Fork the repository
   - Add/update directory in `supabase/seed-data.json`
   - Create Pull Request
   - Maintainers will review and merge

3. **Automated DR Updates:**
   - GitHub Actions runs weekly (Sundays at 2 AM UTC)
   - Updates Domain Ratings via Moz API
   - Commits changes automatically

### Data Parser

Generate seed data from source files:

```bash
node scripts/parse-directories.js
```

This reads from `dataset/` and generates `supabase/seed-data.json`

---

## Development

### Project Structure

```
awesome-directories/
├── .github/
│   └── workflows/          # GitHub Actions
├── dataset/                # Source data files
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── src/
│   ├── assets/            # Images, styles
│   ├── components/        # Vue components
│   ├── composables/       # Vue composables
│   ├── lib/               # Supabase client
│   ├── router/            # Vue Router
│   ├── utils/             # Helper functions
│   ├── views/             # Page components
│   ├── App.vue           # Root component
│   ├── main.js           # Entry point
│   └── style.css         # Tailwind imports
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── seed-data.json    # Seed data
├── .env.example           # Environment variables template
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

### Available Scripts

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run preview  # Preview production build
```

### Key Composables

- `useAuth()` - Authentication state and methods
- `useDirectories()` - Directory data and filtering
- `useMauticNewsletter()` - Newsletter subscription

---

## Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Add directories with DR > 60 preferred
- Verify links are active
- Include description, categories, pricing
- Follow existing data format
- Test locally before submitting

---

## Environment Variables

### Required

| Variable                 | Description            | Example                   |
| ------------------------ | ---------------------- | ------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL   | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...`              |
| `VITE_MAUTIC_BASE_URL`   | Mautic instance URL    | `https://crm.meysam.io`   |
| `VITE_MAUTIC_FORM_ID`    | Mautic form ID         | `5`                       |

### Optional

| Variable                  | Description            | Default                                   |
| ------------------------- | ---------------------- | ----------------------------------------- |
| `VITE_PIRSCH_SITE_ID`     | Pirsch site ID         | None                                      |
| `VITE_GITHUB_REPO`        | GitHub repo for Giscus | `awesome-directories/awesome-directories` |
| `VITE_GITHUB_REPO_ID`     | GitHub repo ID         | None                                      |
| `VITE_GITHUB_CATEGORY`    | Giscus category        | `Announcements`                           |
| `VITE_GITHUB_CATEGORY_ID` | Giscus category ID     | None                                      |

### CI/CD Only

| Variable               | Description                                |
| ---------------------- | ------------------------------------------ |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (for DR updates) |
| `MOZ_API_ACCESS_ID`    | Moz API access ID                          |
| `MOZ_API_SECRET_KEY`   | Moz API secret key                         |

---

## License

Apache 2.0 License - see [LICENSE](LICENSE) file for details

---

## Acknowledgments

- Built by [Meysam](https://meysam.io)
- Inspired by the indie hacker community
- Data sourced from community contributions

---

## Support

- ⭐ Star this repo
- 📢 Share with fellow founders
- 🐛 [Report bugs](https://github.com/awesome-directories/awesome-directories/issues)
- 💡 [Suggest features](https://github.com/awesome-directories/awesome-directories/issues)
- 💝 [Sponsor on GitHub](https://github.com/sponsors/meysam)

---

**Made with ❤️ by indie hackers, for indie hackers**
