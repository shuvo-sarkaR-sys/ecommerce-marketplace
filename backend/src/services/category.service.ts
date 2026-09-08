import { Category } from "../models/Category";
import { slugify } from "../utils/slugify";
import type { z } from "zod";
import type { createCategorySchema } from "../validators/catalog.validators";

export async function listCategories() {
  return Category.find().sort({ order: 1, name: 1 }).lean();
}

export async function createCategory(input: z.infer<typeof createCategorySchema>) {
  return Category.create({
    name: input.name,
    slug: slugify(input.name),
    parent: input.parent ?? null,
    image: input.image,
  });
}
