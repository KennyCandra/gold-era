"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Circle } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { PASSWORD_RULES, passwordScore, validatePassword } from "@/lib/password";
import type { ApiError } from "@/lib/types";

type FieldErrors = {
  name?: string;
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

/**
 * The meter is the policy, nothing else: one filled segment per satisfied rule.
 * A password only reaches full when every rule the server enforces is met.
 */
function PasswordChecklist({ password }: { password: string }) {
  const score = passwordScore(password);

  return (
    <div className="mt-0.5 flex flex-col gap-1">
      <div className="flex gap-1.5" aria-hidden="true">
        {PASSWORD_RULES.map((rule, index) => (
          <span
            key={rule.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors motion-reduce:transition-none",
              index < score
                ? score <= 1
                  ? "bg-danger"
                  : score < PASSWORD_RULES.length
                    ? "bg-accent"
                    : "bg-success"
                : "bg-border",
            )}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);

          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-1 text-[13px] leading-[18px] transition-colors motion-reduce:transition-none",
                met ? "text-success" : "text-muted",
              )}
            >
              {met ? (
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              )}
              <span>{rule.label}</span>
              <span className="sr-only">{met ? " — met" : " — not met yet"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    else {
      const passwordError = validatePassword(password);
      if (passwordError) errors.password = passwordError;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created — check your email for a code");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const apiErr = err as ApiError;
      setFormError(apiErr.message || "Could not create your account");
      toast.error(apiErr.message || "Could not create your account");
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
        <Logo />
        <h1 className="text-3xl font-semibold leading-9 tracking-[-0.02em]">
          Create your account
        </h1>
        <p className="text-[13px] leading-4.5 text-muted">
          Free while you&apos;re under 5 GB
        </p>
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-lg bg-danger-subtle px-3 py-2.5 text-sm text-danger">
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
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            placeholder="Ahmed Hassan"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <PasswordChecklist password={password} />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>

        <p className="text-center text-[13px] leading-[18px] text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-text hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
