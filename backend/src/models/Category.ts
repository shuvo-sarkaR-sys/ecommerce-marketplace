import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  parent: Types.ObjectId | null;
  image?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    image: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

CategorySchema.index({ parent: 1 });

export const Category: Model<ICategory> =
  models.Category ?? model<ICategory>("Category", CategorySchema);
