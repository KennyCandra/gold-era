'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: ReactNode;
  rightAdornment?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      leftIcon,
      rightAdornment,
      wrapperClassName,
      className,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-2.5 flex items-center text-subtle">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              'h-9 w-full rounded-md border bg-surface px-2.5 text-sm text-text placeholder:text-subtle',
              'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2',
              'disabled:cursor-not-allowed disabled:bg-bg disabled:opacity-40',
              error ? 'border-danger' : 'border-border focus:border-accent-border',
              leftIcon && 'pl-8',
              rightAdornment && 'pr-8',
              className,
            )}
            {...props}
          />
          {rightAdornment && (
            <span className="absolute right-2.5 flex items-center">
              {rightAdornment}
            </span>
          )}
        </div>
        {error && <span className="text-[13px] leading-[18px] text-danger">{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
