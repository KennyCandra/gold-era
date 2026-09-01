"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Files,
  FolderKanban,
  LayoutGrid,
  Upload,
  User as UserIcon,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Avatar } from "@/components/ui";
import { RoleBadge } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/files", label: "My Files", icon: Files },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/files", label: "Files", icon: FolderKanban },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  item,
  active,
  collapsedTooltip = true,
  showLabel,
  onClick,
  indicatorId,
}: {
  item: NavItem;
  active: boolean;
  collapsedTooltip?: boolean;
  showLabel?: boolean;
  onClick?: () => void;
  /**
   * Shared layoutId namespace for the sliding active highlight. Sidebar and
   * MobileDrawer pass different ids — both are mounted at once, and duplicate
   * layoutIds would make the two indicators fight over one animation.
   */
  indicatorId?: string;
}) {
  const Icon = item.icon;
  const reduceMotion = useReducedMotion();
  const slide = indicatorId && !reduceMotion;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-accent-border focus-visible:outline-offset-2",
        active
          ? cn("text-accent-text", !slide && "bg-accent-subtle")
          : "text-muted hover:bg-bg hover:text-text",
      )}
    >
      {slide && active && (
        <motion.span
          layoutId={`${indicatorId}-pill`}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
          className="absolute inset-0 rounded-lg bg-accent-subtle"
          aria-hidden="true"
        />
      )}
      {slide ? (
        active && (
          <motion.span
            layoutId={`${indicatorId}-bar`}
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
            className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-sm bg-accent"
            aria-hidden="true"
          />
        )
      ) : (
        <span
          className={cn(
            "absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-sm",
            active ? "bg-accent" : "bg-transparent",
          )}
          aria-hidden="true"
        />
      )}
      <Icon className="relative h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span className={cn("relative truncate", showLabel ? "inline" : "lg:inline md:hidden")}>
        {item.label}
      </span>
      {collapsedTooltip && !showLabel && (
        <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-raised px-2 py-1 text-xs font-medium text-text shadow-[var(--shadow)] md:group-hover:block lg:!hidden">
          {item.label}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col border-r border-border bg-surface md:flex lg:w-60">
      <div className="flex items-center gap-2.5 px-4 py-6 lg:px-6">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          className="shrink-0"
          aria-hidden="true"
        >
          <path d="M3 6.5 10 3l7 3.5L10 10 3 6.5Z" />
          <path d="M3 10.5 10 14l7-3.5" />
          <path d="M3 14 10 17.5 17 14" />
        </svg>
        <span className="hidden truncate text-sm font-semibold tracking-tight lg:inline">
          Managing Your Files
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
            indicatorId="sidebar-nav"
          />
        ))}

        {isAdmin && (
          <>
            <div className="mx-2.5 my-3 h-px bg-border" />
            <div className="hidden px-2.5 pb-1.5 text-xs font-medium tracking-[0.06em] text-subtle lg:block">
              ADMIN
            </div>
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActivePath(pathname, item.href)}
                indicatorId="sidebar-nav"
              />
            ))}
          </>
        )}
      </nav>

      {user && (
        <div className="mt-auto flex items-center gap-2.5 px-4 py-5 lg:px-5">
          <Avatar name={user.name} />
          <div className="hidden min-w-0 flex-col lg:flex">
            <span className="truncate text-[13px] font-medium leading-4.5">
              {user.name}
            </span>
            <RoleBadge
              role={user.role === "ADMIN" ? "Admin" : "User"}
              className="mt-0.5 w-fit"
            />
          </div>
        </div>
      )}
    </aside>
  );
}
