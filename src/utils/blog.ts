import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export interface TocItem {
  depth: number;
  text: string;
  slug: string;
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return readingTime;
}

/**
 * Generate table of contents from markdown headings
 */
export function generateTableOfContents(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const text = match[2].trim();
    const slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    toc.push({ depth, text, slug });
  }

  return toc;
}

/**
 * Filter out draft and future posts in production
 */
export function filterPublishedPosts(
  posts: CollectionEntry<"blog">[],
): CollectionEntry<"blog">[] {
  const now = new Date();
  const isProduction = import.meta.env.PROD;

  return posts.filter((post) => {
    // In development, show all posts
    if (!isProduction) return true;

    // In production, filter drafts and future posts
    const isDraft = post.data.draft;
    const isFuture = post.data.date > now;

    return !isDraft && !isFuture;
  });
}

/**
 * Get all published blog posts sorted by date (newest first)
 */
export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  const allPosts = await getCollection("blog");
  const publishedPosts = filterPublishedPosts(allPosts);

  return publishedPosts.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
}

/**
 * Find related posts based on shared tags
 * Returns top 3 posts with most shared tags
 */
export function findRelatedPosts(
  currentPost: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[],
  limit = 3,
): CollectionEntry<"blog">[] {
  const currentTags = currentPost.data.tags;
  const currentSlug = currentPost.slug;

  // Calculate similarity score for each post
  const postsWithScores = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const sharedTags = post.data.tags.filter((tag) =>
        currentTags.includes(tag),
      );
      return {
        post,
        score: sharedTags.length,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // Sort by score first, then by date
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.post.data.date.getTime() - a.post.data.date.getTime();
    });

  return postsWithScores.slice(0, limit).map((item) => item.post);
}

/**
 * Get all unique tags from published posts
 */
export function getAllTags(posts: CollectionEntry<"blog">[]): string[] {
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    post.data.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

/**
 * Get posts by tag
 */
export function getPostsByTag(
  posts: CollectionEntry<"blog">[],
  tag: string,
): CollectionEntry<"blog">[] {
  return posts.filter((post) =>
    post.data.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()),
  );
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Paginate items
 */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.ceil(items.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    totalItems: items.length,
  };
}
