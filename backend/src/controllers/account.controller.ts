import type { Request, Response } from "express";
import { Types } from "mongoose";
import { asyncHandler, ApiError, ok } from "../utils/http";
import { User } from "../models/User";
import { Wishlist } from "../models/Wishlist";
import { Product } from "../models/Product";
import { updateProfileSchema, addressSchema } from "../validators/account.validators";

function userId(req: Request) {
  if (!req.user) throw new ApiError("Not authenticated", 401);
  return req.user.sub;
}

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = updateProfileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(userId(req), input, { new: true, runValidators: true });
  if (!user) throw new ApiError("User not found", 404);
  ok(res, { user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
});

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(userId(req)).select("addresses").lean();
  if (!user) throw new ApiError("User not found", 404);
  ok(res, { addresses: user.addresses ?? [] });
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const input = addressSchema.parse(req.body);
  const user = await User.findById(userId(req));
  if (!user) throw new ApiError("User not found", 404);
  if (input.isDefault) user.addresses.forEach((address) => { address.isDefault = false; });
  if (!user.addresses.length) input.isDefault = true;
  user.addresses.push(input);
  await user.save();
  ok(res, { addresses: user.addresses }, 201);
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const addressId = String(req.params.addressId);
  if (!Types.ObjectId.isValid(addressId)) throw new ApiError("Invalid address", 400);
  const user = await User.findById(userId(req));
  if (!user) throw new ApiError("User not found", 404);
  const originalLength = user.addresses.length;
  user.addresses = user.addresses.filter((address) => (address as typeof address & { _id: Types.ObjectId })._id.toString() !== addressId);
  if (user.addresses.length === originalLength) throw new ApiError("Address not found", 404);
  if (!user.addresses.some((address) => address.isDefault) && user.addresses[0]) user.addresses[0].isDefault = true;
  await user.save();
  ok(res, { addresses: user.addresses });
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await Wishlist.findOne({ user: userId(req) }).populate("items.product", "name slug price images").lean();
  ok(res, { wishlist: wishlist?.items ?? [] });
});

export const addWishlistItem = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug }).select("_id price").lean();
  if (!product) throw new ApiError("Product not found", 404);
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId(req) },
    { $setOnInsert: { user: userId(req) }, $addToSet: { items: { product: product._id, priceWhenAdded: product.price } } },
    { upsert: true, new: true },
  );
  ok(res, { wishlist: wishlist.items });
});

export const removeWishlistItem = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug }).select("_id").lean();
  if (!product) throw new ApiError("Product not found", 404);
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId(req) },
    { $pull: { items: { product: product._id } } },
    { new: true },
  );
  ok(res, { wishlist: wishlist?.items ?? [] });
});