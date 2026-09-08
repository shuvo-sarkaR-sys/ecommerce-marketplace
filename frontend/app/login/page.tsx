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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(values) });
      router.push(searchParams.get("next") ?? "/");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-h1">Sign In</h1>
      <p className="mt-2 text-body text-charcoal">Welcome back to MAISON.</p>

      <a
        href={`/api/auth/google?next=${encodeURIComponent(searchParams.get("next") ?? "/")}`}
        className="mt-8 flex h-14 items-center justify-center border border-ink text-body font-medium transition-colors hover:bg-sand/60"
      >
        <span className="mr-3 text-lg font-semibold">G</span>
        Continue with Google
      </a>

      <div className="my-6 flex items-center gap-3 text-caption text-stone">
        <span className="h-px flex-1 bg-sand" />
        <span>or</span>
        <span className="h-px flex-1 bg-sand" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />

        {formError && <p className="text-caption text-oxblood">{formError}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Signing In…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-caption text-charcoal">
        New to MAISON?{" "}
        <Link href="/register" className="underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container-editorial flex justify-center py-20">
      {/* useSearchParams() (for ?next=) opts this subtree out of static
          rendering -- Suspense keeps that from bailing out the whole page. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
