"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/types";

const CODE_LENGTH = 6;
const EXPIRY_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendCode } = useAuth();

  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: CODE_LENGTH }, () => "")
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(EXPIRY_SECONDS);
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => digits.join(""), [digits]);
  const isComplete = code.length === CODE_LENGTH;
  const isExpired = expiresIn <= 0;

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (expiresIn <= 0) return;
    const id = window.setInterval(() => {
      setExpiresIn((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresIn]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const focusInput = useCallback((index: number) => {
    const clamped = Math.min(Math.max(index, 0), CODE_LENGTH - 1);
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  }, []);

  const setDigitAt = useCallback((index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setError(null);
    setDigitAt(index, digit);
    if (digit) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        setDigitAt(index, "");
        return;
      }
      setDigitAt(index - 1 >= 0 ? index - 1 : 0, "");
      focusInput(index - 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    setError(null);
    const chars = pasted.slice(0, CODE_LENGTH).split("");
    setDigits(
      Array.from({ length: CODE_LENGTH }, (_, index) => chars[index] ?? "")
    );
    focusInput(chars.length >= CODE_LENGTH ? CODE_LENGTH - 1 : chars.length);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isComplete || submitting) return;

    if (isExpired) {
      setError("This code has expired. Request a new one.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      toast.success("Email verified");
      router.replace("/dashboard");
    } catch (err) {
      const message =
        (err as ApiError)?.message ?? "Verification failed. Try again.";
      setError(message);
      setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
      focusInput(0);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await resendCode(email);
      toast.success("A new code is on its way");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setExpiresIn(EXPIRY_SECONDS);
      setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
      focusInput(0);
    } catch (err) {
      const message =
        (err as ApiError)?.message ?? "Could not resend the code.";
      setError(message);
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-8"
      noValidate
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold text-text">Check your email</h1>
        <p className="text-sm text-muted">
          {email ? (
            <>
              We sent a 6-digit code to{" "}
              <span className="font-medium text-text">{email}</span>
            </>
          ) : (
            "Enter the 6-digit code we sent to your email."
          )}
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={(e) => e.currentTarget.select()}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
            className={cn(
              "h-14 w-12 rounded-lg border bg-surface text-center font-mono text-xl text-text",
              "transition-colors focus-visible:outline focus-visible:outline-2",
              "focus-visible:outline-accent-border focus-visible:outline-offset-2",
              error ? "border-danger" : "border-border"
            )}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted tabular">
        {isExpired ? (
          <span className="text-danger">Code expired</span>
        ) : (
          <>Code expires in {formatCountdown(expiresIn)}</>
        )}
      </p>

      <Button type="submit" loading={submitting} disabled={!isComplete} className="w-full">
        Verify
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={handleResend}
        loading={resending}
        disabled={cooldown > 0}
        className="w-full"
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
      </Button>
    </form>
  );
}

export default function VerifyEmailPage() {
  // useSearchParams requires a Suspense boundary or the production build fails.
  return (
    <Suspense
      fallback={
        <div
          className="h-96 rounded-xl border border-border bg-surface"
          aria-hidden="true"
        />
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
