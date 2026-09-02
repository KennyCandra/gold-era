"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, RoleBadge } from "@/components/ui";
import {
  ADMIN_NAV_ITEMS,
  isActivePath,
  NavLink,
  PRIMARY_NAV_ITEMS,
} from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Close on route change.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%", transition: { duration: 0.18, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="relative flex h-full w-[280px] flex-col border-r border-border bg-surface shadow-[var(--shadow)]"
          >
            <div className="flex items-center gap-2.5 px-6 py-6">
              <svg
                width="20"
                height="20"
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
              <span className="truncate text-sm font-semibold tracking-tight">
                Managing Your Files
              </span>
            </div>

            <nav className="flex flex-col gap-0.5 px-3">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActivePath(pathname, item.href)}
                  indicatorId="drawer-nav"
                  showLabel
                  onClick={onClose}
                />
              ))}

              {isAdmin && (
                <>
                  <div className="mx-2.5 my-3 h-px bg-border" />
                  <div className="px-2.5 pb-1.5 text-xs font-medium tracking-[0.06em] text-subtle">
                    ADMIN
                  </div>
                  {ADMIN_NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActivePath(pathname, item.href)}
                      indicatorId="drawer-nav"
                      showLabel
                      onClick={onClose}
                    />
                  ))}
                </>
              )}
            </nav>

            {user && (
              <div className="mt-auto border-t border-border px-3 py-3">
                <div className="flex items-center gap-2.5 px-2.5 py-2">
                  <Avatar name={user.name} />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-medium leading-[18px]">
                      {user.name}
                    </span>
                    <RoleBadge
                      role={user.role === "ADMIN" ? "Admin" : "User"}
                      className="mt-0.5 w-fit"
                    />
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex h-9 items-center rounded-lg px-2.5 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-text"
                >
                  Profile
                </Link>
                <div className="flex h-10 items-center justify-between rounded-lg pl-2.5 pr-0.5 text-sm font-medium text-muted">
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="flex h-9 w-full items-center rounded-lg px-2.5 text-left text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-text"
                >
                  Sign out
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
