import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export type UserRole = "customer" | "seller" | "admin";

export interface IAddress {
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  area: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  refreshTokenVersion: number;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    postalCode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["customer", "seller", "admin"], default: "customer" },
    emailVerified: { type: Boolean, default: false },
    refreshTokenVersion: { type: Number, default: 0 },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1 });

export const User: Model<IUser> = models.User ?? model<IUser>("User", UserSchema);
