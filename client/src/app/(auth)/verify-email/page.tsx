"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import {
  CODE_LENGTH,
  OtpInput,
  emptyOtpDigits,
  type OtpInputHandle,
} from "@/components/auth/OtpInput";
import {
  CODE_EXPIRY_SECONDS,
  RESEND_COOLDOWN_SECONDS,
  ResendRing,
  formatCountdown,
} from "@/components/auth/ResendRing";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@/lib/types";

const SUCCESS_REDIRECT_MS = 1100;

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

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendCode, user, logout } = useAuth();
  const reduceMotion = useReducedMotion();
  const shakeControls = useAnimationControls();

  const email = searchParams.get("email") ?? user?.email ?? "";

  const [digits, setDigits] = useState<string[]>(emptyOtpDigits);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(CODE_EXPIRY_SECONDS);
  const [cooldown, setCooldown] = useState(0);

  const otpRef = useRef<OtpInputHandle | null>(null);

  const code = useMemo(() => digits.join(""), [digits]);
  const isComplete = code.length === CODE_LENGTH;
  const isExpired = expiresIn <= 0;

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

  const shake = useCallback(() => {
    if (reduceMotion) return;
    void shakeControls.start({
      x: [0, -8, 8, -5, 5, -2, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }, [reduceMotion, shakeControls]);

  const clearCode = useCallback(() => {
    setDigits(emptyOtpDigits());
    otpRef.current?.focus(0);
  }, []);

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
      clearCode();
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
      setExpiresIn(CODE_EXPIRY_SECONDS);
      clearCode();
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

            {user && !user.verified ? (
              <div className="flex flex-col gap-2 rounded-lg bg-accent-subtle px-3 py-2.5 text-[13px] leading-4.5">
                <p className="text-text">
                  Your account isn&apos;t verified yet. Uploads, files and the
                  dashboard stay locked until you enter the code above.
                </p>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="self-start text-accent-text hover:underline"
                >
                  Sign out and use a different account
                </button>
              </div>
            ) : null}

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

            <OtpInput
              ref={otpRef}
              digits={digits}
              onChange={(next, source) => {
                setDigits(next);
                // Backspacing over a rejected code keeps the reason on screen.
                if (source !== "erase") setError(null);
              }}
              invalid={!!error}
              shakeControls={shakeControls}
            />

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
