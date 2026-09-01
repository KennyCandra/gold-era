import {
  Avatar,
  EmptyState,
  FileTypeIcon,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableSkeleton,
} from "@/components/ui";
import type { FileItem } from "@/lib/types";
import { formatBytes, formatRelative } from "@/lib/utils";

function extOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

export interface RecentUploadsTableProps {
  files: FileItem[];
  isLoading?: boolean;
}

export function RecentUploadsTable({ files, isLoading }: RecentUploadsTableProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  if (files.length === 0) {
    return (
      <EmptyState
        heading="No recent uploads"
        message="Files will appear here once users start uploading."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow header>
          <TableCell header>Name</TableCell>
          <TableCell header className="w-[200px]">
            Owner
          </TableCell>
          <TableCell header align="right" className="w-[90px]">
            Size
          </TableCell>
          <TableCell header align="right" className="w-[120px]">
            Uploaded
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((f) => (
          <TableRow key={f.id}>
            <TableCell>
              <div className="flex min-w-0 items-center gap-3">
                <FileTypeIcon ext={extOf(f.originalName)} className="h-7 w-7" />
                <span className="truncate">{f.originalName}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar name={f.user?.name ?? "Unknown"} size="sm" />
                <span className="truncate text-muted">{f.user?.name ?? "Unknown"}</span>
              </div>
            </TableCell>
            <TableCell align="right" className="tabular-nums text-muted">
              {formatBytes(f.size)}
            </TableCell>
            <TableCell align="right" className="tabular-nums text-subtle">
              {formatRelative(f.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
