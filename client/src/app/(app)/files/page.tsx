"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { Button, EmptyState, ErrorState, Pagination } from "@/components/ui";
import { DeleteFileModal } from "@/components/files/DeleteFileModal";
import { FileGrid } from "@/components/files/FileGrid";
import { FileTable } from "@/components/files/FileTable";
import {
  FilesToolbar,
  SORT_OPTIONS,
  TYPE_OPTIONS,
} from "@/components/files/FilesToolbar";
import { downloadFile, useDeleteFile, useFiles } from "@/hooks/useFiles";
import { GROUP_TO_MIMES } from "@/lib/utils";
import type { ApiError, FileItem, SortOrder } from "@/lib/types";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function sortFromValue(value: string): { sortBy: string; sortOrder: SortOrder } {
  const match = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]!;
  return { sortBy: match.sortBy, sortOrder: match.sortOrder };
}

function FilesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const view = (searchParams.get("view") === "grid" ? "grid" : "list") as "list" | "grid";

  const [queryInput, setQueryInput] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(queryInput, DEBOUNCE_MS);

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "" || val === "all" || (key === "page" && val === 1)) {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      router.push(`/files${next.toString() ? `?${next.toString()}` : ""}`);
    },
    [router, searchParams],
  );

  // Keep the local search box in sync with the URL (e.g. after "Clear filters"
  // or browser back/forward). Adjusting state during render is React's
  // documented pattern for this and avoids a cascading effect render.
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setQueryInput(urlQuery);
  }

  // Push debounced search text into the URL.
  useEffect(() => {
    if (debouncedQuery !== urlQuery) {
      updateParams({ q: debouncedQuery, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const { sortBy, sortOrder } = sortFromValue(sort);

  const typeLabel = TYPE_OPTIONS.find((o) => o.value === type)?.label;
  const mimeType =
    type !== "all" && typeLabel ? GROUP_TO_MIMES[typeLabel]?.join(",") : undefined;

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useFiles({
    page,
    limit: PAGE_SIZE,
    search: urlQuery || undefined,
    sortBy,
    sortOrder,
    mimeType,
  });

  const paramKey = `${page}-${sort}-${type}-${urlQuery}`;
  const [settledKey, setSettledKey] = useState(paramKey);
  if (!isPlaceholderData && paramKey !== settledKey) {
    setSettledKey(paramKey);
  }

  const deleteMutation = useDeleteFile();
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

  const hasAnyFiles = (data?.total ?? 0) > 0;
  const hasActiveFilters = !!urlQuery || type !== "all";
  const showEmpty = !hasAnyFiles && !isLoading && !hasActiveFilters;
  const showEmptySearch = !hasAnyFiles && !isLoading && hasActiveFilters;

  const handleSort = (field: string) => {
    const match = SORT_OPTIONS.find((o) => o.sortBy === field);
    if (!match) return;
    const isSameField = sortBy === field;
    const next = isSameField
      ? SORT_OPTIONS.find((o) => o.sortBy === field && o.sortOrder !== sortOrder) ?? match
      : match;
    updateParams({ sort: next.value, page: 1 });
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    const name = fileToDelete.originalName;
    try {
      await deleteMutation.mutateAsync(fileToDelete.id);
      toast.success(`"${name}" deleted`);
      setFileToDelete(null);
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || "Failed to delete file");
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      await downloadFile(file);
    } catch {
      toast.error("Failed to download file");
    }
  };

  const clearFilters = () => {
    router.push("/files");
  };

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <ErrorState message="Couldn't load your files." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Header />

      <FilesToolbar
        query={queryInput}
        onQueryChange={setQueryInput}
        type={type}
        onTypeChange={(v) => updateParams({ type: v, page: 1 })}
        sort={sort}
        onSortChange={(v) => updateParams({ sort: v, page: 1 })}
        view={view}
        onViewChange={(v) => updateParams({ view: v === "list" ? null : v })}
      />

      {showEmpty && (
        <EmptyState
          heading="No files yet"
          message="Upload your first file to get started"
          action={
            <Button onClick={() => router.push("/upload")}>Upload</Button>
          }
        />
      )}

      {showEmptySearch && (
        <EmptyState
          heading="No files match your search"
          message="Try a different term or widen the filters"
          action={
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {(isLoading || (data && !showEmpty && !showEmptySearch)) && (
        <>
          {view === "grid" ? (
            <FileGrid
              files={data?.data ?? []}
              swapKey={settledKey}
              isLoading={isLoading}
              onDelete={setFileToDelete}
              onDownload={handleDownload}
              className={isFetching && !isLoading ? "opacity-60" : undefined}
            />
          ) : (
            <FileTable
              files={data?.data ?? []}
              swapKey={settledKey}
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onDelete={setFileToDelete}
              onDownload={handleDownload}
              className={isFetching && !isLoading ? "opacity-60" : undefined}
            />
          )}
          {data && data.total > 0 && (
            <Pagination
              page={data.page}
              pageCount={data.totalPages}
              totalItems={data.total}
              pageSize={data.limit}
              onPageChange={(p) => updateParams({ page: p })}
            />
          )}
        </>
      )}

      <DeleteFileModal
        file={fileToDelete}
        open={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold leading-9 tracking-[-0.02em]">My Files</h1>
      <Link href="/upload">
        <Button>Upload</Button>
      </Link>
    </div>
  );
}

export default function FilesPage() {
  return (
    <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
      <FilesPageContent />
    </Suspense>
  );
}
