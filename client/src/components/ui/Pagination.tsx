'use client';

import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function buildPageList(page: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev !== undefined && p - prev > 1) result.push('ellipsis');
    }
    result.push(p);
  });
  return result;
}

export function Pagination({
  page,
  pageCount,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = buildPageList(page, pageCount);

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-[13px] leading-[18px] text-muted tabular-nums">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="flex gap-1.5">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 min-w-8 items-center justify-center text-[13px] text-subtle"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[13px] font-medium tabular-nums transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2',
                p === page
                  ? 'border-accent bg-accent text-accent-fg'
                  : 'border-border bg-surface text-muted hover:bg-bg',
              )}
            >
              {p}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
