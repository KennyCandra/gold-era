'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled,
  className,
  id,
  ...rest
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border bg-surface px-2.5 text-sm text-text',
          'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-40',
          open ? 'border-accent-border' : 'border-border',
        )}
        {...rest}
      >
        <span className={cn(!selected && 'text-subtle')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn('h-3 w-3 text-subtle transition-transform', open && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 flex flex-col gap-0.5 rounded-lg border border-border bg-raised p-1 shadow-[var(--shadow)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex h-7.5 items-center rounded-md px-2 text-left text-sm',
                  isSelected
                    ? 'bg-accent-subtle font-medium text-accent-text'
                    : 'text-muted hover:bg-bg',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
