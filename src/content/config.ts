import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    author: z.string().default("Awesome Directories Team"),
    coverImage: z.string().default("/og-image.png"),
    draft: z.boolean().default(false),
    relatedPosts: z.array(z.string()).optional(), // Array of slugs to override auto-related posts
  }),
});

export const collections = {
  blog,
};
