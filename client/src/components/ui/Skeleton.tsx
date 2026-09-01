import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block rounded-md bg-[linear-gradient(90deg,var(--bg),var(--border),var(--bg))] bg-[length:320px_100%]',
        'animate-[shimmer_1.4s_linear_infinite]',
        className,
      )}
    />
  );
}

export interface TableSkeletonProps {
  rows?: number;
  className?: string;
}

export function TableSkeleton({ rows = 6, className }: TableSkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-surface', className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={cn(
            'flex h-[52px] items-center gap-4 px-5',
            i > 0 && 'border-t border-border',
          )}
        >
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-3 max-w-[320px] flex-1" />
          <Skeleton className="h-3 w-[90px]" />
          <Skeleton className="h-3 w-[140px]" />
        </div>
      ))}
    </div>
  );
}
