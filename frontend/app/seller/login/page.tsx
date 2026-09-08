"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormValues } from "@/lib/validators/auth";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function SellerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      const { user } = await apiFetch<{ user: { role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      if (user.role !== "seller" && user.role !== "admin") {
        await apiFetch("/auth/logout", { method: "POST" });
        throw new ApiRequestError("This account does not have seller access", 403);
      }
      const next = searchParams.get("next");
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/seller");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Something went wrong");
    }
  }

  return <div className="w-full max-w-sm">
    <p className="label-caps">MAISON for Business</p>
    <h1 className="mt-2 font-display text-h1">Seller Sign In</h1>
    <p className="mt-2 text-body text-charcoal">Manage your products, orders, and brand from one place.</p>
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
      <Input label="Business Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
      <Input label="Password" type="password" autoComplete="current-password" {...register("password")} error={errors.password?.message} />
      {formError && <p className="text-caption text-oxblood">{formError}</p>}
      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">{isSubmitting ? "Signing In…" : "Sign In to Seller Hub"}</Button>
    </form>
    <p className="mt-6 text-caption text-charcoal">Need a seller account? <Link href="/register" className="underline">Create an account</Link></p>
  </div>;
}

export default function SellerLoginPage() {
  return <div className="container-editorial flex justify-center py-20"><Suspense fallback={null}><SellerLoginForm /></Suspense></div>;
}