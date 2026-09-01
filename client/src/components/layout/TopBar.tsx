"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";

import { Avatar } from "@/components/ui";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

function deriveTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/upload") return "Upload";
  if (pathname === "/files") return "My Files";
  if (pathname.startsWith("/files/")) return "File Details";
  if (pathname === "/profile") return "Profile";
  if (pathname === "/admin") return "Admin Overview";
  if (pathname === "/admin/users") return "Users";
  if (pathname === "/admin/files") return "Files";

  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";
  if (!last) return "Managing Your Files";
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export interface TopBarProps {
  onOpenMenu: () => void;
}

export function TopBar({ onOpenMenu }: TopBarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-bg px-5 sm:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.6} />
        </button>
        <h1 className="truncate text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
          {deriveTitle(pathname)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-9 items-center gap-2 rounded-lg border border-border-strong bg-surface py-0 pl-1 pr-2 text-text transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2"
            >
              <Avatar name={user.name} size="sm" />
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted transition-transform",
                  menuOpen && "rotate-180",
                )}
                strokeWidth={1.5}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-20 flex w-[180px] flex-col gap-0.5 rounded-xl border border-border bg-raised p-1.5 shadow-[var(--shadow)]"
              >
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-[34px] items-center rounded-md px-2.5 text-sm text-text transition-colors hover:bg-accent-subtle hover:text-accent-text"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex h-[34px] items-center rounded-md px-2.5 text-left text-sm text-text transition-colors hover:bg-accent-subtle hover:text-accent-text"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
