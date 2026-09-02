export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface AcceptedFileType {
  label: string;
  extensions: string[];
  mimes: string[];
}

export const ACCEPTED_FILE_TYPES: AcceptedFileType[] = [
  {
    label: "Images",
    extensions: ["JPG", "PNG", "GIF", "WEBP", "SVG"],
    mimes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  },
  { label: "PDF", extensions: ["PDF"], mimes: ["application/pdf"] },
  {
    label: "Word",
    extensions: ["DOC", "DOCX"],
    mimes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  {
    label: "Excel",
    extensions: ["XLS", "XLSX"],
    mimes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  { label: "CSV", extensions: ["CSV"], mimes: ["text/csv"] },
  { label: "Text", extensions: ["TXT", "MD"], mimes: ["text/plain", "text/markdown"] },
  { label: "JSON", extensions: ["JSON"], mimes: ["application/json"] },
  {
    label: "ZIP",
    extensions: ["ZIP"],
    mimes: ["application/zip", "application/x-zip-compressed"],
  },
];

export const ACCEPTED_MIME_TYPES: string[] = ACCEPTED_FILE_TYPES.flatMap((t) => t.mimes);

/**
 * Lowercase extensions, for the browsers that report an empty MIME type.
 * `jpeg` is an alias of `jpg`, which the chip list does not spell out.
 */
export const ACCEPTED_EXTENSIONS: string[] = [
  ...new Set([
    ...ACCEPTED_FILE_TYPES.flatMap((t) => t.extensions.map((e) => e.toLowerCase())),
    "jpeg",
  ]),
];

/** Brief phrasing of the allowed groups, for error messages. */
export const ACCEPTED_TYPES_SUMMARY = "images, PDF, Word, Excel, CSV, text, JSON, ZIP";

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
