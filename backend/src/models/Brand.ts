import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export type BrandStatus = "pending" | "approved" | "rejected" | "suspended";

export interface IBrand extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  category: string;
  socialLinks: { platform: string; url: string }[];
  status: BrandStatus;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    logo: String,
    coverImage: String,
    category: { type: String, default: "Fashion" },
    socialLinks: [
      {
        platform: { type: String },
        url: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    // Configurable per-brand commission; falls back to the platform default in Order calculations.
    commissionRate: { type: Number, default: 15 },
  },
  { timestamps: true },
);

BrandSchema.index({ status: 1 });

export const Brand: Model<IBrand> = models.Brand ?? model<IBrand>("Brand", BrandSchema);
