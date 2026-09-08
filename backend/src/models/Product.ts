import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export type ProductStatus = "draft" | "pending" | "approved" | "rejected";
export type ProductBadge = "new" | "bestseller" | "limited" | "sale";

export interface ISizeStock {
  size: string;
  stock: number;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  seller: Types.ObjectId;
  brand: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  colors: string[];
  sizes: ISizeStock[];
  material?: string;
  tags: string[];
  badges: ProductBadge[];
  status: ProductStatus;
  ratingAverage: number;
  ratingCount: number;
  totalSold: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SizeStockSchema = new Schema<ISizeStock>(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProduct>(
  {
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null },
    images: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [SizeStockSchema], default: [] },
    material: String,
    tags: { type: [String], default: [], index: true },
    badges: {
      type: [String],
      enum: ["new", "bestseller", "limited", "sale"],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "pending",
    },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Supports storefront browsing: filter by category/brand/status, sort by recency or popularity.
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ brand: 1, status: 1 });
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ status: 1, totalSold: -1 });
ProductSchema.index({ name: "text", description: "text", tags: "text" });

export const Product: Model<IProduct> =
  models.Product ?? model<IProduct>("Product", ProductSchema);
