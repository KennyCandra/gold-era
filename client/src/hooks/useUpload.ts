"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosProgressEvent } from "axios";

import { api } from "@/lib/api";
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  ACCEPTED_TYPES_SUMMARY,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import type { ApiError, FileItem } from "@/lib/types";

export type UploadStatus = "queued" | "uploading" | "success" | "error";

export type UploadQueueItem = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
};

let uidCounter = 0;
function nextId(): string {
  uidCounter += 1;
  return `upload-${Date.now()}-${uidCounter}`;
}

const UNSUPPORTED_TYPE_ERROR = `Unsupported type. Allowed: ${ACCEPTED_TYPES_SUMMARY}`;

function isAcceptedType(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.includes(file.type)) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return !!ext && ACCEPTED_EXTENSIONS.includes(ext);
}

export function useUpload() {
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const itemsRef = useRef<UploadQueueItem[]>([]);
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const processingRef = useRef(false);
  const queryClient = useQueryClient();

  const setItemsSafe = useCallback(
    (updater: (prev: UploadQueueItem[]) => UploadQueueItem[]) => {
      setItems((prev) => {
        const next = updater(prev);
        itemsRef.current = next;
        return next;
      });
    },
    [],
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<UploadQueueItem>) => {
      setItemsSafe((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
    },
    [setItemsSafe],
  );

  const uploadFile = useCallback(
    async (item: UploadQueueItem) => {
      updateItem(item.id, { status: "uploading", progress: 0, error: undefined });

      const controller = new AbortController();
      controllersRef.current.set(item.id, controller);

      const formData = new FormData();
      formData.append("files", item.file);

      try {
        await api.post<{ files: FileItem[] }>("/files/upload", formData, {
          signal: controller.signal,
          onUploadProgress: (evt: AxiosProgressEvent) => {
            const total = evt.total ?? item.file.size;
            const pct = total ? Math.round((evt.loaded / total) * 100) : 0;
            updateItem(item.id, { progress: Math.min(99, pct) });
          },
        });
        updateItem(item.id, { status: "success", progress: 100 });
        toast.success(`${item.file.name} uploaded`);
        queryClient.invalidateQueries({ queryKey: ["stats", "user"] });
        queryClient.invalidateQueries({ queryKey: ["files", "list"] });
      } catch (err) {
        if ((err as { code?: string })?.code === "ERR_CANCELED") {
          return;
        }
        const message = (err as ApiError)?.message ?? "Upload failed";
        updateItem(item.id, { status: "error", error: message });
        toast.error(`${item.file.name} failed to upload`);
      } finally {
        controllersRef.current.delete(item.id);
      }
    },
    [queryClient, updateItem],
  );

  const runQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      for (;;) {
        const next = itemsRef.current.find((it) => it.status === "queued");
        if (!next) break;
        await uploadFile(next);
      }
    } finally {
      processingRef.current = false;
    }
  }, [uploadFile]);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      const newItems: UploadQueueItem[] = [];

      for (const file of files) {
        const id = nextId();

        if (file.size > MAX_FILE_SIZE_BYTES) {
          newItems.push({
            id,
            file,
            status: "error",
            progress: 0,
            error: `File exceeds ${formatBytes(MAX_FILE_SIZE_BYTES)}`,
          });
          continue;
        }

        if (!isAcceptedType(file)) {
          newItems.push({
            id,
            file,
            status: "error",
            progress: 0,
            error: UNSUPPORTED_TYPE_ERROR,
          });
          continue;
        }

        newItems.push({ id, file, status: "queued", progress: 0 });
      }

      setItemsSafe((prev) => [...prev, ...newItems]);
      runQueue();
    },
    [runQueue, setItemsSafe],
  );

  const retryItem = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((it) => it.id === id);
      if (!item) return;

      if (item.file.size > MAX_FILE_SIZE_BYTES) {
        updateItem(id, {
          status: "error",
          error: `File exceeds ${formatBytes(MAX_FILE_SIZE_BYTES)}`,
        });
        return;
      }
      if (!isAcceptedType(item.file)) {
        updateItem(id, { status: "error", error: UNSUPPORTED_TYPE_ERROR });
        return;
      }

      updateItem(id, { status: "queued", progress: 0, error: undefined });
      runQueue();
    },
    [runQueue, updateItem],
  );

  const removeItem = useCallback(
    (id: string) => {
      const controller = controllersRef.current.get(id);
      controller?.abort();
      controllersRef.current.delete(id);
      setItemsSafe((prev) => prev.filter((it) => it.id !== id));
    },
    [setItemsSafe],
  );

  return { items, addFiles, retryItem, removeItem };
}
