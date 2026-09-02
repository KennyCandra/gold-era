"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { motion, useReducedMotion } from "framer-motion";
import { UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui";
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";
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
  const reduceMotion = useReducedMotion();

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
        "cursor-pointer rounded-xl border-2 border-dashed transition-colors",
        isDragActive
          ? "border-accent-border bg-accent-subtle"
          : "border-border-strong bg-surface hover:bg-bg",
        className,
      )}
    >
      <input {...getInputProps()} aria-label="File upload" />
      <motion.div
        animate={reduceMotion ? undefined : { scale: isDragActive ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className="flex h-60 flex-col items-center justify-center gap-2 px-6 text-center"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : isDragActive
                ? { y: [0, -6, 0], transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" } }
                : { y: 0, transition: { type: "spring", stiffness: 420, damping: 26 } }
          }
        >
          <UploadCloud
            className={cn("h-8 w-8", isDragActive ? "text-accent-text" : "text-subtle")}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </motion.div>
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
            <span className="text-[13px] leading-[18px] text-subtle">
              Up to {formatBytes(MAX_FILE_SIZE_BYTES)} per file
            </span>
            <div className="mt-1 flex max-w-[440px] flex-wrap items-center justify-center gap-1">
              {ACCEPTED_FILE_TYPES.map((type) => (
                <Badge key={type.label} tone="neutral">
                  {type.extensions.length > 1
                    ? `${type.label} (${type.extensions.join(", ")})`
                    : type.label}
                </Badge>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
