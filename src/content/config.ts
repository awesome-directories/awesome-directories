import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    slug: z.string().optional(),
    tags: z.array(z.string()),
    author: z.string().default("Awesome Directories Team"),
    coverImage: z.string().default("/og-image.png"),
    coverImageAlt: z.string().optional(),
    coverCaption: z.string().optional(),
    draft: z.boolean().default(false),
    relatedPosts: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog,
};
