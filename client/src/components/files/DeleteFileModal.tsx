"use client";

import { Button, Modal } from "@/components/ui";
import type { FileItem } from "@/lib/types";

export interface DeleteFileModalProps {
  file: FileItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteFileModal({ file, open, onClose, onConfirm, loading }: DeleteFileModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete file?"
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </>
      }
    >
      {file
        ? `"${file.originalName}" will be permanently deleted. This action cannot be undone.`
        : "This file will be permanently deleted. This action cannot be undone."}
    </Modal>
  );
}
