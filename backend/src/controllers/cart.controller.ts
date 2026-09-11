import type { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { asyncHandler, ApiError, ok } from "../utils/http";

function currentUserId(req: Request) {
  if (!req.user) throw new ApiError("Not authenticated", 401);
  return req.user.sub;
}

function serializeCart(cart: { items: Array<{ product: unknown; color?: string; size?: string; quantity: number }> }) {
  return cart.items.flatMap((item) => {
    const product = item.product as { slug?: string; name?: string; price?: number; brand?: { name?: string } | null } | null;
    if (!product?.slug || product.price === undefined) return [];
    return [{
      slug: product.slug,
      name: product.name ?? product.slug,
      brandName: product.brand?.name ?? "MAISON",
      price: product.price,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
    }];
  });
}

async function loadCart(userId: string) {
  return Cart.findOne({ user: userId }).populate("items.product", "slug name price brand");
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await loadCart(currentUserId(req));
  ok(res, { items: cart ? serializeCart(cart) : [] });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const user = currentUserId(req);
  const { slug, color, size, quantity = 1 } = req.body as { slug?: string; color?: string; size?: string; quantity?: number };
  if (!slug || !Number.isInteger(quantity) || quantity < 1) throw new ApiError("Invalid cart item", 422);

  const product = await Product.findOne({ slug }).select("_id");
  if (!product) throw new ApiError("Product not found", 404);
  const cart = await Cart.findOneAndUpdate({ user }, { $setOnInsert: { user, items: [] } }, { upsert: true, new: true });
  const existing = cart.items.find((item) => item.product.toString() === product._id.toString() && item.color === color && item.size === size);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ product: product._id, color, size, quantity });
  await cart.save();
  const populated = await loadCart(user);
  ok(res, { items: populated ? serializeCart(populated) : [] });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const user = currentUserId(req);
  const { slug } = req.params;
  const { color, size, quantity } = req.body as { color?: string; size?: string; quantity?: number };
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) throw new ApiError("Quantity must be at least 1", 422);
  const product = await Product.findOne({ slug }).select("_id");
  if (!product) throw new ApiError("Product not found", 404);
  const cart = await Cart.findOne({ user });
  const item = cart?.items.find((entry) => entry.product.toString() === product._id.toString() && entry.color === color && entry.size === size);
  if (!item) throw new ApiError("Cart item not found", 404);
  item.quantity = quantity;
  await cart!.save();
  const populated = await loadCart(user);
  ok(res, { items: populated ? serializeCart(populated) : [] });
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const user = currentUserId(req);
  const { slug } = req.params;
  const { color, size } = req.body as { color?: string; size?: string };
  const product = await Product.findOne({ slug }).select("_id");
  if (!product) throw new ApiError("Product not found", 404);
  const cart = await Cart.findOne({ user });
  if (cart) {
    cart.items = cart.items.filter((item) => !(item.product.toString() === product._id.toString() && item.color === color && item.size === size));
    await cart.save();
  }
  const populated = await loadCart(user);
  ok(res, { items: populated ? serializeCart(populated) : [] });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ user: currentUserId(req) });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  ok(res, { items: [] });
});
