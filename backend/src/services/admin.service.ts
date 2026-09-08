import { User } from "../models/User";
import { Brand, type BrandStatus } from "../models/Brand";
import { Product, type ProductStatus } from "../models/Product";
import { Order, type OrderStatus } from "../models/Order";
import { Category } from "../models/Category";
import { Review } from "../models/Review";
import { ApiError } from "../utils/http";

const brandStatuses: BrandStatus[] = ["pending", "approved", "rejected", "suspended"];
const productStatuses: ProductStatus[] = ["draft", "pending", "approved", "rejected"];
const orderStatuses: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

function assertStatus<T extends string>(value: unknown, allowed: T[], label: string): asserts value is T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ApiError(`Invalid ${label} status`, 400);
  }
}

export async function getOverview() {
  const [customers, sellers, brands, products, orders, revenue, pendingBrands, pendingProducts, recentOrders] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "seller" }),
    Brand.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Brand.find({ status: "pending" }).populate("owner", "name email").sort({ createdAt: -1 }).limit(10).lean(),
    Product.find({ status: "pending" }).populate("brand", "name").sort({ createdAt: -1 }).limit(10).lean(),
    Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    stats: { customers, sellers, brands, products, orders, revenue: revenue[0]?.total ?? 0 },
    pendingBrands,
    pendingProducts,
    recentOrders,
  };
}

export async function updateBrandStatus(id: string, status: unknown) {
  assertStatus(status, brandStatuses, "brand");
  const brand = await Brand.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!brand) throw new ApiError("Brand not found", 404);
  return brand;
}

export async function updateProductStatus(id: string, status: unknown) {
  assertStatus(status, productStatuses, "product");
  const product = await Product.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!product) throw new ApiError("Product not found", 404);
  return product;
}

export async function updateProduct(id: string, input: Record<string, unknown>) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError("Product not found", 404);

  if (input.name !== undefined) {
    if (typeof input.name !== "string" || input.name.trim().length < 2 || input.name.length > 120) {
      throw new ApiError("Product name must be between 2 and 120 characters", 400);
    }
    product.name = input.name.trim();
  }
  if (input.description !== undefined) {
    if (typeof input.description !== "string" || input.description.trim().length < 20) {
      throw new ApiError("Product description must be at least 20 characters", 400);
    }
    product.description = input.description.trim();
  }
  if (input.price !== undefined) {
    if (typeof input.price !== "number" || !Number.isFinite(input.price) || input.price <= 0) {
      throw new ApiError("Product price must be greater than zero", 400);
    }
    product.price = input.price;
  }
  if (input.compareAtPrice !== undefined) {
    if (input.compareAtPrice !== null && (typeof input.compareAtPrice !== "number" || input.compareAtPrice <= 0)) {
      throw new ApiError("Compare-at price must be greater than zero or empty", 400);
    }
    product.compareAtPrice = input.compareAtPrice as number | null;
  }

  await product.save();
  return product.toObject();
}

export async function updateOrderStatus(id: string, status: unknown) {
  assertStatus(status, orderStatuses, "order");
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!order) throw new ApiError("Order not found", 404);
  return order;
}

export async function listResource(resource: string) {
  switch (resource) {
    case "orders":
      return { resource, rows: await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(100).lean() };
    case "products":
      return { resource, rows: await Product.find().populate("brand", "name").populate("category", "name").sort({ createdAt: -1 }).limit(100).lean() };
    case "sellers":
      return { resource, rows: await User.find({ role: "seller" }).select("name email emailVerified createdAt").sort({ createdAt: -1 }).lean() };
    case "customers":
      return { resource, rows: await User.find({ role: "customer" }).select("name email emailVerified createdAt").sort({ createdAt: -1 }).limit(100).lean() };
    case "categories":
      return { resource, rows: await Category.find().sort({ order: 1, name: 1 }).lean() };
    case "brands":
      return { resource, rows: await Brand.find().populate("owner", "name email").sort({ createdAt: -1 }).limit(100).lean() };
    case "reviews":
      return { resource, rows: await Review.find().populate("product", "name").populate("user", "name email").sort({ createdAt: -1 }).limit(100).lean() };
    case "payments":
      return { resource, rows: await Order.find().select("user total paymentMethod paymentStatus status createdAt").populate("user", "name email").sort({ createdAt: -1 }).limit(100).lean() };
    case "returns":
      return { resource, rows: await Order.find({ status: "returned" }).populate("user", "name email").sort({ updatedAt: -1 }).limit(100).lean() };
    case "coupons":
      return { resource, rows: [], note: "Coupons are not enabled yet because no coupon collection exists." };
    case "reports": {
      const overview = await getOverview();
      return { resource, rows: Object.entries(overview.stats).map(([name, value]) => ({ _id: name, name, value })) };
    }
    case "settings":
      return {
        resource,
        rows: [
          { _id: "environment", name: "Environment", value: process.env.NODE_ENV ?? "development" },
          { _id: "frontend", name: "Frontend URL", value: process.env.FRONTEND_URL ?? "http://localhost:3000" },
          { _id: "currency", name: "Currency", value: "BDT" },
          { _id: "auth", name: "Authentication", value: "Password + Google OAuth" },
        ],
      };
    default:
      throw new ApiError("Unknown admin resource", 404);
  }
}