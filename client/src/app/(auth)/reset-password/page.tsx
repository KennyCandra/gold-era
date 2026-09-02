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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Input } from "@/components/ui";
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
import { PASSWORD_HINT, validatePassword } from "@/lib/password";
import type { ApiError } from "@/lib/types";

const SUCCESS_REDIRECT_MS = 1100;

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

/** Applies the shared policy so a weak password never round-trips. */
function validateNewPassword(password: string): string | undefined {
  if (!password) return "Password is required";
  return validatePassword(password) ?? undefined;
}

function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

function KeyBadge() {
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
        <KeyRound className="h-5 w-5 text-accent-text" strokeWidth={1.8} aria-hidden="true" />
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
        <span className="text-lg font-semibold text-text">Password updated</span>
        <span className="text-sm text-muted">Taking you to sign in…</span>
      </div>
    </motion.div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { forgotPassword, resetPassword } = useAuth();
  const reduceMotion = useReducedMotion();
  const shakeControls = useAnimationControls();

  const emailFromQuery = searchParams.get("email") ?? "";
  // Landing here without the query param (a bookmark, a stripped link) is not a
  // dead end — the address just becomes an editable field.
  const [email, setEmail] = useState(emailFromQuery);
  const emailIsEditable = !emailFromQuery;

  const [digits, setDigits] = useState<string[]>(emptyOtpDigits);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
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

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!email.trim()) errors.email = "Email is required";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email";

    const passwordError = validateNewPassword(password);
    if (passwordError) errors.password = passwordError;
    else if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * 401 (unknown user / wrong code) and 410 (expired) both land on the code
   * boxes; 400 carries per-field zod messages we can place precisely.
   */
  function applyApiError(apiErr: ApiError) {
    const errors = apiErr.errors;

    if (errors) {
      const next: FieldErrors = {};
      if (errors.email?.[0]) next.email = errors.email[0];
      if (errors.password?.[0]) next.password = errors.password[0];
      setFieldErrors(next);

      if (errors.code?.[0]) {
        setError(errors.code[0]);
        setCodeInvalid(true);
        shake();
        return;
      }
      if (Object.keys(next).length > 0) return;
    }

    setError(apiErr.message || "Could not reset your password. Try again.");
    if (apiErr.statusCode === 401 || apiErr.statusCode === 410) {
      setCodeInvalid(true);
      shake();
      clearCode();
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || done) return;

    setError(null);
    setCodeInvalid(false);

    if (!validate()) return;

    if (!isComplete) {
      setError("Enter the 6-digit code from your email.");
      setCodeInvalid(true);
      shake();
      return;
    }

    if (isExpired) {
      setError("This code has expired. Request a new one.");
      setCodeInvalid(true);
      shake();
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email, code, password);
      setDone(true);
      toast.success("Password updated, sign in with your new password");
      window.setTimeout(
        () => {
          router.push("/login");
        },
        reduceMotion ? 0 : SUCCESS_REDIRECT_MS
      );
    } catch (err) {
      applyApiError(err as ApiError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    if (!email.trim() || !isValidEmail(email)) {
      setFieldErrors((prev) => ({ ...prev, email: "Enter a valid email" }));
      return;
    }

    setResending(true);
    setError(null);
    setCodeInvalid(false);
    try {
      const message = await forgotPassword(email);
      toast.success(message || "A new code is on its way");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setExpiresIn(CODE_EXPIRY_SECONDS);
      clearCode();
    } catch (err) {
      const message = (err as ApiError)?.message ?? "Could not resend the code.";
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
        {done ? (
          <SuccessCheck key="success" />
        ) : (
          <motion.div
            key="entry"
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeIn" }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-3 text-center">
              <KeyBadge />
              <h1 className="text-3xl font-semibold text-text">Set a new password</h1>
              <p className="text-sm text-muted">
                {emailFromQuery ? (
                  <>
                    Enter the 6-digit code we sent to{" "}
                    <span className="font-medium text-text">{emailFromQuery}</span>
                  </>
                ) : (
                  "Enter your email, the 6-digit code we sent you, and a new password."
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

            {emailIsEditable && (
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  error={fieldErrors.email}
                />
              </div>
            )}

            <OtpInput
              ref={otpRef}
              digits={digits}
              onChange={(next, source) => {
                setDigits(next);
                // Backspacing over a rejected code keeps the reason on screen.
                if (source !== "erase") {
                  setError(null);
                  setCodeInvalid(false);
                }
              }}
              invalid={codeInvalid}
              shakeControls={shakeControls}
              autoFocus={!emailIsEditable}
            />

            <p className="text-center text-sm text-muted tabular">
              {isExpired ? (
                <span className="text-danger">Code expired</span>
              ) : (
                <>Code expires in {formatCountdown(expiresIn)}</>
              )}
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={fieldErrors.password}
              />
              {!fieldErrors.password && (
                <span className="text-[13px] leading-[18px] text-subtle">
                  {PASSWORD_HINT}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm new password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                error={fieldErrors.confirmPassword}
              />
            </div>

            <Button
              type="submit"
              loading={submitting}
              disabled={!isComplete || !password || !confirmPassword}
              className="w-full"
            >
              Reset password
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

            <p className="text-center text-[13px] leading-4.5 text-muted">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-accent-text hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                Back to sign in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
