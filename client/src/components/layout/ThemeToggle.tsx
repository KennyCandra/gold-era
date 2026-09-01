"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border-strong bg-surface text-muted transition-colors hover:bg-accent-subtle hover:text-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={resolvedTheme === "dark" ? "moon" : "sun"}
          initial={reduceMotion ? false : { rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={1.5} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
