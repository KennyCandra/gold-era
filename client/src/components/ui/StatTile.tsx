import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: 'success' | 'danger';
  className?: string;
}

export function StatTile({ label, value, delta, deltaTone = 'success', className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-border bg-surface p-5',
        className,
      )}
    >
      <span className="text-[13px] leading-[18px] text-muted">{label}</span>
      <span className="whitespace-nowrap text-[clamp(20px,2vw,30px)] font-semibold leading-9 tracking-[-0.02em] tabular-nums">
        {value}
      </span>
      {delta && (
        <span
          className={cn(
            'text-[13px] leading-[18px] tabular-nums',
            deltaTone === 'success' ? 'text-success' : 'text-danger',
          )}
        >
          {delta}
        </span>
      )}
    </div>
  );
}
