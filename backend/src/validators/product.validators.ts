import { z } from "zod";

const sizeSchema = z.object({ size: z.string(), stock: z.number().int().min(0) });

export const createProductSchema = z.object({
  brand: z.string(),
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
});
