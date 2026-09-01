"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { AdminRoute } from "@/components/auth/AdminRoute";
import { FileTable } from "@/components/files/FileTable";
import { useAdminFiles, useDeleteAdminFile } from "@/hooks/useAdmin";
import { downloadFile } from "@/hooks/useFiles";
import { EmptyState, ErrorState, Modal, Button, Pagination, Select, SearchInput } from "@/components/ui";
import { FILE_TYPE_GROUPS } from "@/lib/constants";
import type { FileItem, SortOrder } from "@/lib/types";
import { getFileKind } from "@/lib/utils";

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

  // NOTE: the documented API (GET /files/all: page, limit, search, sortBy,
  // sortOrder) has no server-side type/owner filter params, so those two
  // filters are applied client-side over the current page's results. Owner
  // options are likewise derived from the current page rather than a global
  // owner list, since no such endpoint exists.
  const filesQuery = useAdminFiles({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  const deleteFile = useDeleteAdminFile();

  const allFiles = useMemo(() => filesQuery.data?.data ?? [], [filesQuery.data]);

  const ownerOptions = useMemo(() => {
    const seen = new Map<string, string>();
    allFiles.forEach((f) => {
      if (f.owner) seen.set(f.owner.id, f.owner.name);
    });
    return [
      { value: "all", label: "All owners" },
      ...[...seen.entries()].map(([id, name]) => ({ value: id, label: name })),
    ];
  }, [allFiles]);

  const files = useMemo(() => {
    return allFiles.filter((f) => {
      if (typeFilter !== "all" && getFileKind(f.mimeType).group !== typeFilter) return false;
      if (ownerFilter !== "all" && f.ownerId !== ownerFilter) return false;
      return true;
    });
  }, [allFiles, typeFilter, ownerFilter]);

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
          className="w-[180px]"
        />
        <Select
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
          aria-label="Filter by type"
          className="w-[160px]"
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
