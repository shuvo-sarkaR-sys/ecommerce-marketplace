import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  color?: string;
  size?: string;
  quantity: number;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: ICartItem[];
  savedForLater: ICartItem[];
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    color: String,
    size: String,
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false },
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
    savedForLater: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Cart: Model<ICart> = models.Cart ?? model<ICart>("Cart", CartSchema);
