# Awesome Directories - Setup Guide

## 🎉 Application Successfully Created!

Your complete Awesome Directories application has been built according to the technical and product specifications. Here's everything you need to know to get it running.

---

## 📋 What Was Built

### Complete Features Implemented:

✅ **Frontend (Vue.js 3 SPA)**

- Homepage with hero section, search, and filtering
- Directory browsing with advanced filters (DR, category, pricing, dofollow)
- Instant search functionality
- Multi-select checklist with PDF/CSV export
- Directory detail pages with Giscus comments
- User authentication (Google + GitHub OAuth)
- Favorites and submission tracking
- Responsive design with Tailwind CSS

✅ **Backend (Supabase)**

- Complete PostgreSQL database schema
- Row Level Security (RLS) policies
- User authentication system
- Real-time capabilities
- 388 pre-seeded directories

✅ **Integrations**

- Mautic newsletter forms (crm.meysam.io)
- Pirsch analytics (privacy-first)
- Giscus comments (GitHub Discussions)
- Moz API for DR scores (optional)

✅ **CI/CD & Automation**

- GitHub Actions deployment to GitHub Pages
- Weekly automated DR score updates
- Environment variable validation

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Set Up Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migration:**
   - Go to SQL Editor in Supabase
   - Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run

3. **Seed the database:**
   - The seed data is in `supabase/seed-data.json` (388 directories)
   - You can import via Supabase Table Editor or use the JavaScript client:

   ```javascript
   import { createClient } from "@supabase/supabase-js";
   import seedData from "./supabase/seed-data.json";

   const supabase = createClient("YOUR_URL", "YOUR_SERVICE_KEY");

   for (const dir of seedData) {
     await supabase.from("directories").insert(dir);
   }
   ```

4. **Enable OAuth Providers:**
   - Go to Authentication → Providers
   - Enable Google and GitHub
   - Add redirect URLs: `http://localhost:3000/awesome-directories` and your production URL

5. **Get your credentials:**
   - Settings → API
   - Copy: Project URL and `anon` public key

### Step 2: Configure Environment Variables

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Fill in required variables:**

   ```env
   # Required - from Supabase
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...

   # Required - your Mautic instance
   VITE_MAUTIC_BASE_URL=https://crm.meysam.io
   VITE_MAUTIC_FORM_ID=your-form-id

   # Optional (can be added later)
   VITE_PIRSCH_SITE_ID=
   VITE_GITHUB_REPO=awesome-directories/awesome-directories
   ```

### Step 3: Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 🎉

---

## 📦 Production Deployment

### Deploy to GitHub Pages

1. **Enable GitHub Pages:**
   - Repository Settings → Pages
   - Source: GitHub Actions

2. **Add GitHub Secrets:**
   Go to Settings → Secrets and variables → Actions

   **Required:**

   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_MAUTIC_BASE_URL
   VITE_MAUTIC_FORM_ID
   ```

   **Optional:**

   ```
   VITE_PIRSCH_SITE_ID
   VITE_GITHUB_REPO
   VITE_GITHUB_REPO_ID
   VITE_GITHUB_CATEGORY
   VITE_GITHUB_CATEGORY_ID
   ```

   **For DR Updates (optional):**

   ```
   SUPABASE_SERVICE_KEY
   MOZ_API_ACCESS_ID
   MOZ_API_SECRET_KEY
   ```

3. **Deploy:**

   ```bash
   git push origin main
   ```

   GitHub Actions will automatically:
   - Build the application
   - Deploy to GitHub Pages
   - Site will be live at: `https://your-username.github.io/awesome-directories`

---

## 🔧 Configuration Details

### Mautic Newsletter

Your Mautic instance is already configured at `crm.meysam.io`. You need:

1. Create a form in Mautic with fields: `email`, `name`, `product_name`
2. Get the form ID from Mautic dashboard
3. Add to `VITE_MAUTIC_FORM_ID` in environment variables

### Giscus Comments

