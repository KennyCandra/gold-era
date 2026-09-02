"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type ShakeControls = ReturnType<typeof useAnimationControls>;

export const CODE_LENGTH = 6;

export function emptyOtpDigits(): string[] {
  return Array.from({ length: CODE_LENGTH }, () => "");
}

export type OtpChangeSource = "type" | "paste" | "erase";

export type OtpInputHandle = {
  /** Focus (and select) one box. Defaults to the first. */
  focus: (index?: number) => void;
};

export interface OtpInputProps {
  digits: string[];
  onChange: (digits: string[], source: OtpChangeSource) => void;
  invalid?: boolean;
  shakeControls: ShakeControls;
  autoFocus?: boolean;
}

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(function OtpInput(
  { digits, onChange, invalid = false, shakeControls, autoFocus = true },
  ref
) {
  const reduceMotion = useReducedMotion();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = useCallback((index: number) => {
    const clamped = Math.min(Math.max(index, 0), CODE_LENGTH - 1);
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      focus: (index = 0) => focusInput(index),
    }),
    [focusInput]
  );

  useEffect(() => {
    if (!autoFocus) return;
    inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const withDigitAt = useCallback(
    (index: number, value: string) => {
      const next = [...digits];
      next[index] = value;
      return next;
    },
    [digits]
  );

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");

    if (!value) {
      onChange(withDigitAt(index, ""), "type");
      return;
    }

    if (value.length === 1) {
      onChange(withDigitAt(index, value), "type");
      focusInput(index + 1);
      return;
    }

    const next = [...digits];
    for (let i = 0; i < value.length && index + i < CODE_LENGTH; i++) {
      next[index + i] = value[i]!;
    }
    onChange(next, "type");
    focusInput(index + value.length);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        onChange(withDigitAt(index, ""), "erase");
        return;
      }
      onChange(withDigitAt(index - 1 >= 0 ? index - 1 : 0, ""), "erase");
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
    const chars = pasted.slice(0, CODE_LENGTH).split("");
    onChange(
      Array.from({ length: CODE_LENGTH }, (_, index) => chars[index] ?? ""),
      "paste"
    );
    focusInput(chars.length >= CODE_LENGTH ? CODE_LENGTH - 1 : chars.length);
  };

  return (
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
              invalid ? "border-danger" : digit ? "border-border-strong" : "border-border"
            )}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});
