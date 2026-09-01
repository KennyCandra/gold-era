"use client";

import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";

import { Badge, FileTypeIcon, Skeleton } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { cn, formatBytes, formatRelative, getFileKind } from "@/lib/utils";
import type { FileItem } from "@/lib/types";

export interface FileGridProps {
  files: FileItem[];
  onDelete?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  isLoading?: boolean;
  className?: string;
}

function getExt(file: FileItem): string {
  const fromName = file.originalName.split(".").pop();
  return (fromName || "file").toLowerCase();
}

export function FileGrid({
  files,
  onDelete,
  onDownload,
  isLoading = false,
  className,
}: FileGridProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {files.map((file) => {
        const ext = getExt(file);
        const kind = getFileKind(file.mimeType || ext);

        return (
          <li key={file.id}>
            <div
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/files/${file.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/files/${file.id}`);
                }
              }}
              className={cn(
                "group flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-border",
                "bg-surface p-4 transition-colors hover:border-border-strong",
                "focus-visible:outline focus-visible:outline-2",
                "focus-visible:outline-accent-border focus-visible:outline-offset-2"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <FileTypeIcon ext={ext} />
                <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  {onDownload && (
                    <button
                      type="button"
                      aria-label={`Download ${file.originalName}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDownload(file);
                      }}
                      className="rounded-md p-1.5 text-muted transition-colors hover:bg-bg hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border"
                    >
                      <Download className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      aria-label={`Delete ${file.originalName}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(file);
                      }}
                      className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger-subtle hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-medium text-text" title={file.originalName}>
                  {file.originalName}
                </span>
                <Badge tone={kind.colorVar.replace("--", "") as BadgeTone} className="w-fit">
                  {kind.label}
                </Badge>
              </div>

              <div className="mt-auto flex items-center justify-between text-xs text-muted tabular">
                <span>{formatBytes(file.size)}</span>
                <span>{formatRelative(file.createdAt)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
