import { Brand } from "../models/Brand";
import { slugify } from "../utils/slugify";
import type { z } from "zod";
import type { onboardBrandSchema, updateBrandSchema } from "../validators/catalog.validators";

export async function listBrands(includeAll: boolean) {
  const filter = includeAll ? {} : { status: "approved" };
  return Brand.find(filter).sort({ createdAt: -1 }).lean();
}

/** Seller onboarding: creates a brand in "pending" status awaiting admin approval. */
export async function onboardBrand(ownerId: string, input: z.infer<typeof onboardBrandSchema>) {
  return Brand.create({
    owner: ownerId,
    name: input.name,
    slug: slugify(input.name),
    description: input.description,
    category: input.category,
    logo: input.logo,
    coverImage: input.coverImage,
    socialLinks: input.socialLinks,
    status: "pending",
  });
}

export async function updateBrand(id: string, input: z.infer<typeof updateBrandSchema>) {
  const brand = await Brand.findById(id);
  if (!brand) throw new Error("Brand not found");

  if (input.name !== undefined) {
    brand.name = input.name;
    brand.slug = slugify(input.name);
  }
  if (input.description !== undefined) brand.description = input.description;
  if (input.category !== undefined) brand.category = input.category;
  if (input.logo !== undefined) brand.logo = input.logo ?? undefined;
  if (input.coverImage !== undefined) brand.coverImage = input.coverImage ?? undefined;
  if (input.socialLinks !== undefined) brand.socialLinks = input.socialLinks;

  await brand.save();
  return brand.toObject();
}
