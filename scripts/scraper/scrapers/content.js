/**
 * Content Extraction and Compilation Module
 * Compiles scraped data into structured format for manual curation
 */

import { logger } from '../utils/logger.js';

/**
 * Generate curation suggestions from scraped data
 * This provides a human-readable summary to aid in manual curation
 */
export function generateCurationSuggestions(scrapedData) {
  const suggestions = {
    shortDescription: '',
    longDescription: '',
    categories: [],
    pricingInsights: '',
    linkQuality: '',
    submissionProcess: '',
    keyFeatures: [],
    qualityScore: 0,
  };

  try {
    // Extract metadata
    const metadata = scrapedData.homepage.metadata;
    const hero = scrapedData.homepage.hero;
    const features = scrapedData.homepage.features;
    const pricing = scrapedData.homepage.pricing;
    const links = scrapedData.homepage.links;

    // Generate short description (1-2 sentences)
    if (metadata.description) {
      suggestions.shortDescription = metadata.description.slice(0, 200);
    } else if (hero.subheading) {
      suggestions.shortDescription = hero.subheading;
    } else if (hero.heading) {
      suggestions.shortDescription = hero.heading;
    }

    // Generate long description (compilation of all content)
    const descriptionParts = [];

    if (hero.heading) {
      descriptionParts.push(`**${hero.heading}**`);
    }

    if (hero.subheading) {
      descriptionParts.push(hero.subheading);
    }

    if (features && features.length > 0) {
      descriptionParts.push('\n**Key Features:**');
      features.slice(0, 5).forEach(feature => {
        if (feature.title) {
          descriptionParts.push(`- ${feature.title}`);
          suggestions.keyFeatures.push(feature.title);
        }
      });
    }

    suggestions.longDescription = descriptionParts.join('\n');

    // Suggest categories based on content
    const contentText = `${metadata.title} ${metadata.description} ${metadata.keywords}`.toLowerCase();

    const categoryKeywords = {
      'Developer Tools': ['developer', 'api', 'code', 'github', 'programming'],
      'Marketing': ['marketing', 'seo', 'email', 'ads', 'analytics'],
      'Design': ['design', 'ui', 'ux', 'figma', 'sketch'],
      'Productivity': ['productivity', 'task', 'project', 'management', 'workflow'],
      'AI/ML': ['ai', 'machine learning', 'ml', 'artificial intelligence', 'chatgpt'],
      'SaaS': ['saas', 'software', 'cloud', 'platform'],
      'Startup': ['startup', 'founder', 'entrepreneur', 'bootstrap'],
      'Business': ['business', 'enterprise', 'b2b', 'corporate'],
    };

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const matchCount = keywords.filter(keyword => contentText.includes(keyword)).length;
      if (matchCount >= 2) {
        suggestions.categories.push(category);
      }
    });

    // Pricing insights
    if (pricing.found) {
      if (pricing.freeOption) {
        suggestions.pricingInsights = 'Offers a free plan. ';
      }
      if (pricing.plans.length > 0) {
        const amounts = pricing.plans.map(p => `$${p.amount}/${p.period}`).join(', ');
        suggestions.pricingInsights += `Paid plans: ${amounts}`;
      }
    } else {
      suggestions.pricingInsights = 'Pricing information not clearly visible on homepage.';
    }

    // Link quality assessment
    if (links.quality.providesDofollow) {
      suggestions.linkQuality = `✅ Provides dofollow links (${links.quality.dofollowPercentage}% dofollow)`;
    } else {
      suggestions.linkQuality = `⚠️ No dofollow links detected (${links.quality.dofollowPercentage}% dofollow)`;
    }

    // Submission process
    if (links.quality.hasSubmissionLinks) {
      suggestions.submissionProcess = `Submission page(s) found: ${links.quality.submissionUrls.slice(0, 3).join(', ')}`;
    } else if (scrapedData.smartCrawl && scrapedData.smartCrawl.submissionUrls.length > 0) {
      suggestions.submissionProcess = `Submission URLs found via crawl: ${scrapedData.smartCrawl.submissionUrls.slice(0, 3).join(', ')}`;
    } else {
      suggestions.submissionProcess = '⚠️ No clear submission process found. Manual investigation needed.';
    }

    // Calculate quality score (0-100)
    let score = 0;

    // Has description (20 points)
    if (suggestions.shortDescription.length > 50) score += 20;

    // Has features (20 points)
    if (features.length >= 3) score += 20;

    // Provides dofollow (30 points)
    if (links.quality.providesDofollow) score += 30;

    // Has submission links (15 points)
    if (links.quality.hasSubmissionLinks) score += 15;

    // Has pricing info (15 points)
    if (pricing.found) score += 15;

    suggestions.qualityScore = score;

    logger.success('Curation suggestions generated', { qualityScore: score });
  } catch (error) {
    logger.error('Failed to generate curation suggestions', { error: error.message });
  }

  return suggestions;
}

/**
 * Compile all scraped data into final format
 */
export function compileScrapedData(directory, homepageData, linkData, smartCrawlData) {
  return {
    directory: {
      id: directory.id,
      name: directory.name,
      url: directory.url,
      existingDescription: directory.description,
      existingCategories: directory.categories,
      pricingType: directory.pricingType,
    },
    homepage: {
      ...homepageData,
      links: linkData,
    },
    smartCrawl: smartCrawlData,
    curationSuggestions: null, // Will be filled later
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Extract content for export
 */
export function extractContentForExport(compiledData) {
  const suggestions = compiledData.curationSuggestions;

  return {
    // Basic info
    directoryName: compiledData.directory.name,
    url: compiledData.directory.url,

    // Suggestions
    suggestedDescription: suggestions.shortDescription,
    suggestedLongDescription: suggestions.longDescription,
    suggestedCategories: suggestions.categories.join(', '),

    // Analysis
    linkQuality: suggestions.linkQuality,
    pricingInfo: suggestions.pricingInsights,
    submissionProcess: suggestions.submissionProcess,
    keyFeatures: suggestions.keyFeatures.join(', '),
    qualityScore: suggestions.qualityScore,

    // Metadata
    metaTitle: compiledData.homepage.metadata.title,
    metaDescription: compiledData.homepage.metadata.description,

    // Hero
    heroHeading: compiledData.homepage.hero.heading,
    heroSubheading: compiledData.homepage.hero.subheading,

    // Stats
    totalLinks: compiledData.homepage.links.stats.total,
    dofollowLinks: compiledData.homepage.links.stats.dofollow,
    nofollowLinks: compiledData.homepage.links.stats.nofollow,
    externalDofollowLinks: compiledData.homepage.links.stats.externalDofollow,

    // URLs
    submissionUrls: compiledData.homepage.links.quality.submissionUrls.join(' | '),

    // Timestamp
    scrapedAt: compiledData.scrapedAt,
  };
}

export default {
  generateCurationSuggestions,
  compileScrapedData,
  extractContentForExport,
};
