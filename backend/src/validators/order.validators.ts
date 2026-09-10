import { z } from "zod";

export const checkoutItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  brandName: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(1),
  color: z.string().optional(),
  size: z.string().optional(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  addressLine: z.string().min(5),
  city: z.string().min(2),
  area: z.string().min(2),
  postalCode: z.string().optional(),
});

export const checkoutOrderSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["cod", "bkash", "nagad", "card"]),
});
