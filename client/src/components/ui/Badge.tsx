import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone =
  | 'accent'
  | 'neutral'
  | 'success'
  | 'danger'
  | 'c1'
  | 'c2'
  | 'c3'
  | 'c4'
  | 'c5'
  | 'c6';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  accent: 'bg-accent-subtle text-accent-text',
  neutral: 'bg-[color-mix(in_srgb,var(--muted)_12%,transparent)] text-muted',
  success: 'bg-success-subtle text-success',
  danger: 'bg-danger-subtle text-danger',
  c1: 'bg-[color-mix(in_srgb,var(--c1)_14%,transparent)] text-c1',
  c2: 'bg-[color-mix(in_srgb,var(--c2)_14%,transparent)] text-c2',
  c3: 'bg-[color-mix(in_srgb,var(--c3)_14%,transparent)] text-c3',
  c4: 'bg-[color-mix(in_srgb,var(--c4)_14%,transparent)] text-c4',
  c5: 'bg-[color-mix(in_srgb,var(--c5)_14%,transparent)] text-c5',
  c6: 'bg-[color-mix(in_srgb,var(--c6)_14%,transparent)] text-c6',
};

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-md px-1.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type UserRole = 'Admin' | 'User';
export type UserStatus = 'Verified' | 'Pending';

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return (
    <Badge tone={role === 'Admin' ? 'accent' : 'neutral'} className={className}>
      {role}
    </Badge>
  );
}

export function StatusBadge({ status, className }: { status: UserStatus; className?: string }) {
  return (
    <Badge tone={status === 'Verified' ? 'success' : 'neutral'} className={className}>
      {status}
    </Badge>
  );
}
