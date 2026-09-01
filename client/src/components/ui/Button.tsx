'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary:
    'bg-surface border border-border-strong text-text hover:bg-bg',
  ghost: 'text-muted hover:bg-accent-subtle hover:text-accent-text',
  danger:
    'bg-danger text-danger-fg hover:bg-danger-hover',
};

const spinnerClasses: Record<ButtonVariant, string> = {
  primary:
    'border-[color-mix(in_srgb,var(--accent-fg)_35%,transparent)] border-t-accent-fg',
  secondary: 'border-border border-t-muted',
  ghost: 'border-border border-t-muted',
  danger:
    'border-[color-mix(in_srgb,var(--danger-fg)_35%,transparent)] border-t-danger-fg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', loading = false, disabled, className, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-40',
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            className={cn(
              'h-3.5 w-3.5 animate-spin rounded-full border-2',
              spinnerClasses[variant],
            )}
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