1. Install [Giscus app](https://github.com/apps/giscus) on your repository
2. Enable Discussions in repository settings
3. Get configuration from [giscus.app](https://giscus.app):
   - Enter your repo
   - Copy repo ID and category ID
   - Add to environment variables

### Pirsch Analytics (Optional)

1. Create account at [pirsch.io](https://pirsch.io)
2. Add your domain
3. Get site ID
4. Add to `VITE_PIRSCH_SITE_ID`

---

## 📊 Database Management

### View Current Data

```sql
-- See all directories
SELECT name, domain_rating, is_dofollow, pricing_type, helpful_count
FROM directories
WHERE is_active = true
ORDER BY domain_rating DESC NULLS LAST;

-- See total counts
SELECT
  COUNT(*) as total,
  COUNT(domain_rating) as with_dr,
  SUM(CASE WHEN is_dofollow THEN 1 ELSE 0 END) as dofollow,
  SUM(CASE WHEN pricing_type = 'free' THEN 1 ELSE 0 END) as free
FROM directories WHERE is_active = true;
```

### Add New Directories

**Option 1: Via Supabase Dashboard**

- Go to Table Editor → directories
- Insert new row with required fields

**Option 2: Via SQL**

```sql
INSERT INTO directories (slug, name, url, categories, pricing_type, is_dofollow, domain_rating)
VALUES (
  'example-directory',
  'Example Directory',
  'https://example.com',
  ARRAY['SaaS', 'Startup'],
  'free',
  true,
  75
);
```

**Option 3: Via Pull Request**

- Edit `supabase/seed-data.json`
- Create PR
- Data will be imported after merge

---

## 🤖 Automated Weekly Updates

The `update-dr-scores.yml` workflow runs every Sunday at 2 AM UTC to update Domain Ratings.

**To enable:**

1. Get Moz API credentials:
   - Sign up at [moz.com/products/api](https://moz.com/products/api)
   - Get Access ID and Secret Key

2. Add GitHub Secrets:

   ```
   MOZ_API_ACCESS_ID
   MOZ_API_SECRET_KEY
   SUPABASE_SERVICE_KEY (from Supabase Settings → API)
   ```

3. The workflow will:
   - Fetch current DR scores from Moz
   - Update Supabase database
   - Commit summary to `data/updates/`

**Manual trigger:**

- Go to Actions → Weekly DR Score Update → Run workflow

---

## 🎨 Customization

### Branding

**Colors** - Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#3b82f6',  // Your brand color
    dark: '#2563eb',
    light: '#60a5fa'
  }
}
```

**Logo** - Update in `src/components/AppHeader.vue`:

```vue
<div class="text-2xl font-bold text-primary">
  📂  <!-- Replace with your logo -->
</div>
```

**Metadata** - Edit `index.html`:

- Title
- Description
- Open Graph tags

### Content

**Hero Section** - `src/views/HomeView.vue`:

- Update headline
- Change stats
- Modify CTA text

**About Page** - `src/views/AboutView.vue`:

- Add your story
- Update links
- Customize sections

**Footer** - `src/components/AppFooter.vue`:

- Update social links
- Change newsletter copy

---

## 🐛 Troubleshooting

### Build Fails with "Missing environment variables"

**Cause:** Required env vars not set

**Fix:**

```bash
# Check .env file exists and has:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### "Cannot find module" errors

**Fix:**

```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase Auth not working

**Check:**

1. OAuth providers enabled in Supabase
2. Redirect URLs configured correctly
3. Client IDs and secrets set

### No directories showing

**Check:**

1. Database seeded with data
2. RLS policies applied
3. `is_active = true` on directories
4. Check browser console for errors

---

## 📚 Next Steps

1. **Customize branding** - Update colors, logos, content
2. **Set up Mautic** - Create form and test newsletter
3. **Configure Giscus** - Enable comments
4. **Add Pirsch** - Set up analytics
5. **Test locally** - Verify all features work
6. **Deploy to GitHub Pages** - Push to main branch
7. **Promote** - Share on Product Hunt, Indie Hackers, Twitter

---

## 🆘 Need Help?

- **Documentation:** See main [README.md](README.md)
- **Issues:** [GitHub Issues](https://github.com/awesome-directories/awesome-directories/issues)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vue.js Docs:** [vuejs.org](https://vuejs.org)

---

## ✅ Checklist Before Launch

- [ ] Supabase database set up and seeded
- [ ] Environment variables configured
- [ ] OAuth providers enabled (Google + GitHub)
- [ ] Mautic form created and ID added
- [ ] Local development tested
- [ ] GitHub secrets added
- [ ] GitHub Pages enabled
- [ ] First deployment successful
- [ ] All links working
- [ ] Newsletter signup tested
- [ ] Auth flow tested
- [ ] Mobile responsive checked
- [ ] Analytics tracking verified

---

**Happy launching! 🚀**

Built with ❤️ following your specs. Ready for production deployment.
