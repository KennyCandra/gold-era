"use client";

import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";

import {
  Avatar,
  Badge,
  FileTypeIcon,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableSkeleton,
} from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { formatBytes, formatDate, formatRelative, getFileKind } from "@/lib/utils";
import type { FileItem } from "@/lib/types";

export interface FileTableProps {
  files: FileItem[];
  showOwner?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  onDelete?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  isLoading?: boolean;
  className?: string;
}

function getExt(file: FileItem): string {
  const fromName = file.originalName.split(".").pop();
  return (fromName || "file").toLowerCase();
}

export function FileTable({
  files,
  showOwner = false,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
  onDownload,
  isLoading = false,
  className,
}: FileTableProps) {
  const router = useRouter();

  if (isLoading) {
    return <TableSkeleton className={className} />;
  }

  const sortDirection = (field: string): "asc" | "desc" | null =>
    sortBy === field ? (sortOrder ?? "asc") : null;

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow header>
          <TableCell
            header
            sortable={!!onSort}
            sortDirection={sortDirection("originalName")}
            onSort={() => onSort?.("originalName")}
          >
            Name
          </TableCell>
          {showOwner && <TableCell header>Owner</TableCell>}
          <TableCell
            header
            align="right"
            sortable={!!onSort}
            sortDirection={sortDirection("size")}
            onSort={() => onSort?.("size")}
          >
            Size
          </TableCell>
          <TableCell
            header
            align="right"
            sortable={!!onSort}
            sortDirection={sortDirection("createdAt")}
            onSort={() => onSort?.("createdAt")}
          >
            Uploaded
          </TableCell>
          <TableCell header align="right" aria-label="Actions" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => {
          const ext = getExt(file);
          const kind = getFileKind(file.mimeType || ext);

          return (
            <TableRow
              key={file.id}
              className="cursor-pointer"
              onClick={() => router.push(`/files/${file.id}`)}
            >
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <FileTypeIcon ext={ext} />
                  <span className="min-w-0 flex-1 truncate">{file.originalName}</span>
                  <Badge tone={kind.colorVar.replace("--", "") as BadgeTone} className="shrink-0">
                    {kind.group}
                  </Badge>
                </div>
              </TableCell>
              {showOwner && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar name={file.user?.name ?? "Unknown"} size="sm" />
                    <span className="truncate text-sm">{file.user?.name ?? "Unknown"}</span>
                  </div>
                </TableCell>
              )}
              <TableCell align="right" className="tabular-nums text-muted">
                {formatBytes(file.size)}
              </TableCell>
              <TableCell align="right">
                <div className="flex flex-col items-end">
                  <span className="tabular-nums">{formatRelative(file.createdAt)}</span>
                  <span className="text-[13px] leading-[18px] text-subtle tabular-nums">
                    {formatDate(file.createdAt)}
                  </span>
                </div>
              </TableCell>
              <TableCell align="right">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Download ${file.originalName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload?.(file);
                    }}
                    className="flex h-7.5 w-7.5 items-center justify-center rounded-md text-muted transition-colors hover:bg-accent-subtle hover:text-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2"
                  >
                    <Download className="h-[15px] w-[15px]" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${file.originalName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(file);
                    }}
                    className="flex h-7.5 w-7.5 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger-subtle hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2"
                  >
                    <Trash2 className="h-[15px] w-[15px]" strokeWidth={1.5} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
