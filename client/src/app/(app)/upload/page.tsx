"use client";

import { DropZone } from "@/components/upload/DropZone";
import { UploadQueue } from "@/components/upload/UploadQueue";
import { useUpload } from "@/hooks/useUpload";

export default function UploadPage() {
  const { items, addFiles, retryItem, removeItem } = useUpload();

  return (
    <div className="flex flex-col gap-6">
      <DropZone onFiles={addFiles} />
      <UploadQueue items={items} onRetry={retryItem} onRemove={removeItem} />
    </div>
  );
}
