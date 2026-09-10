import { z } from "zod";

const sizeSchema = z.object({ size: z.string(), stock: z.number().int().min(0) });

export const createProductSchema = z.object({
  brand: z.string().optional(),
  customBrandName: z.string().min(2).max(80).optional(),
  customBrandImage: z.string().url().optional(),
  category: z.string(),
  name: z.string().min(2).max(120),
  description: z.string().min(20),
  sku: z.string().min(3),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1, "Add at least one product image"),
  colors: z.array(z.string()).default([]),
  sizes: z.array(sizeSchema).default([]),
  material: z.string().optional(),
  tags: z.array(z.string()).default([]),
}).superRefine((value, context) => {
  if (!value.brand && !value.customBrandName) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["brand"], message: "Select a brand or enter a custom brand name" });
  }
  if (value.customBrandName && !value.customBrandImage) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["customBrandImage"], message: "Add an image for the custom brand" });
  }
});
