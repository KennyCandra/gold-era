import { FileArchive, FileSpreadsheet, FileText, FileType as FileTypeGlyph, Image } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileExt = 'pdf' | 'jpg' | 'png' | 'xlsx' | 'csv' | 'docx' | 'txt' | 'zip';

interface FileTypeMeta {
  icon: LucideIcon;
  color: 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';
}

const FILE_TYPE_MAP: Record<FileExt, FileTypeMeta> = {
  pdf: { icon: FileText, color: 'c4' },
  jpg: { icon: Image, color: 'c2' },
  png: { icon: Image, color: 'c2' },
  xlsx: { icon: FileSpreadsheet, color: 'c1' },
  csv: { icon: FileSpreadsheet, color: 'c1' },
  docx: { icon: FileTypeGlyph, color: 'c3' },
  txt: { icon: FileText, color: 'c6' },
  zip: { icon: FileArchive, color: 'c5' },
};

const colorClasses: Record<FileTypeMeta['color'], string> = {
  c1: 'bg-[color-mix(in_srgb,var(--c1)_14%,transparent)] text-c1',
  c2: 'bg-[color-mix(in_srgb,var(--c2)_14%,transparent)] text-c2',
  c3: 'bg-[color-mix(in_srgb,var(--c3)_14%,transparent)] text-c3',
  c4: 'bg-[color-mix(in_srgb,var(--c4)_14%,transparent)] text-c4',
  c5: 'bg-[color-mix(in_srgb,var(--c5)_14%,transparent)] text-c5',
  c6: 'bg-[color-mix(in_srgb,var(--c6)_14%,transparent)] text-c6',
};

export interface FileTypeIconProps {
  ext: string;
  className?: string;
}

export function FileTypeIcon({ ext, className }: FileTypeIconProps) {
  const normalized = ext.toLowerCase().replace(/^\./, '') as FileExt;
  const meta = FILE_TYPE_MAP[normalized] ?? { icon: FileText, color: 'c6' as const };
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
        colorClasses[meta.color],
        className,
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
    </span>
  );
}
