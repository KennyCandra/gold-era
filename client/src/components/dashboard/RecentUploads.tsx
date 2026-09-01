import Link from "next/link";

import { FileTypeIcon } from "@/components/ui";
import type { FileItem } from "@/lib/types";
import { formatBytes, formatRelative } from "@/lib/utils";

export interface RecentUploadsProps {
  files: FileItem[];
}

export function RecentUploads({ files }: RecentUploadsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between p-5">
        <h2 className="text-lg font-semibold leading-7">Recent uploads</h2>
        <Link
          href="/files"
          className="flex h-8 items-center rounded-lg px-2.5 text-sm font-medium text-muted transition-colors hover:bg-accent-subtle hover:text-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2"
        >
          View all
        </Link>
      </div>
      {files.map((file) => {
        const ext = file.originalName.split(".").pop() ?? "";
        return (
          <Link
            key={file.id}
            href={`/files/${file.id}`}
            className="flex items-center gap-4 border-t border-border px-5 py-3 transition-colors hover:bg-bg"
          >
            <FileTypeIcon ext={ext} />
            <span className="min-w-0 flex-1 truncate text-sm leading-5">{file.originalName}</span>
            <span className="w-[90px] shrink-0 text-right text-[13px] leading-[18px] text-muted tabular-nums">
              {formatBytes(file.size)}
            </span>
            <span className="w-[120px] shrink-0 text-right text-[13px] leading-[18px] text-subtle tabular-nums">
              {formatRelative(file.createdAt)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
