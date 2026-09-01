import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  heading?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  heading = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-5 py-10 text-center',
        className,
      )}
    >
      <svg
        width="60"
        height="60"
        viewBox="0 0 72 72"
        fill="none"
        stroke="var(--danger)"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="36" cy="36" r="20" />
        <path d="M36 26v14M36 47v0.5" />
      </svg>
      <span className="text-lg font-semibold leading-7">{heading}</span>
      {message && <span className="text-sm text-muted">{message}</span>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
