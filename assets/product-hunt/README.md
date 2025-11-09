# Product Hunt Launch Assets

Complete asset package for your Product Hunt launch.

## Files

- **thumbnail.svg** - Product thumbnail (240x240px)
- **gallery-01-homepage.svg** - Homepage hero & filters
- **gallery-02-filters.svg** - DR 70+ filter results
- **gallery-03-checklist.svg** - Launch checklist feature
- **gallery-04-detail.svg** - Directory detail page

## Exporting for Product Hunt

### Thumbnail (Required)

Export `thumbnail.svg` to PNG at 240x240px:

```bash
# Using Inkscape
inkscape thumbnail.svg --export-type=png --export-width=240 --export-height=240 --export-filename=thumbnail.png

# Using ImageMagick
convert -background none thumbnail.svg -resize 240x240 thumbnail.png
```

### Gallery Images (Highly Recommended)

Export each gallery SVG to PNG at 1270x760px:

```bash
# Using Inkscape
inkscape gallery-01-homepage.svg --export-type=png --export-width=1270 --export-height=760 --export-filename=gallery-01-homepage.png
inkscape gallery-02-filters.svg --export-type=png --export-width=1270 --export-height=760 --export-filename=gallery-02-filters.png
inkscape gallery-03-checklist.svg --export-type=png --export-width=1270 --export-height=760 --export-filename=gallery-03-checklist.png
inkscape gallery-04-detail.svg --export-type=png --export-width=1270 --export-height=760 --export-filename=gallery-04-detail.png

# Using ImageMagick (batch)
for file in gallery-*.svg; do
  convert -background none "$file" -resize 1270x760 "${file%.svg}.png"
done
```

## Product Hunt Specifications

| Asset Type | Dimensions | Format | Notes |
|------------|-----------|--------|-------|
| Thumbnail | 240x240px | PNG | Required, square |
| Gallery | 1270x760px | PNG/GIF | Up to 8 images |
| Video | 16:9 ratio | MP4 | Optional, under 100MB |

## Product Hunt Launch Checklist

### 2 Weeks Before Launch

- [ ] Create Product Hunt account
- [ ] Join PH community, comment on products
- [ ] Build launch day upvote network
- [ ] Schedule launch for Tuesday-Thursday (best days)

### 1 Week Before Launch

- [ ] Export all assets from SVG to PNG
- [ ] Optimize PNGs (use TinyPNG)
- [ ] Draft product description
- [ ] Prepare "first comment" with details
- [ ] Line up "Hunter" (optional but helpful)

### 3 Days Before Launch

- [ ] Upload thumbnail and gallery images
- [ ] Write compelling tagline (60 chars max)
- [ ] Set launch date (12:01 AM PT)
- [ ] Prepare Twitter/LinkedIn announcements
- [ ] Brief your team on launch plan

### Launch Day

- [ ] Submit at 12:01 AM PT sharp
- [ ] Post detailed "first comment" immediately
- [ ] Share on Twitter, LinkedIn, communities
- [ ] Reply to every comment (engagement helps ranking)
- [ ] Monitor throughout the day
- [ ] Thank supporters

## Gallery Image Descriptions

Use these captions when uploading:

1. **gallery-01-homepage.png**
   - *Homepage with quick DR filters and hero section showcasing key features*

2. **gallery-02-filters.png**
   - *Filter by Domain Rating 70+ to find 142 high-quality directories with dofollow backlinks*

3. **gallery-03-checklist.png**
   - *Multi-select checklist to track your launch progress across all directories*

4. **gallery-04-detail.png**
   - *Detailed directory pages with submission info, community feedback, and helpful votes*

## Writing Your PH Description

### Tagline (60 chars max)

Examples:
- "300+ curated directories to launch your product"
- "Find the top 20 directories in under 3 minutes"
- "Launch directory aggregator with DR filters"

### Description (~260 chars)

Example:
"Stop wasting time on dead links from 2012. Awesome Directories curates 300+ launch directories with Domain Rating filters (60-300+), dofollow badges, and community voting. Find the top 20 directories worth your time in under 3 minutes. Free & open source."

### First Comment (Post This Immediately)

```
Hey Product Hunt! 👋

I'm Meysam, and I built Awesome Directories because I wasted 20 hours scrolling through outdated directory lists with dead links from 2012.

**The Problem:**
Every indie hacker knows you should submit to directories, but which ones actually matter? Most lists are:
- Full of dead links
- Missing Domain Ratings
- Don't show dofollow vs nofollow
- Not community-verified

**The Solution:**
Awesome Directories gives you:
✅ 300+ curated directories
✅ Domain Rating filters (60-300+)
✅ Dofollow badges (instant visibility)
✅ Community voting (real feedback)
✅ Multi-select checklist (track progress)

**Why Free & Open Source?**
I'm building in public to grow my personal brand and email list. No paywalls, no upsells, 100% Apache-2.0 license. The code is on GitHub.

**Built With:**
- Vue.js + Go + Supabase
- Weekly directory updates
- Giscus comments

I'd love your feedback! What directories am I missing? What features would help you most?

🔗 Try it: awesome-directories.com
🐙 GitHub: github.com/yourusername/awesome-directories

Happy to answer any questions!
```

## Optimization Tips

### Image Quality
- Use PNG format (not JPG) for crisp text
- Optimize with TinyPNG (reduces file size 60-70%)
- Ensure text is readable at 100% zoom

### Gallery Order
1. Start with hero/overview (gallery-01)
2. Show key differentiator (gallery-02 filters)
3. Highlight unique features (gallery-03 checklist)
4. End with details/depth (gallery-04)

### Thumbnail Design
- High contrast for small size visibility
- Recognizable icon (folder + star)
- Works in dark and light modes

## Tracking Launch Success

Monitor these metrics:
- **Upvotes**: Goal 100+ for top 10
- **Comments**: Reply to every single one
- **Traffic**: Track via analytics
- **Signups**: Email list growth
- **Stars**: GitHub star growth

## After Launch

- [ ] Thank everyone who upvoted
- [ ] Share "We're #X on PH today!" updates
- [ ] Write post-mortem blog post
- [ ] Add PH badge to website
- [ ] Update README with PH link

## Product Hunt Badge

Add to your website:

```html
<a href="https://www.producthunt.com/posts/YOUR-PRODUCT?utm_source=badge-featured&utm_medium=badge&utm_source=badge-YOUR-PRODUCT" target="_blank">
  <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=YOUR-POST-ID&theme=light" alt="Awesome Directories - 300+ curated launch directories | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" />
</a>
```

## Resources

- **PH Launch Guide**: https://blog.producthunt.com/how-to-launch-on-product-hunt-7c1843e06399
- **Best Time to Launch**: Tuesday-Thursday, 12:01 AM PT
- **Upvote Network**: Build on Twitter, indie hacker communities
- **Hunter**: Find someone with 1000+ followers to "hunt" your product

Good luck with your launch! 🚀
