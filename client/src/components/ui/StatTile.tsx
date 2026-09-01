'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: 'success' | 'danger';
  /** Position in the tile row, staggers the entrance. */
  index?: number;
  className?: string;
}

function parseNumeric(value: ReactNode): { prefix: string; target: number; decimals: number; comma: boolean; suffix: string } | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const match = String(value).match(/^([^0-9]*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, num, suffix] = match as unknown as [string, string, string, string];
  const comma = num.includes(',');
  const plain = num.replace(/,/g, '');
  const decimals = plain.includes('.') ? plain.split('.')[1]!.length : 0;
  const target = Number(plain);
  if (!Number.isFinite(target)) return null;
  return { prefix, target, decimals, comma, suffix };
}

function formatCount(n: number, decimals: number, comma: boolean): string {
  return comma
    ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : n.toFixed(decimals);
}

function CountUpValue({ value }: { value: ReactNode }) {
  const parsed = parseNumeric(value);
  const reduceMotion = useReducedMotion();
  const previous = useRef(0);
  const [animated, setAnimated] = useState(0);

  const target = parsed?.target;

  useEffect(() => {
    if (target === undefined || reduceMotion) return;
    const controls = animate(previous.current, target, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setAnimated,
      onComplete: () => {
        previous.current = target;
      },
    });
    return () => controls.stop();
  }, [target, reduceMotion]);

  if (!parsed) return <>{value}</>;
  const shown = reduceMotion ? parsed.target : animated;
  return (
    <>
      {parsed.prefix}
      {formatCount(shown, parsed.decimals, parsed.comma)}
      {parsed.suffix}
    </>
  );
}

export function StatTile({ label, value, delta, deltaTone = 'success', index = 0, className }: StatTileProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.3) }}
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-border bg-surface p-5',
        className,
      )}
    >
      <span className="text-[13px] leading-[18px] text-muted">{label}</span>
      <span className="whitespace-nowrap text-[clamp(20px,2vw,30px)] font-semibold leading-9 tracking-[-0.02em] tabular-nums">
        <CountUpValue value={value} />
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
    </motion.div>
  );
}
