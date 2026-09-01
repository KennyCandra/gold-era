'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  wrapperClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, wrapperClassName, className, ...props }, ref) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className={cn('relative flex items-center', wrapperClassName)}>
        <Search
          className="pointer-events-none absolute left-2.5 h-4 w-4 text-subtle"
          strokeWidth={1.5}
        />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-9 w-full rounded-md border border-border bg-surface pl-8 pr-8 text-sm text-text placeholder:text-subtle',
            'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2',
            'focus:border-accent-border',
            className,
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={cn(
              'absolute right-2.5 flex h-4 w-4 items-center justify-center text-subtle',
              'rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2',
            )}
          >
            <X className="h-3 w-3" strokeWidth={1.6} />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
