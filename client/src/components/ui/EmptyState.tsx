'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  heading: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

function DefaultIcon() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 72 72"
      fill="none"
      stroke="var(--border-strong)"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M14 24h16l5 6h23v28a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V24Z" />
      <path d="M36 40v12" />
      <path d="M31 45l5-5 5 5" />
    </svg>
  );
}

export function EmptyState({ heading, message, action, icon, className }: EmptyStateProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-5 py-10 text-center',
        className,
      )}
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -5, 0], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }
        }
      >
        {icon ?? <DefaultIcon />}
      </motion.div>
      <span className="text-lg font-semibold leading-7">{heading}</span>
      {message && <span className="text-sm text-muted">{message}</span>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
