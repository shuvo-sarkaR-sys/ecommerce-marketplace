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

function AdminLoginForm() {
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
      if (user.role !== "admin") {
        await apiFetch("/auth/logout", { method: "POST" });
        throw new ApiRequestError("This account does not have admin access", 403);
      }
      router.push(searchParams.get("next") ?? "/admin");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <p className="label-caps">MAISON Control Panel</p>
      <h1 className="mt-2 font-display text-h1">Admin Sign In</h1>
      <p className="mt-2 text-body text-charcoal">Sign in with an administrator account.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Admin Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <Input label="Password" type="password" autoComplete="current-password" {...register("password")} error={errors.password?.message} />
        {formError && <p className="text-caption text-oxblood">{formError}</p>}
        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Signing In…" : "Sign In as Admin"}
        </Button>
      </form>
      <p className="mt-6 text-caption text-charcoal">
        Need the first admin account? <Link href="/admin/register" className="underline">Create one</Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="container-editorial flex justify-center py-20">
      <Suspense fallback={null}><AdminLoginForm /></Suspense>
    </div>
  );
}
