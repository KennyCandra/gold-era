"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud } from "lucide-react";

import { ACCEPTED_MIME_TYPES, MAX_FILES_PER_UPLOAD, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { cn, formatBytes } from "@/lib/utils";

export interface DropZoneProps {
  onFiles: (files: File[]) => void;
  className?: string;
}

const ACCEPT_MAP = ACCEPTED_MIME_TYPES.reduce<Record<string, string[]>>((acc, mime) => {
  acc[mime] = [];
  return acc;
}, {});

export function DropZone({ onFiles, className }: DropZoneProps) {
  const [dragCount, setDragCount] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      const rejectedFiles = rejections.map((r) => r.file);
      onFiles([...acceptedFiles, ...rejectedFiles]);
      setDragCount(0);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT_MAP,
    multiple: true,
    onDragEnter: (event) => setDragCount(event.dataTransfer?.items?.length ?? 0),
    onDragLeave: () => setDragCount(0),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-[240px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 text-center transition-colors",
        isDragActive
          ? "border-accent-border bg-accent-subtle"
          : "border-border-strong bg-surface hover:bg-bg",
        className,
      )}
    >
      <input {...getInputProps()} aria-label="File upload" />
      <UploadCloud
        className={cn("h-8 w-8", isDragActive ? "text-accent-text" : "text-subtle")}
        strokeWidth={1.6}
        aria-hidden="true"
      />
      {isDragActive ? (
        <>
          <span className="text-lg font-semibold leading-7 text-accent-text">
            {dragCount > 0 ? `Drop to upload ${dragCount} file${dragCount === 1 ? "" : "s"}` : "Drop to upload"}
          </span>
          <span className="text-[13px] leading-[18px] text-accent-text/80">
            Release anywhere in this area
          </span>
        </>
      ) : (
        <>
          <span className="text-lg font-semibold leading-7">Drag &amp; drop files here</span>
          <span className="text-[13px] leading-[18px] text-muted">or click to browse</span>
          <span className="max-w-[380px] text-[13px] leading-[18px] text-subtle">
            Max {MAX_FILES_PER_UPLOAD} files · {formatBytes(MAX_FILE_SIZE_BYTES)} each · Images,
            PDFs, documents, spreadsheets, text, CSV, JSON, ZIP
          </span>
        </>
      )}
    </div>
  );
}
