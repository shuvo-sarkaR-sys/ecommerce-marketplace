import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number")
    .optional()
    .or(z.literal("")),
});

export const addressSchema = z.object({
  label: z.string().min(1).max(30),
  fullName: z.string().min(2).max(80),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number"),
  addressLine: z.string().min(3).max(200),
  city: z.string().min(2).max(60),
  area: z.string().min(2).max(60),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  isDefault: z.boolean().default(false),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
