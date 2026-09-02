"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@/lib/types";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email");
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const message = await forgotPassword(email);
      toast.success(message || "If that email is registered, a code is on its way");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const apiErr = err as ApiError;
      setFormError(apiErr.message || "Could not send the code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFormKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-8">
      <div className="flex flex-col gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle">
          <KeyRound className="h-5 w-5 text-accent-text" strokeWidth={1.8} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-semibold leading-9 tracking-[-0.02em]">
          Forgot password
        </h1>
        <p className="text-[13px] leading-4.5 text-muted">
          Enter your email and we&apos;ll send you a 6-digit reset code.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-danger-subtle px-3 py-2.5 text-sm text-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          {formError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleFormKeyDown}
        className="flex flex-col gap-5"
        noValidate
      >
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
            error={emailError}
          />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Send reset code
        </Button>

        <p className="text-center text-[13px] leading-4.5 text-muted">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-accent-text hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
