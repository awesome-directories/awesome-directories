# Awesome Directories - Brand Assets

**Complete brand identity and launch materials for Awesome Directories.**

Created: 2025-11-09
Status: ✅ Ready for Product Hunt launch

---

## 📦 What's Included

This package contains **46 files** across **5 priority phases**:

### ✅ Phase 1: Core Brand Assets (COMPLETE)

**Logo Package** (`/logos/`)

- `logo-full.svg` - Horizontal wordmark (primary use)
- `logo-icon.svg` - Square icon for avatars
- `logo-white.svg` - For dark backgrounds
- `logo-black.svg` - For light backgrounds
- `logo-blue.svg` - Brand color version
- Icon variations: `-white`, `-black`

**Favicon Package** (`/favicon/`)

- `favicon.svg` - Optimized for small sizes
- `site.webmanifest` - Web app manifest
- README with export instructions for PNG/ICO

**OG Images** (`/og-images/`)

- `og-homepage.svg` - Homepage social share (1200x630)
- `og-product-hunt.svg` - PH launch specific (1200x630)
- `og-template.svg` - Reusable template (1200x630)
- README with export and testing instructions

### ✅ Phase 2: Social Media Assets (COMPLETE)

**Twitter/X** (`/social/`)

- `twitter-profile.svg` - Profile picture (400x400)
- `twitter-header.svg` - Header image (1500x500)

**LinkedIn** (`/social/`)

- `linkedin-logo.svg` - Company logo (300x300)
- `linkedin-cover.svg` - Cover photo (1584x396)

**GitHub** (`/github/`)

- `repo-social-preview.svg` - Repository preview (1280x640)
- `readme-header.svg` - Optional README banner (1200x300)
- README with setup instructions

### ✅ Phase 3: Launch Campaign (COMPLETE)

**Product Hunt** (`/product-hunt/`)

- `thumbnail.svg` - Square thumbnail (240x240)
- `gallery-01-homepage.svg` - Hero & filters (1270x760)
- `gallery-02-filters.svg` - DR filter results (1270x760)
- `gallery-03-checklist.svg` - Checklist feature (1270x760)
- `gallery-04-detail.svg` - Directory detail page (1270x760)
- Comprehensive launch guide README

**Social Templates** (`/social/`)

- `instagram-post-template.svg` - Square posts (1080x1080)
- `twitter-thread-visual.svg` - Thread images (1200x675)
- `story-template.svg` - Stories/Reels (1080x1920)

### ✅ Phase 4: Website Assets (COMPLETE)

**Illustrations** (`/website/`)

- `hero-illustration.svg` - Homepage hero (600x400)

**Empty States** (`/website/empty-states/`)

- `no-results.svg` - No search results
- `no-favorites.svg` - No saved favorites
- `checklist-empty.svg` - Empty checklist

**Icon Set** (`/website/icons/`)

- 10 icons: filter, search, checklist, download, share, link, star, thumbs-up, external-link, folder
- All 24x24px, stroke-based, use `currentColor`

### ✅ Phase 5: Documentation (COMPLETE)

**Brand Guidelines** (`/docs/BRAND_GUIDELINES.md`)

- Brand foundation & archetype
- Logo usage rules & variations
- Complete color palette
- Typography system
- Voice & tone guidelines
- Do's and don'ts
- Application examples

**Design System** (`/docs/DESIGN_SYSTEM.md`)

- Design tokens & CSS variables
- Component library with code
- Responsive breakpoints
- Accessibility guidelines (WCAG 2.1 AA)
- Tailwind CSS configuration
- Complete code examples

---

## 🚀 Quick Start Guide

### 1. Export Assets to PNG

Most platforms need PNG files. Export from SVG:

**Using Inkscape (Free, CLI):**

```bash
cd assets

# Export OG images
inkscape og-images/og-homepage.svg --export-type=png --export-width=1200 --export-height=630 --export-filename=og-images/og-homepage.png

# Export social media assets
inkscape social/twitter-profile.svg --export-type=png --export-width=400 --export-height=400 --export-filename=social/twitter-profile.png

# Export Product Hunt assets
inkscape product-hunt/thumbnail.svg --export-type=png --export-width=240 --export-height=240 --export-filename=product-hunt/thumbnail.png
```

