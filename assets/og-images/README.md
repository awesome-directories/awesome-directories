# Open Graph Images

Social sharing images optimized for Facebook, Twitter, LinkedIn, and Product Hunt.

## Files

- **og-homepage.svg** - Homepage social share (blue gradient with features)
- **og-product-hunt.svg** - Product Hunt launch specific (dark theme with CTA)
- **og-template.svg** - Generic template for custom content

## Export to PNG (1200x630px)

### Option 1: Using Figma (Recommended)
1. Import SVG to Figma
2. Export as PNG at 1200x630px
3. Use 2x resolution for crisp images

### Option 2: Using Inkscape (Free)
```bash
inkscape og-homepage.svg --export-type=png --export-width=1200 --export-height=630 --export-filename=og-homepage.png
inkscape og-product-hunt.svg --export-type=png --export-width=1200 --export-height=630 --export-filename=og-product-hunt.png
inkscape og-template.svg --export-type=png --export-width=1200 --export-height=630 --export-filename=og-template.png
```

### Option 3: Using ImageMagick
```bash
convert -background none og-homepage.svg -resize 1200x630 og-homepage.png
convert -background none og-product-hunt.svg -resize 1200x630 og-product-hunt.png
convert -background none og-template.svg -resize 1200x630 og-template.png
```

### Option 4: Online Tool
- Use https://cloudconvert.com/svg-to-png
- Upload SVG, set dimensions to 1200x630px
- Download PNG

## Optimize PNGs

After exporting, compress with:
- **TinyPNG**: https://tinypng.com/
- **ImageOptim**: https://imageoptim.com/ (Mac)
- **CLI**: `optipng og-*.png` or `pngquant og-*.png`

Target: Keep under 500KB for fast social media loading

## HTML Implementation

```html
<!-- Default OG tags -->
<meta property="og:image" content="https://awesome-directories.com/og-homepage.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://awesome-directories.com/og-homepage.png">

<!-- Additional OG tags -->
<meta property="og:title" content="Awesome Directories">
<meta property="og:description" content="300+ curated launch directories for indie hackers">
<meta property="og:url" content="https://awesome-directories.com">
<meta property="og:type" content="website">
```

## Testing

Test how your OG images appear:
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: Share URL and check preview
- **Slack**: Paste URL in a DM to yourself

## Dimensions

- **Standard**: 1200x630px (1.91:1 ratio)
- **Minimum**: 600x315px
- **Maximum**: 8MB file size
- **Recommended**: Keep under 500KB for fast loading

## Platform Specifications

| Platform | Recommended Size | Aspect Ratio | Format |
|----------|-----------------|--------------|--------|
| Facebook | 1200x630px | 1.91:1 | PNG/JPG |
| Twitter | 1200x675px | 16:9 | PNG/JPG |
| LinkedIn | 1200x627px | 1.91:1 | PNG/JPG |
| Product Hunt | 1270x760px | 1.67:1 | PNG |

Note: 1200x630px works well across all platforms (safe bet).

## Customizing the Template

To create custom OG images:

1. Open `og-template.svg` in a text editor
2. Find the `[Your Headline Here]` text
3. Replace with your custom headline
4. Update the subheading text
5. Export to PNG using methods above

Or use design tools:
- **Figma**: Import SVG, edit text, export
- **Canva**: Upload as template, customize
- **Inkscape**: Open, edit text, export
