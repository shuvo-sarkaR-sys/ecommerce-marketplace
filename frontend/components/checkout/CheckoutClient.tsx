"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import { cartSubtotal, useCartStore } from "@/lib/store/cart";
import { formatBDT } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 3000;
const SHIPPING_FEE = 150;

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  addressLine: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "bkash", "nagad", "card"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutClient({ userName }: { userName: string }) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const [mounted, setMounted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: userName,
      phone: "",
      addressLine: "",
      city: "Dhaka",
      area: "Dhanmondi",
      postalCode: "",
      paymentMethod: "cod",
    },
  });

  async function onSubmit(values: CheckoutFormValues) {
    setFormError(null);

    try {
      await apiFetch("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            slug: item.slug,
            name: item.name,
            brandName: item.brandName,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          })),
          shippingAddress: {
            fullName: values.fullName,
            phone: values.phone,
            addressLine: values.addressLine,
            city: values.city,
            area: values.area,
            postalCode: values.postalCode || undefined,
          },
          paymentMethod: values.paymentMethod,
        }),
      });

      clearCart();
      router.push("/account");
      router.refresh();
    } catch (error) {
      setFormError(error instanceof ApiRequestError ? error.message : "Something went wrong");
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-editorial flex flex-col items-center py-24 text-center">
        <p className="label-caps mb-4">Checkout</p>
        <h1 className="font-display text-h1">Your Bag is Empty</h1>
        <p className="mt-3 max-w-md text-body text-charcoal">
          Add a few pieces to continue to checkout.
        </p>
        <LinkButton href="/cart" variant="secondary" size="lg" className="mt-8">
          Back to Bag
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="container-editorial py-12">
      <p className="label-caps mb-4">Checkout</p>
      <h1 className="font-display text-h1">Complete Your Order</h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-h3">Shipping details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="Full name" {...register("fullName")} error={errors.fullName?.message} />
              <Input label="Phone" type="tel" {...register("phone")} error={errors.phone?.message} />
            </div>
            <Input label="Address" {...register("addressLine")} error={errors.addressLine?.message} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input label="City" {...register("city")} error={errors.city?.message} />
              <Input label="Area" {...register("area")} error={errors.area?.message} />
              <Input label="Postal code" {...register("postalCode")} error={errors.postalCode?.message} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-h3">Payment</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { value: "cod", label: "Cash on delivery" },
                { value: "bkash", label: "bKash" },
                { value: "nagad", label: "Nagad" },
                { value: "card", label: "Card" },
              ].map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-3 border border-sand p-4 text-body">
                  <input type="radio" value={option.value} {...register("paymentMethod")} className="h-4 w-4 accent-ink" />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="text-caption text-oxblood">{errors.paymentMethod.message}</p>
            )}
          </div>

          {formError && <p className="text-caption text-oxblood">{formError}</p>}

          <div className="flex items-center justify-between gap-4 pt-4">
            <LinkButton href="/cart" variant="secondary" size="lg">
              Back to bag
            </LinkButton>
            <Button type="submit" className="text-white" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Placing order…" : "Place order"}
            </Button>
          </div>
        </form>

        <aside className="h-fit border border-sand p-6">
          <h2 className="mb-5 text-h3">Order summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.slug}-${item.color ?? ""}-${item.size ?? ""}`} className="flex items-center gap-3 border-b border-sand pb-3 last:border-b-0 last:pb-0">
                <div className="flex h-16 w-16 items-center justify-center bg-sand text-caption text-charcoal">
                  {item.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium">{item.name}</p>
                  <p className="text-caption text-charcoal">
                    {item.quantity} × {formatBDT(item.price)}
                    {item.color || item.size ? ` • ${[item.color, item.size].filter(Boolean).join(" / ")}` : ""}
                  </p>
                </div>
                <span className="text-body font-medium">{formatBDT(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-body text-charcoal">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "Free" : formatBDT(shippingFee)}</span>
            </div>
            <div className="hairline mt-3 flex justify-between pt-3 text-h4 font-medium text-ink">
              <span>Total</span>
              <span>{formatBDT(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
