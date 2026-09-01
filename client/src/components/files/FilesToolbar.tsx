"use client";

import { LayoutGrid, List } from "lucide-react";

import { SearchInput, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SortOrder } from "@/lib/types";

export const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "pdf", label: "PDFs" },
  { value: "image", label: "Images" },
  { value: "spreadsheet", label: "Spreadsheets" },
  { value: "document", label: "Documents" },
  { value: "text", label: "Text" },
  { value: "archive", label: "Archives" },
];

export const SORT_OPTIONS: { value: string; label: string; sortBy: string; sortOrder: SortOrder }[] = [
  { value: "newest", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { value: "oldest", label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" },
  { value: "name-asc", label: "Name (A–Z)", sortBy: "originalName", sortOrder: "asc" },
  { value: "name-desc", label: "Name (Z–A)", sortBy: "originalName", sortOrder: "desc" },
  { value: "size-desc", label: "Largest first", sortBy: "size", sortOrder: "desc" },
  { value: "size-asc", label: "Smallest first", sortBy: "size", sortOrder: "asc" },
];

export interface FilesToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
}

export function FilesToolbar({
  query,
  onQueryChange,
  type,
  onTypeChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: FilesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="Search files…"
        wrapperClassName="max-w-[320px] flex-1"
      />
      <Select
        options={TYPE_OPTIONS}
        value={type}
        onChange={onTypeChange}
        className="w-full sm:w-[160px]"
        aria-label="Filter by type"
      />
      <Select
        options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
        value={sort}
        onChange={onSortChange}
        className="w-full sm:w-[170px]"
        aria-label="Sort files"
      />
      <div className="flex gap-0.5 rounded-lg border border-border bg-bg p-[3px] sm:ml-auto">
        <button
          type="button"
          aria-label="List view"
          aria-pressed={view === "list"}
          onClick={() => onViewChange("list")}
          className={cn(
            "flex h-7 w-7.5 items-center justify-center rounded-md",
            view === "list" ? "bg-surface text-text" : "text-muted",
          )}
        >
          <List className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          onClick={() => onViewChange("grid")}
          className={cn(
            "flex h-7 w-7.5 items-center justify-center rounded-md",
            view === "grid" ? "bg-surface text-text" : "text-muted",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
