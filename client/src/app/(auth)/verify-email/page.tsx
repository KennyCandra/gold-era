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
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { AlertCircle, MailOpen } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/types";

const CODE_LENGTH = 6;
const EXPIRY_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const SUCCESS_REDIRECT_MS = 1100;

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function MailBadge() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
      {!reduceMotion && (
        <motion.span
          initial={{ scale: 1, opacity: 0.45 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.25 }}
          className="absolute inset-0 rounded-full bg-accent-subtle"
          aria-hidden="true"
        />
      )}
      <motion.div
        initial={reduceMotion ? false : { scale: 0.6, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle"
      >
        <MailOpen className="h-5 w-5 text-accent-text" strokeWidth={1.8} aria-hidden="true" />
      </motion.div>
    </div>
  );
}

function SuccessCheck() {
  const reduceMotion = useReducedMotion();
  const draw = reduceMotion
    ? { initial: { pathLength: 1 }, animate: { pathLength: 1 } }
    : { initial: { pathLength: 0 }, animate: { pathLength: 1 } };

  return (
    <motion.div
      initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className="flex flex-col items-center gap-4 py-6"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            stroke="var(--success)"
            strokeWidth="1.6"
            {...draw}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
          <motion.path
            d="M7.5 12.2 L10.6 15.3 L16.5 9.2"
            stroke="var(--success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...draw}
            transition={{ duration: 0.35, ease: "easeOut", delay: reduceMotion ? 0 : 0.35 }}
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-semibold text-text">Email verified</span>
        <span className="text-sm text-muted">Taking you to your dashboard…</span>
      </div>
    </motion.div>
  );
}

function ResendRing({ cooldown }: { cooldown: number }) {
  const r = 6;
  const circumference = 2 * Math.PI * r;
  const fraction = cooldown / RESEND_COOLDOWN_SECONDS;

  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 -rotate-90" aria-hidden="true">
      <circle cx="8" cy="8" r={r} fill="none" stroke="var(--border-strong)" strokeWidth="2" />
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        // Animate the sweep between the 1s ticks instead of stepping.
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
    </svg>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendCode } = useAuth();
  const reduceMotion = useReducedMotion();
  const shakeControls = useAnimationControls();

  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: CODE_LENGTH }, () => "")
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
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

  const shake = useCallback(() => {
    if (reduceMotion) return;
    void shakeControls.start({
      x: [0, -8, 8, -5, 5, -2, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }, [reduceMotion, shakeControls]);

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");
    setError(null);

    if (!value) {
      setDigitAt(index, "");
      return;
    }

    if (value.length === 1) {
      setDigitAt(index, value);
      focusInput(index + 1);
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < value.length && index + i < CODE_LENGTH; i++) {
        next[index + i] = value[i]!;
      }
      return next;
    });
    focusInput(index + value.length);
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
    if (!isComplete || submitting || verified) return;

    if (isExpired) {
      setError("This code has expired. Request a new one.");
      shake();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      setVerified(true);
      toast.success("Email verified");
      window.setTimeout(() => {
        router.replace("/dashboard");
      }, reduceMotion ? 0 : SUCCESS_REDIRECT_MS);
    } catch (err) {
      const message =
        (err as ApiError)?.message ?? "Verification failed. Try again.";
      setError(message);
      shake();
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

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-8"
      noValidate
    >
      <AnimatePresence mode="wait" initial={false}>
        {verified ? (
          <SuccessCheck key="success" />
        ) : (
          <motion.div
            key="entry"
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeIn" }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-3 text-center">
              <MailBadge />
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

            <AnimatePresence initial={false}>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.div
              animate={shakeControls}
              className="flex justify-center gap-3"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={digit && !reduceMotion ? "filled" : "shown"}
                  variants={{
                    shown: { opacity: 1, y: 0, scale: 1 },
                    filled: { opacity: 1, y: 0, scale: [1.12, 1] },
                  }}
                  transition={
                    digit
                      ? { duration: 0.18, ease: "easeOut" }
                      : { duration: 0.25, ease: "easeOut", delay: index * 0.05 }
                  }
                >
                  <input
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={(e) => e.currentTarget.select()}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                    className={cn(
                      "h-14 w-12 rounded-lg border bg-surface text-center font-mono text-xl text-text",
                      "transition-colors focus-visible:outline",
                      "focus-visible:outline-accent-border focus-visible:outline-offset-2",
                      error ? "border-danger" : digit ? "border-border-strong" : "border-border"
                    )}
                  />
                </motion.div>
              ))}
            </motion.div>

            <p className="text-center text-sm text-muted tabular">
              {isExpired ? (
                <span className="text-danger">Code expired</span>
              ) : (
                <>Code expires in {formatCountdown(expiresIn)}</>
              )}
            </p>

            <Button
              type="submit"
              loading={submitting}
              disabled={!isComplete}
              className="w-full"
            >
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
              {cooldown > 0 ? (
                <span className="inline-flex items-center gap-2">
                  <ResendRing cooldown={cooldown} />
                  Resend in {cooldown}s
                </span>
              ) : (
                "Resend code"
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
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
