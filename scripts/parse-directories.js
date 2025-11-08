import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to create slug from name (without external library)
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to normalize URL
function normalizeUrl(url) {
  if (!url) return null;
  let normalized = url.trim();
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  normalized = normalized.replace(/\/$/, '');
  return normalized;
}

// Helper to extract categories from text
function extractCategories(text) {
  const categories = [];
  const keywords = {
    'SaaS': /saas/i,
    'Startup': /startup/i,
    'Dev Tools': /dev\s*tools|developer/i,
    'Product Launch': /product\s*hunt|launch/i,
    'Build-in-Public': /build.*public|indie/i,
    'General': /general/i,
    'Forums': /reddit|forum|community/i
  };

  for (const [category, regex] of Object.entries(keywords)) {
    if (regex.test(text)) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ['General'];
}

// Parse sites1.csv
function parseSites1() {
  const csvPath = path.join(__dirname, '../dataset/sites1.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  const directories = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^,([^,]+),(.+)$/);
    if (!match) continue;

    const [, title, website] = match;
    if (!title || !website) continue;

    const slug = createSlug(title);
    const url = normalizeUrl(website);

    if (!url) continue;

    directories.push({
      slug,
      name: title.trim(),
      url,
      categories: ['General'],
      pricing_type: 'free',
      is_active: true
    });
  }

  return directories;
}

// Parse sites2.md and sites3.md for directories with DR info
function parseSites2and3() {
  const directories = [];

  // Parse sites3.md
  const sites3Path = path.join(__dirname, '../dataset/sites3.md');
  const sites3Content = fs.readFileSync(sites3Path, 'utf-8');

  const directoryPattern = /\*\*(.+?)\*\*.*?(?:\(DR\s+(\d+)\))?.*?-\s*(.*?)\s*-\s*(.+)/gi;

  let match;
  while ((match = directoryPattern.exec(sites3Content)) !== null) {
    const [, name, dr, details, urlText] = match;

    const slug = createSlug(name);
    const url = normalizeUrl(urlText);

    if (!url) continue;

    const categories = extractCategories(name + ' ' + details);

    let pricing_type = 'free';
    let is_dofollow = false;

    if (/paid|\$\d+/i.test(details)) {
      pricing_type = 'paid';
    } else if (/freemium/i.test(details)) {
      pricing_type = 'freemium';
    }

    if (/dofollow/i.test(details)) {
      is_dofollow = true;
    }

    directories.push({
      slug,
      name: name.trim(),
      url,
      domain_rating: dr ? parseInt(dr) : null,
      is_dofollow,
      categories,
      pricing_type,
      is_active: true
    });
  }

  return directories;
}

// Merge all data sources
function mergeDirectories() {
  const sites1Data = parseSites1();
  const sites23Data = parseSites2and3();

  const directoryMap = new Map();

  sites1Data.forEach(dir => {
    directoryMap.set(dir.slug, dir);
  });

  sites23Data.forEach(dir => {
    const existing = directoryMap.get(dir.slug);
    if (existing) {
      directoryMap.set(dir.slug, {
        ...existing,
        ...dir,
        categories: dir.categories.length > 1 ? dir.categories : existing.categories
      });
    } else {
      directoryMap.set(dir.slug, dir);
    }
  });

  return Array.from(directoryMap.values());
}

// Generate seed data
function generateSeedData() {
  const directories = mergeDirectories();

  console.log(`Parsed ${directories.length} directories`);

  directories.forEach(dir => {
    if (!dir.description) {
      dir.description = `Submit your product to ${dir.name} to reach your target audience.`;
    }

    if (!dir.submission_url) {
      dir.submission_url = dir.url;
    }
  });

  directories.sort((a, b) => {
    if (a.domain_rating && b.domain_rating) {
      return b.domain_rating - a.domain_rating;
    }
    if (a.domain_rating) return -1;
    if (b.domain_rating) return 1;
    return a.name.localeCompare(b.name);
  });

  return directories;
}

// Main execution
const directories = generateSeedData();

const outputPath = path.join(__dirname, '../supabase/seed-data.json');
fs.writeFileSync(outputPath, JSON.stringify(directories, null, 2));

console.log(`✅ Generated seed data: ${outputPath}`);
console.log(`📊 Total directories: ${directories.length}`);

const withDR = directories.filter(d => d.domain_rating).length;
const dofollow = directories.filter(d => d.is_dofollow).length;
const free = directories.filter(d => d.pricing_type === 'free').length;

console.log(`   - With DR rating: ${withDR}`);
console.log(`   - Dofollow links: ${dofollow}`);
console.log(`   - Free directories: ${free}`);
