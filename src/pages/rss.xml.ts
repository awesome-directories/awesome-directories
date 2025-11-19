import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPublishedPosts } from "@/utils/blog";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  const siteUrl = context.site?.toString() || "https://awesome-directories.com";

  return rss({
    title: "Awesome Directories Blog",
    description:
      "Insights, guides, and tips for indie hackers, bootstrappers, and solopreneurs launching their SaaS products.",
    site: siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.slug}`,
      pubDate: post.data.date,
      author: post.data.author,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
    stylesheet: "/rss-styles.xsl",
  });
}
