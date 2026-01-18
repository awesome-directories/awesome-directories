import { writeFile, mkdir, readFile, readdir } from "fs/promises";
import { join, dirname } from "path";
import log from "../lib/logger.js";

/**
 * Astro integration to generate alternate markdown files for blog posts.
 * This implements the "Third Audience" pattern for AI agents.
 *
 * For blog posts:
 * - Reads the original markdown content from src/content/blog/
 * - Writes it to the output directory as /blog/{slug}.md
 *
 * AI crawlers can discover these via:
 * - <link rel="alternate" type="text/markdown"> in HTML head
 * - Direct URL access (e.g., /blog/my-post.md)
 */

/**
 * Extract frontmatter and body from a markdown file
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterStr = match[1];
  const body = match[2];

  // Simple YAML parsing for common fields
  const frontmatter = {};
  const lines = frontmatterStr.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Handle boolean
      if (value === "true") value = true;
      else if (value === "false") value = false;

      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

/**
 * Generate a clean markdown file for AI consumption
 */
function generateMarkdownForAI(frontmatter, body, slug) {
  const lines = [];

  // Add title as H1
  if (frontmatter.title) {
    lines.push(`# ${frontmatter.title}`);
    lines.push("");
  }

  // Add metadata block
  lines.push("> **Metadata**");
  if (frontmatter.description) {
    lines.push(`> - Description: ${frontmatter.description}`);
  }
  if (frontmatter.date) {
    lines.push(`> - Published: ${frontmatter.date}`);
  }
  if (frontmatter.author) {
    lines.push(`> - Author: ${frontmatter.author}`);
  }
  if (frontmatter.tags) {
    const tagsStr =
      typeof frontmatter.tags === "string"
        ? frontmatter.tags
        : JSON.stringify(frontmatter.tags);
    lines.push(`> - Tags: ${tagsStr}`);
  }
  lines.push(`> - URL: https://awesome-directories.com/blog/${slug}`);
  lines.push("");

  // Add the body content
  lines.push(body.trim());

  return lines.join("\n");
}

/**
 * Process blog posts and generate markdown files
 */
async function generateBlogMarkdown(outputDir) {
  const blogDir = join(process.cwd(), "src", "content", "blog");
  const blogOutputDir = join(outputDir, "blog");

  // Find all markdown and mdx files
  const allFiles = await readdir(blogDir);
  const files = allFiles.filter(
    (f) => f.endsWith(".md") || f.endsWith(".mdx")
  );

  await mkdir(blogOutputDir, { recursive: true });

  let count = 0;

  for (const file of files) {
    const filePath = join(blogDir, file);
    const content = await readFile(filePath, "utf-8");
    const { frontmatter, body } = parseFrontmatter(content);

    // Skip drafts and future posts in production
    if (frontmatter.draft === true && process.env.PUBLIC_PREVIEW !== "true") {
      continue;
    }

    if (frontmatter.date) {
      const postDate = new Date(frontmatter.date);
      if (postDate > new Date() && process.env.PUBLIC_PREVIEW !== "true") {
        continue;
      }
    }

    // Determine the slug (filename without extension)
    const slug = file.replace(/\.(md|mdx)$/, "");

    // Generate clean markdown for AI
    const markdownContent = generateMarkdownForAI(frontmatter, body, slug);

    // Write the markdown file
    const outputPath = join(blogOutputDir, `${slug}.md`);
    await writeFile(outputPath, markdownContent);
    count++;
  }

  log.info(`Generated ${count} markdown files for blog posts in ${blogOutputDir}`);
}

export function saveMarkdownIntegration() {
  return {
    name: "save-markdown",
    hooks: {
      "astro:server:setup": async function handleServerSetup() {
        // Generate to public directory during dev
        const outputDir = join(process.cwd(), "public");
        await generateBlogMarkdown(outputDir);
      },
      "astro:build:done": async function handleBuildDone({ dir }) {
        // Generate to build output directory
        const outputDir = dir.pathname;
        await generateBlogMarkdown(outputDir);
      },
    },
  };
}
