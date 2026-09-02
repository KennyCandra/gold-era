"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

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

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-bg px-5 sm:px-8">
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
    </header>
  );
}
