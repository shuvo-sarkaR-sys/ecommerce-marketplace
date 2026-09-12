import type { FilterQuery } from "mongoose";
import { Product, type IProduct } from "../models/Product";
import { Category } from "../models/Category";
import { Brand } from "../models/Brand";
import { slugify } from "../utils/slugify";
import { ApiError } from "../utils/http";
import type { z } from "zod";
import type { createProductSchema } from "../validators/product.validators";

const SORTS = {
  featured: { badges: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  popular: { totalSold: -1 },
  rating: { ratingAverage: -1 },
} as const;

export interface ProductListQuery {
  page?: string;
  limit?: string;
  sort?: string;
  category?: string;
  tag?: string;
  badge?: string;
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  q?: string;
}

export async function listProducts(params: ProductListQuery) {
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.min(48, Math.max(1, Number(params.limit ?? 12)));
  const sortKey = (params.sort ?? "featured") as keyof typeof SORTS;
  const sort = SORTS[sortKey] ?? SORTS.featured;

  const filter: FilterQuery<IProduct> = { status: "approved" };

  if (params.category) {
    const category = await Category.findOne({ slug: params.category }).lean();
    if (!category) return { products: [], total: 0, page, pages: 0 };
    filter.category = category._id;
  }

  if (params.brand) {
    const brand = await Brand.findOne({ slug: params.brand }).lean();
    if (!brand) return { products: [], total: 0, page, pages: 0 };
    filter.brand = brand._id;
  }

  if (params.color) filter.colors = params.color;
  if (params.tag) filter.tags = params.tag;
  if (params.badge) filter.badges = params.badge;
  if (params.size) filter.sizes = { $elemMatch: { size: params.size, stock: { $gt: 0 } } };

  if (params.minPrice || params.maxPrice) {
    filter.price = {
      ...(params.minPrice ? { $gte: Number(params.minPrice) } : {}),
      ...(params.maxPrice ? { $lte: Number(params.maxPrice) } : {}),
    };
  }

  if (params.minRating) filter.ratingAverage = { $gte: Number(params.minRating) };
  if (params.q) filter.$text = { $search: params.q };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .sort(sort as Record<string, 1 | -1>)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, total, page, pages: Math.ceil(total / limit) };
}

export async function getProductBySlug(slug: string) {
  const product = await Product.findOneAndUpdate(
    { slug, status: "approved" },
    { $inc: { viewCount: 1 } },
    { new: true },
  )
    .populate("brand", "name slug logo")
    .populate("category", "name slug")
    .lean();

  if (!product) throw new ApiError("Product not found", 404);
  return product;
}

/** Sellers create products directly under a brand they own; goes live only after admin approval. */
export async function createProduct(
  sellerId: string,
  role: string,
  input: z.infer<typeof createProductSchema>,
) {
  let brand = input.brand ? await Brand.findById(input.brand) : null;
  if (!brand && input.customBrandName && role === "admin") {
    brand = await Brand.create({
      owner: sellerId,
      name: input.customBrandName,
      slug: `${slugify(input.customBrandName)}-${Math.random().toString(36).slice(2, 7)}`,
      description: `The ${input.customBrandName} brand.`,
      logo: input.customBrandImage,
      category: "Fashion",
      status: "approved",
    });
  }
  if (!brand) throw new ApiError("Brand not found", 404);
  if (brand.owner.toString() !== sellerId && role !== "admin") {
    throw new ApiError("You can only add products to your own brand", 403);
  }

  return Product.create({
    seller: sellerId,
    brand: brand._id,
    category: input.category,
    name: input.name,
    slug: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 7)}`,
    description: input.description,
    sku: input.sku,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    images: input.images,
    colors: input.colors,
    sizes: input.sizes,
    material: input.material,
    tags: input.tags,
    status: "pending",
  });
}
