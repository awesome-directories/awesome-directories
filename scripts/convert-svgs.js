/**
 * SVG to PNG Converter
 * Converts all SVG brand assets to PNG format for broader compatibility
 *
 * Requirements: npm install sharp
 * Usage: node convert-svgs.js
 */

import log from "loglevel";
import { join } from "path";
import sharp from "sharp";

const conversions = [
  // OG Images (1200x630)
  {
    input: "og-image.svg",
    output: "og-image.png",
    width: 1200,
    height: 630,
    format: "png",
  },
  {
    input: "og-image.svg",
    output: "og-image.jpg",
    width: 1200,
    height: 630,
    format: "jpeg",
    quality: 90,
  },

  // Favicon sizes (from favicon.svg)
  {
    input: "favicon.svg",
    output: "favicon-16x16.png",
    width: 16,
    height: 16,
    format: "png",
  },
  {
    input: "favicon.svg",
    output: "favicon-32x32.png",
    width: 32,
    height: 32,
    format: "png",
  },
  {
    input: "favicon.svg",
    output: "favicon-32.png",
    width: 32,
    height: 32,
    format: "png",
  },
  {
    input: "favicon.svg",
    output: "favicon-180.png",
    width: 180,
    height: 180,
    format: "png",
  },
  {
    input: "favicon.svg",
    output: "favicon-192.png",
    width: 192,
    height: 192,
    format: "png",
  },
  {
    input: "favicon.svg",
    output: "favicon-512.png",
    width: 512,
    height: 512,
    format: "png",
  },
  {
    input: "favicon.svg",
    output: "apple-touch-icon.png",
    width: 180,
    height: 180,
    format: "png",
  },
  {
    input: "favicon.svg",
    output: "android-chrome-192x192.png",
    width: 192,
    height: 192,
    format: "png",
  },
  {
    input: "favicon.svg",
    output: "android-chrome-512x512.png",
    width: 512,
    height: 512,
    format: "png",
  },

  // Social Media Cover Photos
  {
    input: "linkedin-cover.svg",
    output: "linkedin-cover.png",
    width: 1584,
    height: 396,
    format: "png",
  },
  {
    input: "twitter-header.svg",
    output: "twitter-header.png",
    width: 1500,
    height: 500,
    format: "png",
  },

  // Logo variations
  {
    input: "logo-black.svg",
    output: "logo-black.png",
    width: 400,
    height: 100,
    format: "png",
  },
  {
    input: "logo-blue.svg",
    output: "logo-blue.png",
    width: 400,
    height: 100,
    format: "png",
  },
  {
    input: "logo-full.svg",
    output: "logo-full.png",
    width: 400,
    height: 100,
    format: "png",
  },
  {
    input: "logo-white.svg",
    output: "logo-white.png",
    width: 400,
    height: 100,
    format: "png",
  },

  {
    input: "logo-icon-black.svg",
    output: "logo-icon-black.png",
    width: 512,
    height: 512,
    format: "png",
  },
  {
    input: "logo-icon.svg",
    output: "logo-icon.png",
    width: 512,
    height: 512,
    format: "png",
  },
  {
    input: "logo-icon-white.svg",
    output: "logo-icon-white.png",
    width: 512,
    height: 512,
    format: "png",
  },
  {
    input: "logo-icon.svg",
    output: "logo.png",
    width: 512,
    height: 512,
    format: "png",
  },
  {
    baseUrl: "./assets",
    input: "product-hunt/gallery-01-homepage.svg",
    output: "product-hunt/gallery-01-homepage.png",
    width: 1280,
    height: 720,
    format: "png",
  },
  {
    baseUrl: "./assets",
    input: "product-hunt/gallery-02-filters.svg",
    output: "product-hunt/gallery-02-filters.png",
    width: 1280,
    height: 720,
    format: "png",
  },
  {
    baseUrl: "./assets",
    input: "product-hunt/gallery-03-checklist.svg",
    output: "product-hunt/gallery-03-checklist.png",
    width: 1280,
    height: 720,
    format: "png",
  },
  {
    baseUrl: "./assets",
    input: "product-hunt/gallery-04-detail.svg",
    output: "product-hunt/gallery-04-detail.png",
    width: 1280,
    height: 720,
    format: "png",
  },
];

async function convertSVGtoPNG() {
  const publicDir = "./public";

  log.info("🎨 Converting SVGs to PNGs and JPGs...\n");

  let successful = 0;
  let failed = 0;

  for (const conversion of conversions) {
    var dir = conversion.baseUrl || publicDir;
    const inputPath = join(dir, conversion.input);
    const outputPath = join(dir, conversion.output);

    try {
      let pipeline = sharp(inputPath).resize(
        conversion.width,
        conversion.height,
      );

      if (conversion.format === "jpeg") {
        pipeline = pipeline.jpeg({ quality: conversion.quality || 90 });
      } else {
        pipeline = pipeline.png();
      }

      await pipeline.toFile(outputPath);

      log.info(`✅ ${conversion.input} → ${conversion.output}`);
      successful++;
    } catch (error) {
      log.error(`❌ Failed to convert ${conversion.input}:`, error.message);
      failed++;
    }
  }

  log.info(`\n📊 Conversion complete:`);
  log.info(`   Successful: ${successful}`);
  log.info(`   Failed: ${failed}`);

  if (successful > 0) {
    log.info(`\n✨ PNG and JPG files generated in ${publicDir}/`);
  }
}

// Run the conversion
convertSVGtoPNG().catch(log.error);
