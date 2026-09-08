import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(60),
  parent: z.string().nullable().optional(),
  image: z.string().url().optional(),
});

export const onboardBrandSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().min(20, "Tell customers a bit more about the brand"),
  category: z.string().default("Fashion"),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  socialLinks: z
    .array(z.object({ platform: z.string(), url: z.string().url() }))
    .optional()
    .default([]),
});

  export const updateBrandSchema = onboardBrandSchema.partial();
