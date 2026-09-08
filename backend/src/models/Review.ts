import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  order: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Required so a customer can only review products from an order they completed.
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    images: { type: [String], default: [] },
    verifiedPurchase: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

export const Review: Model<IReview> = models.Review ?? model<IReview>("Review", ReviewSchema);
