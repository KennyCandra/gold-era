"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";

import { Badge, Button, ErrorState, FileTypeIcon, Skeleton } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { DeleteFileModal } from "@/components/files/DeleteFileModal";
import { downloadFile, useDeleteFile, useFile } from "@/hooks/useFiles";
import { api } from "@/lib/api";
import { formatBytes, formatDate, formatRelative, getFileKind } from "@/lib/utils";
import type { ApiError } from "@/lib/types";

function getExt(name: string): string {
  return (name.split(".").pop() || "file").toLowerCase();
}

function fileTypeLabel(mimeType: string, ext: string): string {
  const labels: Record<string, string> = {
    "application/pdf": "PDF document",
    "image/jpeg": "JPEG image",
    "image/png": "PNG image",
    "image/gif": "GIF image",
    "image/webp": "WEBP image",
    "text/csv": "CSV spreadsheet",
    "application/vnd.ms-excel": "Excel spreadsheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel spreadsheet",
    "application/msword": "Word document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word document",
    "text/plain": "Text file",
    "application/json": "JSON file",
    "application/zip": "ZIP archive",
    "application/x-zip-compressed": "ZIP archive",
  };
  return labels[mimeType] ?? `${ext.toUpperCase()} file`;
}

export default function FileDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { data: file, isLoading, isError, refetch } = useFile(id);
  const deleteMutation = useDeleteFile();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!file) return;
    try {
      await downloadFile(file);
    } catch {
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async () => {
    if (!file) return;
    try {
      await deleteMutation.mutateAsync(file.id);
      toast.success(`"${file.originalName}" deleted`);
      router.push("/files");
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || "Failed to delete file");
      setConfirmDelete(false);
    }
  };

  const handleCopy = async () => {
    if (!file?.content) return;
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/files"
        className="inline-flex h-7.5 w-fit items-center rounded-md px-2 text-sm text-muted transition-colors hover:bg-accent-subtle hover:text-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2"
      >
        ← My Files
      </Link>

      {isError && (
        <ErrorState message="Couldn't load this file." onRetry={() => refetch()} />
      )}

      {isLoading && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-5 rounded-xl border border-border bg-surface p-6">
            <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}

      {file && !isLoading && (
        <FileDetailContent
          file={file}
          onDownload={handleDownload}
          onDeleteClick={() => setConfirmDelete(true)}
          onCopy={handleCopy}
          copied={copied}
        />
      )}

      <DeleteFileModal
        file={file ?? null}
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function FileDetailContent({
  file,
  onDownload,
  onDeleteClick,
  onCopy,
  copied,
}: {
  file: NonNullable<ReturnType<typeof useFile>["data"]>;
  onDownload: () => void;
  onDeleteClick: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const ext = getExt(file.originalName);
  const kind = getFileKind(file.mimeType || ext);
  const isImage = file.mimeType.startsWith("image/");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!isImage) return;
    let objectUrl: string | null = null;
    let cancelled = false;

    api
      .get<Blob>(`/files/${file.id}/download`, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        objectUrl = window.URL.createObjectURL(res.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setPreviewError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [isImage, file.id]);

  return (
    <>
      <div className="flex flex-col items-start gap-5 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
        <FileTypeIcon ext={ext} className="h-14 w-14 rounded-xl text-[13px] font-medium [&_svg]:h-6 [&_svg]:w-6" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="break-all text-2xl font-semibold leading-8 tracking-[-0.02em]">
            {file.originalName}
          </span>
          <div className="flex gap-2">
            <Badge tone={kind.colorVar.replace("--", "") as BadgeTone}>{kind.group}</Badge>
            <Badge tone="success">Processed</Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={onDownload}>
            Download
          </Button>
          <Button variant="danger" className="bg-transparent text-danger hover:bg-danger-subtle" onClick={onDeleteClick}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-5 rounded-xl border border-border bg-surface p-6 sm:grid-cols-2">
        <DetailRow label="File type" value={fileTypeLabel(file.mimeType, ext)} />
        <DetailRow label="Size" value={formatBytes(file.size)} mono />
        <DetailRow
          label="Uploaded"
          value={`${formatRelative(file.createdAt)} · ${formatDate(file.createdAt)}`}
          mono
        />
        <DetailRow label="Owner" value={file.user?.name ?? "—"} />
        <DetailRow label="MIME type" value={file.mimeType} code border={false} />
        <DetailRow label="File ID" value={file.id} code border={false} />
      </div>

      {isImage ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold leading-7">Preview</h2>
          <div
            className="flex h-[360px] items-center justify-center rounded-lg border border-border bg-surface"
            style={{
              backgroundImage:
                "linear-gradient(45deg,var(--bg) 25%,transparent 25%),linear-gradient(-45deg,var(--bg) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,var(--bg) 75%),linear-gradient(-45deg,transparent 75%,var(--bg) 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
            }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={file.originalName}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            ) : previewError ? (
              <span className="text-sm text-subtle">Couldn&apos;t load preview</span>
            ) : (
              <Skeleton className="h-[280px] w-[420px] rounded-lg" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-7">Extracted content</h2>
            {file.content && (
              <Button variant="ghost" onClick={onCopy} className="h-8 px-2.5">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" strokeWidth={1.8} /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.8} /> Copy
                  </>
                )}
              </Button>
            )}
          </div>
          {file.content ? (
            <div className="h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-4 font-mono text-[13px] leading-5 text-muted">
              {file.content}
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center rounded-lg border border-border bg-bg p-4">
              <span className="text-sm text-subtle">No text content extracted</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function DetailRow({
  label,
  value,
  mono,
  code,
  border = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
  code?: boolean;
  border?: boolean;
}) {
  return (
    <div
      className={
        border
          ? "flex items-center justify-between gap-4 border-b border-border pb-3"
          : "flex items-center justify-between gap-4"
      }
    >
      <span className="text-sm text-muted">{label}</span>
      <span
        className={
          code
            ? "font-mono text-[13px] text-text"
            : mono
              ? "text-sm font-medium tabular-nums"
              : "text-sm font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
