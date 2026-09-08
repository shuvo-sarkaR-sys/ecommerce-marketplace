import { Brand } from "../models/Brand";
import { slugify } from "../utils/slugify";
import type { z } from "zod";
import type { onboardBrandSchema } from "../validators/catalog.validators";

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
