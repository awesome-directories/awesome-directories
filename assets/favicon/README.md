# Favicon Generation Instructions

This folder contains the base favicon SVG and webmanifest. To generate the complete favicon package:

## Option 1: Use favicon.io (Recommended - Free & Easy)

1. Go to https://favicon.io/favicon-converter/
2. Upload `favicon.svg`
3. Download the generated package
4. Extract these files to this folder:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png` (180x180)
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

## Option 2: Use ImageMagick (CLI)

```bash
# Install ImageMagick first
# On Ubuntu/Debian: sudo apt-get install imagemagick
# On macOS: brew install imagemagick

# Generate PNG files
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
convert favicon.svg -resize 180x180 apple-touch-icon.png
convert favicon.svg -resize 192x192 android-chrome-192x192.png
convert favicon.svg -resize 512x512 android-chrome-512x512.png

# Generate ICO file (multi-size)
convert favicon.svg -define icon:auto-resize=16,32,48 favicon.ico
```

## Option 3: Use Real Favicon Generator

1. Go to https://realfavicongenerator.net/
2. Upload `favicon.svg`
3. Customize settings (use theme color: #3b82f6)
4. Download and extract to this folder

## HTML Integration

Add to your `<head>` section:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#3b82f6">
```

## Files Included

- ✅ `favicon.svg` - Source SVG (optimized for small sizes)
- ✅ `site.webmanifest` - Web app manifest (theme color: #3b82f6)
- ⏳ `favicon.ico` - Generate using instructions above
- ⏳ `favicon-16x16.png` - Generate using instructions above
- ⏳ `favicon-32x32.png` - Generate using instructions above
- ⏳ `apple-touch-icon.png` - Generate using instructions above
- ⏳ `android-chrome-192x192.png` - Generate using instructions above
- ⏳ `android-chrome-512x512.png` - Generate using instructions above

## Note

The SVG favicon works in modern browsers. PNG/ICO files ensure compatibility with older browsers and various platforms (iOS, Android, Windows, etc.).
