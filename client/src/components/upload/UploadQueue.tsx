"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import { Button, FileTypeIcon, ProgressBar } from "@/components/ui";
import type { UploadQueueItem } from "@/hooks/useUpload";
import { cn, formatBytes } from "@/lib/utils";

export interface UploadQueueProps {
  items: UploadQueueItem[];
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export function UploadQueue({ items, onRetry, onRemove, className }: UploadQueueProps) {
  if (items.length === 0) return null;

  const completed = items.filter((it) => it.status === "success").length;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface", className)}>
      <div className="flex items-center justify-between p-5">
        <h2 className="text-lg font-semibold leading-7">Upload queue</h2>
        <span className="text-[13px] leading-[18px] text-subtle tabular-nums">
          {completed} of {items.length} complete
        </span>
      </div>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <QueueRow key={item.id} item={item} onRetry={onRetry} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function DrawnCheck() {
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
      <motion.path
        d="M4.5 10.5 L8.5 14.5 L15.5 6.5"
        stroke="var(--success)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </svg>
  );
}

function QueueRow({
  item,
  onRetry,
  onRemove,
}: {
  item: UploadQueueItem;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const ext = item.file.name.split(".").pop() ?? "";

  return (
    <motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <motion.div
        animate={
          item.status === "error" && !reduceMotion
            ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35, ease: "easeInOut" } }
            : { x: 0 }
        }
        className={cn(
          "flex items-center gap-4 border-t border-border px-5 py-3.5",
          item.status === "queued" && "opacity-50",
        )}
      >
        <FileTypeIcon ext={ext} />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {item.status === "uploading" ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm leading-5">{item.file.name}</span>
                <span className="shrink-0 text-[13px] leading-[18px] text-muted tabular-nums">
                  {item.progress}%
                </span>
              </div>
              <ProgressBar value={item.progress} />
            </>
          ) : (
            <>
              <span className="truncate text-sm leading-5">{item.file.name}</span>
              <span
                className={cn(
                  "text-[13px] leading-[18px]",
                  item.status === "success" && "text-success",
                  item.status === "error" && "text-danger",
                  item.status === "queued" && "text-muted",
                )}
              >
                {item.status === "success" && "Upload complete"}
                {item.status === "error" && item.error}
                {item.status === "queued" && "Queued"}
              </span>
            </>
          )}
        </div>

        <span className="w-[70px] shrink-0 text-right text-[13px] leading-[18px] text-muted tabular-nums">
          {formatBytes(item.file.size)}
        </span>

        <div className="flex w-7 shrink-0 items-center justify-end">
          {item.status === "success" && <DrawnCheck />}
          {item.status === "uploading" && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Cancel upload of ${item.file.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-accent-subtle hover:text-accent-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.6} />
            </button>
          )}
        </div>

        {item.status === "error" && (
          <Button variant="ghost" className="h-8 shrink-0 px-2.5 text-sm" onClick={() => onRetry(item.id)}>
            Retry
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