**Using Figma/Sketch:**

1. Import SVG files
2. Export at specified dimensions
3. Use 2x resolution for retina displays

**Using Online Tools:**

- CloudConvert: https://cloudconvert.com/svg-to-png
- Inkscape Online: https://inkscape.org/
- Real Favicon Generator: https://realfavicongenerator.net/

### 2. Optimize PNGs

After exporting, compress for web:

```bash
# Using TinyPNG CLI
tinypng *.png

# Or use online tool
# https://tinypng.com/
```

### 3. Set Up Favicons

1. Export `favicon/favicon.svg` to multiple PNG sizes
2. Follow instructions in `favicon/README.md`
3. Add to your HTML `<head>`:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#3b82f6" />
```

### 4. Update Social Media Profiles

**Twitter:**

1. Export `social/twitter-profile.svg` to PNG (400x400)
2. Export `social/twitter-header.svg` to PNG (1500x500)
3. Upload to Twitter profile settings

**LinkedIn:**

1. Export `social/linkedin-logo.svg` to PNG (300x300)
2. Export `social/linkedin-cover.svg` to PNG (1584x396)
3. Upload to LinkedIn company page

**GitHub:**

1. Export `github/repo-social-preview.svg` to PNG (1280x640)
2. Go to repo Settings → Social preview → Upload image

### 5. Prepare for Product Hunt Launch

Follow the complete guide in `product-hunt/README.md`:

**2 Weeks Before:**

- [ ] Export all gallery images to PNG
- [ ] Create PH account and build network
- [ ] Schedule launch for Tuesday-Thursday

**Launch Day:**

- [ ] Submit at 12:01 AM PT
- [ ] Post detailed "first comment"
- [ ] Share on social media
- [ ] Reply to every comment

---

## 🎨 Design System Quick Reference

### Colors

```css
/* Primary */
--primary: #3b82f6;
--primary-dark: #2563eb;
--primary-light: #60a5fa;

/* Semantic */
--success: #10b981; /* Dofollow, DR 300+ */
--warning: #f59e0b; /* Paid, DR 60-79 */
--danger: #ef4444; /* Errors, DR <60 */

/* Grays */
--gray-900: #1f2937; /* Headings */
--gray-700: #374151; /* Body text */
--gray-600: #6b7280; /* Secondary text */
```

### Typography

```css
/* Font Family */
font-family: 'Inter', system-ui, sans-serif;

/* Scale */
H1: 48px / 3rem / font-extrabold (800)
H2: 36px / 2.25rem / font-bold (700)
H3: 28px / 1.75rem / font-bold (700)
H4: 20px / 1.25rem / font-semibold (600)
Body: 16px / 1rem / font-normal (400)
Small: 14px / 0.875rem / font-normal (400)
```

### Spacing

8px base unit:

- xs: 8px
- sm: 16px
- md: 24px
- lg: 32px
- xl: 64px
- 2xl: 96px

### Components

See `docs/DESIGN_SYSTEM.md` for complete component library with Tailwind classes.

---

## 📁 File Structure

```
assets/
├── logos/                  # Logo variations (SVG)
├── favicon/               # Favicon package + manifest
├── og-images/            # Social share images (1200x630)
├── social/               # Social media assets
│   ├── twitter-*        # Twitter profile + header
│   ├── linkedin-*       # LinkedIn logo + cover
│   ├── instagram-*      # Instagram templates
│   └── story-*          # Story/Reel templates
├── github/               # GitHub repository assets
├── product-hunt/         # PH launch assets + guide
├── website/              # Website UI assets
│   ├── hero-illustration.svg
│   ├── empty-states/    # Empty state illustrations
│   └── icons/           # Icon set (24x24 SVG)
└── docs/                 # Documentation
    ├── BRAND_GUIDELINES.md
    └── DESIGN_SYSTEM.md
