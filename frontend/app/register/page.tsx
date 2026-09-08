"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, type RegisterFormValues } from "@/lib/validators/auth";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(values) });
      router.push("/");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="container-editorial flex justify-center py-20">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-h1">Create Account</h1>
        <p className="mt-2 text-body text-charcoal">Join MAISON to start shopping.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
          <Input label="Full Name" autoComplete="name" {...register("name")} error={errors.name?.message} />
          <Input label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
          />

          {formError && <p className="text-caption text-oxblood">{formError}</p>}

          <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Creating Account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-caption text-charcoal">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
