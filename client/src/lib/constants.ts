export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_UPLOAD = 10;

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "application/json",
  "application/zip",
  "application/x-zip-compressed",
] as const;

export type FileTypeGroup =
  | "Documents"
  | "Images"
  | "Spreadsheets"
  | "PDFs"
  | "Text"
  | "Archives"
  | "Other";

export const FILE_TYPE_GROUPS: FileTypeGroup[] = [
  "PDFs",
  "Images",
  "Spreadsheets",
  "Documents",
  "Text",
  "Archives",
  "Other",
];

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Date uploaded" },
  { value: "originalName", label: "Name" },
  { value: "size", label: "Size" },
] as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const DEFAULT_PAGE_SIZE = 10;
