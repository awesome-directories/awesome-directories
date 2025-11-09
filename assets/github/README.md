# GitHub Repository Assets

Assets for GitHub repository branding and social sharing.

## Files

- **repo-social-preview.svg** - GitHub repository social preview (1280x640px)
- **readme-header.svg** - Optional banner for README.md (1200x300px)

## Setting Up Repository Social Preview

### Step 1: Export to PNG

Export `repo-social-preview.svg` to PNG at 1280x640px:

```bash
# Using Inkscape
inkscape repo-social-preview.svg --export-type=png --export-width=1280 --export-height=640 --export-filename=repo-social-preview.png

# Using ImageMagick
convert -background none repo-social-preview.svg -resize 1280x640 repo-social-preview.png
```

### Step 2: Upload to GitHub

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Social preview** section
4. Click **Edit**
5. Upload `repo-social-preview.png`
6. Click **Save**

The image will now appear when sharing your repository on social media!

## Using README Header

### Option 1: Hosted Image

If you want to use the header in your README.md:

1. Export `readme-header.svg` to PNG (1200x300px)
2. Upload to your repository in `/assets` or use GitHub's image upload
3. Add to README.md:

```markdown
![Awesome Directories](./assets/readme-header.png)

# awesome-directories

...
```

### Option 2: Direct SVG

You can also reference the SVG directly:

```markdown
![Awesome Directories](./assets/github/readme-header.svg)
```

## Recommended Badges

Add these badges to your README for a professional look:

```markdown
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/website-awesome--directories.com-3b82f6)](https://awesome-directories.com)
[![Directories](https://img.shields.io/badge/directories-300+-10b981)](https://awesome-directories.com)
[![Built with Vue](https://img.shields.io/badge/built%20with-Vue.js-42b883)](https://vuejs.org)
[![Backend](https://img.shields.io/badge/backend-Go-00add8)](https://golang.org)
[![Database](https://img.shields.io/badge/database-Supabase-3ecf8e)](https://supabase.com)
```

### Custom Shields.io Badges

Create custom badges at https://shields.io/ with these colors:

- **Primary**: `3b82f6` (blue)
- **Success**: `10b981` (green)
- **Warning**: `f59e0b` (orange)
- **Danger**: `ef4444` (red)

## README Structure Recommendation

```markdown
![Banner](./assets/github/readme-header.png)

<div align="center">

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/website-awesome--directories.com-3b82f6)](https://awesome-directories.com)
[![Directories](https://img.shields.io/badge/directories-300+-10b981)](https://awesome-directories.com)

**300+ curated launch directories for indie hackers**

[Visit Website](https://awesome-directories.com) · [Report Bug](https://github.com/awesome-directories/awesome-directories/issues) · [Request Feature](https://github.com/awesome-directories/awesome-directories/issues)

</div>

---

## 🚀 About

Awesome Directories is an open-source directory aggregator that helps indie hackers...

## ✨ Features

- 🎯 **Domain Rating Filters** - Filter directories by DR (60-300+)
- 🔗 **Dofollow Badges** - Instantly see which directories provide dofollow backlinks
- 👥 **Community Voting** - Help others by voting on directory quality
- 📋 **Multi-Select Checklist** - Build your launch checklist in minutes
- 🆓 **Free Forever** - No paywalls, no upsells, 100% open source

...
```

## Testing

- **Social Preview**: Create a test repository or ask a friend to share your repo link
- **README Rendering**: GitHub renders SVG in README files, but some features may not work (like gradients in older browsers)
- **Mobile View**: Check how the social preview looks on mobile devices

## Dimensions Reference

| Asset               | Size       | Usage                       |
| ------------------- | ---------- | --------------------------- |
| repo-social-preview | 1280x640px | Repository social sharing   |
| readme-header       | 1200x300px | README.md banner (optional) |

## GitHub Profile

If you want to use the logo in your GitHub profile:

1. Export `logo-icon.svg` to PNG (400x400px)
2. Upload to your profile repository in `/assets`
3. Reference in your profile README.md