```

---

## 🎯 Next Steps

### Immediate (This Week)

1. **Export Critical Assets**
   - [ ] Export OG images to PNG (1200x630)
   - [ ] Export favicon set
   - [ ] Export social media profile pictures

2. **Update Profiles**
   - [ ] Twitter profile + header
   - [ ] LinkedIn company page
   - [ ] GitHub repository preview

3. **Implement on Website**
   - [ ] Add favicon to `<head>`
   - [ ] Add OG meta tags
   - [ ] Use logo in header
   - [ ] Apply color system

### Before Product Hunt Launch (2 Weeks)

1. **Product Hunt Prep**
   - [ ] Export all gallery images
   - [ ] Write product description
   - [ ] Prepare first comment
   - [ ] Build upvote network

2. **Social Campaign**
   - [ ] Create 10-15 social posts using templates
   - [ ] Schedule pre-launch announcements
   - [ ] Prepare launch day content

3. **Website Polish**
   - [ ] Integrate all icons
   - [ ] Add empty state illustrations
   - [ ] Implement hero illustration
   - [ ] Test mobile responsiveness

### Post-Launch

1. **Track Performance**
   - Monitor PH ranking and upvotes
   - Track website traffic from social
   - Measure email signups

2. **Iterate Based on Feedback**
   - Gather community feedback
   - Update assets if needed
   - Document learnings

---

## 🛠️ Tools & Resources

### Design Tools

- **Inkscape** (Free): https://inkscape.org/ - Edit SVGs
- **Figma** (Freemium): https://figma.com/ - Design mockups
- **SVGOMG** (Free): https://jakearchibald.github.io/svgomg/ - Optimize SVGs

### Export & Optimization

- **CloudConvert**: https://cloudconvert.com/svg-to-png - SVG to PNG
- **TinyPNG**: https://tinypng.com/ - Compress PNGs
- **Real Favicon Generator**: https://realfavicongenerator.net/ - Generate favicons

### Testing

- **Facebook OG Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: Paste URL in LinkedIn to preview
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

## ❓ FAQ

**Q: Do I need to use all these assets?**
A: No! Use what you need. Priority 1 (logos, favicons, OG images) is essential. Others are optional.

**Q: Can I modify the colors/fonts?**
A: Yes, but document changes in brand guidelines. Keep accessibility in mind (WCAG AA).

**Q: How do I integrate icons in Vue?**
A: Copy SVG code directly into components or use as `<img>` tags. Icons use `currentColor` for theming.

**Q: What if I find a bug or need a new asset?**
A: Open an issue on GitHub or update the assets yourself (they're all SVG, easy to edit).

**Q: Can I use these assets for other projects?**
A: Yes! Licensed under Apache-2.0. Attribution appreciated but not required.

---

## 📞 Support

- **Documentation**: `docs/BRAND_GUIDELINES.md` and `docs/DESIGN_SYSTEM.md`
- **GitHub Issues**: [Report problems or request assets](https://github.com/awesome-directories/awesome-directories/issues)
- **Twitter**: [@meysam_io](https://twitter.com/meysam_io)

---

## ✅ Brand Asset Checklist

### Core Assets

- [x] Logo variations (full, icon, colors)
- [x] Favicon package
- [x] OG images (homepage, PH, template)

### Social Media

- [x] Twitter profile + header
- [x] LinkedIn logo + cover
- [x] GitHub repository preview
- [x] Social content templates

### Launch Materials

- [x] Product Hunt thumbnail + gallery
- [x] Launch guide & checklist
- [x] Social campaign templates

### Website Assets

- [x] Hero illustration
- [x] Empty state illustrations (3)
- [x] Icon set (10 icons)

### Documentation

- [x] Brand guidelines
- [x] Design system
- [x] Component library

---

**Status: 🚀 READY TO LAUNCH**

All 46 assets created, documented, and committed to git.

Good luck with your Product Hunt launch! 🎉

---

**License:** Apache-2.0
**Version:** 1.0
**Last Updated:** 2025-11-09
