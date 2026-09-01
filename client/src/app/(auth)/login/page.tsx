"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@/lib/types";

type FieldErrors = {
  email?: string;
  password?: string;
};

function Logo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 20 20"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6.5 10 3l7 3.5L10 10 3 6.5Z" />
      <path d="M3 10.5 10 14l7-3.5" />
      <path d="M3 14 10 17.5 17 14" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err) {
      const apiErr = err as ApiError;
      setFormError(apiErr.message || "Invalid email or password");
      toast.error(apiErr.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-8">
      <div className="flex flex-col gap-2">
        <Logo />
        <h1 className="text-3xl font-semibold leading-9 tracking-[-0.02em]">
          Welcome back
        </h1>
        <p className="text-[13px] leading-[18px] text-muted">
          Sign in to manage your files
        </p>
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-lg bg-danger-subtle px-3 py-2.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="ahmed@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <div className="flex justify-end">
            <Button variant="ghost" type="button" className="h-auto px-0 text-[13px] font-normal text-accent-text hover:bg-transparent hover:underline">
              Forgot password?
            </Button>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>

        <p className="text-center text-[13px] leading-[18px] text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent-text hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
