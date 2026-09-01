"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong bg-surface text-muted transition-colors hover:bg-accent-subtle hover:text-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2"
    >
      {resolvedTheme === "dark" ? (
        <Moon className="h-4 w-4" strokeWidth={1.5} />
      ) : (
        <Sun className="h-4 w-4" strokeWidth={1.5} />
      )}
    </button>
  );
}
