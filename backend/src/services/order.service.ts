import { Order, type PaymentMethod } from "../models/Order";
import { Product } from "../models/Product";
import { ApiError } from "../utils/http";

export const FREE_SHIPPING_THRESHOLD = 3000;
export const SHIPPING_FEE = 150;

export interface CartCheckoutItem {
  slug: string;
  name: string;
  brandName: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface ProductCheckoutMetadata {
  _id: string;
  slug: string;
  name?: string;
  seller?: string;
  brand?: { _id?: string; commissionRate?: number } | string;
  price: number;
  images?: string[];
  colors?: string[];
  sizes?: { size: string; stock: number }[];
  commissionRate?: number;
}

export function buildCheckoutPayload(
  items: CartCheckoutItem[],
  productsBySlug: Record<string, ProductCheckoutMetadata>,
) {
  if (!items.length) {
    throw new ApiError("Your cart is empty", 400);
  }

  let subtotal = 0;
  const normalizedItems = items.map((item) => {
    const product = productsBySlug[item.slug];
    if (!product) {
      throw new ApiError(`Product "${item.slug}" is no longer available`, 404);
    }

    const price = Number(product.price ?? item.price ?? 0);
    const quantity = Number(item.quantity ?? 0);

    if (!Number.isFinite(price) || price <= 0) {
      throw new ApiError(`Invalid price for ${item.name}`, 400);
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new ApiError(`Invalid quantity for ${item.name}`, 400);
    }

    const availableStock = item.size
      ? product.sizes?.find((entry) => entry.size === item.size)?.stock ?? 0
      : product.sizes?.reduce((sum, entry) => sum + (entry.stock ?? 0), 0) ?? 0;

    if (availableStock < quantity) {
      throw new ApiError(`Only ${availableStock} item(s) remain for ${item.name}`, 400);
    }

    const commissionRate = product.commissionRate ?? 15;
    const commissionAmount = Math.round((price * commissionRate) / 100);
    const sellerPayout = price - commissionAmount;

    subtotal += price * quantity;

    return {
      product: product._id,
      seller: product.seller ?? "",
      name: item.name,
      image: product.images?.[0] ?? "",
      color: item.color,
      size: item.size,
      quantity,
      price,
      commissionRate,
      commissionAmount,
      sellerPayout,
    };
  });

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  return {
    subtotal,
    shippingFee,
    discount,
    total,
    items: normalizedItems,
  };
}

export interface CheckoutInput {
  items: CartCheckoutItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    area: string;
    postalCode?: string;
  };
  paymentMethod: PaymentMethod;
}

export async function createCheckoutOrder(userId: string, input: CheckoutInput) {
  if (!input.items.length) {
    throw new ApiError("Your cart is empty", 400);
  }

  const slugs = [...new Set(input.items.map((item) => item.slug))];
  const products = await Product.find({ slug: { $in: slugs } }).populate("brand", "commissionRate").lean();

  const productsBySlug = Object.fromEntries(
    products.map((product) => {
      const brand =
        typeof product.brand === "object" && product.brand !== null && "commissionRate" in product.brand
          ? (product.brand as unknown as { commissionRate?: number })
          : undefined;

      return [
        product.slug,
        {
          _id: String(product._id),
          slug: product.slug,
          name: product.name,
          seller: String(product.seller),
          brand: brand ?? { commissionRate: 15 },
          price: Number(product.price),
          images: product.images ?? [],
          colors: product.colors ?? [],
          sizes: product.sizes ?? [],
          commissionRate: Number(brand?.commissionRate ?? 15),
        },
      ];
    }),
  ) as Record<string, ProductCheckoutMetadata>;

  const checkout = buildCheckoutPayload(input.items, productsBySlug);

  const order = await Order.create({
    user: userId,
    items: checkout.items,
    subtotal: checkout.subtotal,
    shippingFee: checkout.shippingFee,
    discount: checkout.discount,
    total: checkout.total,
    shippingAddress: input.shippingAddress,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pending",
  });

  for (const item of input.items) {
    const product = productsBySlug[item.slug];
    if (!product || !item.size) continue;

    await Product.updateOne(
      { _id: product._id, "sizes.size": item.size },
      { $inc: { "sizes.$.stock": -item.quantity } },
    );
  }

  return order;
}

export async function getOrdersByUser(userId: string) {
  return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
}
