"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const adminRegisterFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  setupKey: z.string().min(1, "Admin setup key is required"),
});
type AdminRegisterFormValues = z.infer<typeof adminRegisterFormSchema>;

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<AdminRegisterFormValues>({ resolver: zodResolver(adminRegisterFormSchema) });

  async function onSubmit(values: AdminRegisterFormValues) {
    setFormError(null);
    try {
      await apiFetch("/auth/admin/register", { method: "POST", body: JSON.stringify(values) });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="container-editorial flex justify-center py-20">
      <div className="w-full max-w-sm">
        <p className="label-caps">MAISON Control Panel</p>
        <h1 className="mt-2 font-display text-h1">Create Admin Account</h1>
        <p className="mt-2 text-body text-charcoal">This setup requires the private admin key configured on the server.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
          <Input label="Full Name" autoComplete="name" {...register("name")} error={errors.name?.message} />
          <Input label="Admin Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" autoComplete="new-password" {...register("password")} error={errors.password?.message} />
          <Input label="Admin Setup Key" type="password" autoComplete="off" {...register("setupKey")} error={errors.setupKey?.message} />
          {formError && <p className="text-caption text-oxblood">{formError}</p>}
          <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 text-white">
            {isSubmitting ? "Creating Account…" : "Create Admin Account"}
          </Button>
        </form>
        <p className="mt-6 text-caption text-charcoal">
          Already have admin access? <Link href="/admin/login" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
