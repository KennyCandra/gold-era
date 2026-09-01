import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className={cn('w-full min-w-full border-collapse text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-bg', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  header?: boolean;
}

export function TableRow({ header = false, className, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-border last:border-b-0',
        !header && 'transition-colors hover:bg-bg',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

type TableCellAlign = 'left' | 'right' | 'center';

export interface TableCellProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement> & TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  header?: boolean;
  align?: TableCellAlign;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  children?: ReactNode;
}

const alignClasses: Record<TableCellAlign, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function TableCell({
  header = false,
  align = 'left',
  sortable = false,
  sortDirection = null,
  onSort,
  className,
  children,
  ...props
}: TableCellProps) {
  const Comp = header ? 'th' : 'td';

  const content = sortable ? (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        'inline-flex items-center gap-1 font-medium text-muted',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2',
        align === 'right' && 'flex-row-reverse',
      )}
    >
      {children}
      {sortDirection === 'asc' ? (
        <ChevronUp className="h-3 w-3" strokeWidth={1.8} />
      ) : sortDirection === 'desc' ? (
        <ChevronDown className="h-3 w-3" strokeWidth={1.8} />
      ) : (
        <ChevronDown className="h-3 w-3 opacity-40" strokeWidth={1.8} />
      )}
    </button>
  ) : (
    children
  );

  return (
    <Comp
      className={cn(
        'px-5',
        alignClasses[align],
        header
          ? 'h-11 whitespace-nowrap text-sm font-medium text-muted'
          : 'h-[52px] text-text',
        className,
      )}
      {...props}
    >
      {content}
    </Comp>
  );
}
