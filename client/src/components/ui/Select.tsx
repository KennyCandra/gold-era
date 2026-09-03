'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

const MENU_GAP = 4;
const ROW_HEIGHT = 30;
const MENU_PADDING = 8;

type MenuPosition = {
  left: number;
  top: number;
  width: number;
};

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
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = rootRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = options.length * ROW_HEIGHT + MENU_PADDING;
    const spaceBelow = window.innerHeight - rect.bottom;

    const flip = spaceBelow < menuHeight + MENU_GAP && rect.top > spaceBelow;

    setPosition({
      left: rect.left,
      top: flip ? rect.top - menuHeight - MENU_GAP : rect.bottom + MENU_GAP,
      width: rect.width,
    });
  }, [options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, updatePosition]);

  const selected = options.find((o) => o.value === value);

  const menu =
    open && position ? (
      <div
        ref={menuRef}
        role="listbox"
        style={{ left: position.left, top: position.top, width: position.width }}
        className="fixed z-50 flex flex-col gap-0.5 rounded-lg border border-border bg-raised p-1 shadow-[var(--shadow)]"
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
    ) : null;

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

      {typeof document !== 'undefined' && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
