import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface IWishlistItem {
  product: Types.ObjectId;
  notifyOnPriceDrop: boolean;
  notifyOnRestock: boolean;
  priceWhenAdded: number;
  addedAt: Date;
}

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: IWishlistItem[];
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    notifyOnPriceDrop: { type: Boolean, default: false },
    notifyOnRestock: { type: Boolean, default: false },
    priceWhenAdded: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const WishlistSchema = new Schema<IWishlist>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: { type: [WishlistItemSchema], default: [] },
});

export const Wishlist: Model<IWishlist> =
  models.Wishlist ?? model<IWishlist>("Wishlist", WishlistSchema);
