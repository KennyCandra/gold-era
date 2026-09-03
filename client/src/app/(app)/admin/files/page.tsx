"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { AdminRoute } from "@/components/auth/AdminRoute";
import { FileTable } from "@/components/files/FileTable";
import { useAdminFiles, useDeleteAdminFile, useUsers } from "@/hooks/useAdmin";
import { downloadFile } from "@/hooks/useFiles";
import { EmptyState, ErrorState, Modal, Button, Pagination, Select, SearchInput } from "@/components/ui";
import { FILE_TYPE_GROUPS } from "@/lib/constants";
import type { FileItem, SortOrder } from "@/lib/types";
import { GROUP_TO_MIMES } from "@/lib/utils";

const PAGE_SIZE = 10;

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  ...FILE_TYPE_GROUPS.map((group) => ({ value: group, label: group })),
];

function AdminFilesContent() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const mimeType =
    typeFilter !== "all" ? GROUP_TO_MIMES[typeFilter]?.join(",") : undefined;

  const filesQuery = useAdminFiles({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy,
    sortOrder,
    mimeType,
    userId: ownerFilter !== "all" ? ownerFilter : undefined,
  });

  const deleteFile = useDeleteAdminFile();

  const usersQuery = useUsers({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" });

  const ownerOptions = useMemo(() => {
    const users = usersQuery.data?.data ?? [];
    return [
      { value: "all", label: "All owners" },
      ...users.map((u) => ({ value: u.id, label: u.name })),
    ];
  }, [usersQuery.data]);

  const files = filesQuery.data?.data ?? [];

  const paramKey = `${page}-${sortBy}-${sortOrder}-${typeFilter}-${ownerFilter}-${search}`;
  const [settledKey, setSettledKey] = useState(paramKey);
  if (!filesQuery.isPlaceholderData && paramKey !== settledKey) {
    setSettledKey(paramKey);
  }

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleDeleteConfirm = () => {
    if (!fileToDelete) return;
    deleteFile.mutate(fileToDelete.id, {
      onSuccess: () => {
        toast.success(`${fileToDelete.originalName} was deleted`);
        setFileToDelete(null);
      },
      onError: (error: unknown) => {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message?: string }).message)
            : "Failed to delete file";
        toast.error(message);
      },
    });
  };

  const handleDownload = (file: FileItem) => {
    downloadFile(file).catch(() => toast.error("Failed to download file"));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search all files…"
          wrapperClassName="max-w-[280px]"
        />
        <Select
          options={ownerOptions}
          value={ownerFilter}
          onChange={setOwnerFilter}
          aria-label="Filter by owner"
          className="w-45"
        />
        <Select
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
          aria-label="Filter by type"
          className="w-40"
        />
      </div>

      {filesQuery.isLoading ? (
        <FileTable files={[]} isLoading showOwner />
      ) : filesQuery.isError ? (
        <ErrorState
          message="We couldn't load the files list."
          onRetry={() => filesQuery.refetch()}
        />
      ) : !filesQuery.data || filesQuery.data.data.length === 0 ? (
        <EmptyState
          heading="No files found"
          message={search ? "Try a different search." : "No files have been uploaded yet."}
        />
      ) : files.length === 0 ? (
        <EmptyState heading="No matching files" message="Try adjusting your filters." />
      ) : (
        <>
          <FileTable
            files={files}
            swapKey={settledKey}
            showOwner
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onDelete={setFileToDelete}
            onDownload={handleDownload}
          />
          <Pagination
            page={page}
            pageCount={filesQuery.data.totalPages}
            totalItems={filesQuery.data.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        open={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        title="Delete file?"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setFileToDelete(null)}
              disabled={deleteFile.isPending}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleteFile.isPending}>
              Delete file
            </Button>
          </>
        }
      >
        This will permanently delete {fileToDelete?.originalName}. This action cannot be undone.
      </Modal>
    </div>
  );
}

export default function AdminFilesPage() {
  return (
    <AdminRoute>
      <AdminFilesContent />
    </AdminRoute>
  );
}
