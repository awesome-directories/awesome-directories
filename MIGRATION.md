# Vue to Astro Migration Guide

## ✅ Migration Complete!

The project has been successfully migrated from Vue.js SPA to Astro v5 with Vue islands.

## 🎯 What Changed

### Architecture
- **From**: Vue.js SPA with client-side routing
- **To**: Astro SSG with Vue islands for interactivity

### Key Improvements
1. **✅ SEO Optimization**: All pages are now statically generated at build time
2. **✅ Performance**: Vite-optimized, minified, and compressed static pages
3. **✅ Search & Filtering Fixed**: Now filters against ALL directories (not just first 50)
4. **✅ Indexable Content**: Search engines can crawl all directory pages
5. **✅ Blog Ready**: Content collections set up at `/src/content/blog/`

### What Stayed the Same
- ✅ All UI components and interactions
- ✅ Supabase backend integration
- ✅ Authentication flow
- ✅ Routing structure (/, /directory/:slug, /submit, etc.)
- ✅ All features (search, filtering, favorites, submissions, etc.)

## 📋 Required Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your Supabase credentials:

```env
# REQUIRED for build
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# REQUIRED for newsletter
VITE_MAUTIC_BASE_URL=https://mautic.your-domain.com
VITE_MAUTIC_FORM_ID=your-form-id-here

# OPTIONAL
VITE_GITHUB_REPO=awesome-directories/awesome-directories
VITE_GITHUB_REPO_ID=your-repo-id
VITE_GITHUB_CATEGORY=Announcements
VITE_GITHUB_CATEGORY_ID=your-category-id
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Build the Project

```bash
bun run build
```

This will:
- Fetch ALL directories from Supabase at build time
- Generate static HTML pages for each directory
- Create optimized, minified assets
- Output to `/dist` folder

### 4. Preview Locally

```bash
bun run preview
```

### 5. Deploy

The build output in `/dist` can be deployed to any static hosting:
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- etc.

## 🏗️ Project Structure

```
src/
├── components/          # Vue components (islands)
│   ├── AppFooter.astro  # Static footer
│   ├── AppHeader.vue    # Interactive header (island)
│   ├── DirectoryCard.vue
│   ├── DirectoryList.vue
│   ├── NewsletterForm.vue
│   └── ...
├── layouts/
│   └── Layout.astro     # Base layout with SEO
├── lib/
│   ├── data.ts          # Build-time data fetching
│   └── supabase.ts      # Supabase client
├── pages/               # Routes
│   ├── index.astro      # Home page
│   ├── about.astro
│   ├── submit.astro
│   ├── stats.astro
│   ├── favorites.astro
│   ├── submissions.astro
│   └── directory/
│       └── [slug].astro # Dynamic directory pages
├── content/
│   ├── config.ts        # Content collections config
│   └── blog/            # Blog posts go here
└── views/               # Original Vue views (used as islands)
```

## 🔧 Development

### Dev Server

```bash
bun run dev
```

### Type Checking

```bash
bunx astro check
```

### Build

```bash
bun run build
```

## 📝 Notes

### Search & Filtering Fix

**Problem Solved**: The original Vue app only fetched and cached 50 directories, causing search/filtering to return incomplete results.

**Solution**: Astro now fetches ALL directories at build time and passes them to the DirectoryList component. All filtering happens client-side with the complete dataset.

### Vue Islands

Interactive components use Vue islands with `client:load` directive:
- Header (navigation, mobile menu, auth)
- DirectoryList (search, filters, selection)
- Forms (submit, newsletter)
- Auth modals

### Static Pages

Non-interactive pages are pure Astro (no JavaScript):
- About
- Individual directory detail pages (except voting button)

### Build-Time Data

All directories are fetched from Supabase during build time. To rebuild with updated data:

```bash
bun run build
```

## 🚀 Next Steps

1. **Add Blog Content**: Create Markdown files in `/src/content/blog/`
2. **Create Blog Routes**: Add `/src/pages/blog/[...slug].astro`
3. **pSEO Pages**: Create category landing pages
4. **Rebuild Trigger**: Set up Supabase webhooks to trigger rebuilds on data changes

## ⚠️ Breaking Changes

None! The migration is fully backward compatible from a user perspective.

## 🐛 Troubleshooting

### Build fails with Supabase error
- Ensure `.env` file exists with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### CSS not loading
- Check that `/src/style.css` is imported in `Layout.astro`
- Verify Tailwind v4 is configured correctly

### Vue components not interactive
- Ensure `client:load` directive is present on Vue islands
- Check browser console for errors

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [Astro + Vue](https://docs.astro.build/en/guides/integrations-guide/vue/)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
