import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  const formatted = exponent === 0 ? value.toString() : value.toFixed(1);
  return `${formatted} ${units[exponent]}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return formatDate(iso);
}

export type FileKind = {
  label: string;
  group: string;
  colorVar: string;
};

const EXT_TO_KIND: Record<string, FileKind> = {
  pdf: { label: "PDF", group: "PDFs", colorVar: "--c4" },
  jpg: { label: "JPG", group: "Images", colorVar: "--c2" },
  jpeg: { label: "JPG", group: "Images", colorVar: "--c2" },
  png: { label: "PNG", group: "Images", colorVar: "--c2" },
  gif: { label: "GIF", group: "Images", colorVar: "--c2" },
  webp: { label: "WEBP", group: "Images", colorVar: "--c2" },
  xlsx: { label: "XLS", group: "Spreadsheets", colorVar: "--c1" },
  xls: { label: "XLS", group: "Spreadsheets", colorVar: "--c1" },
  csv: { label: "CSV", group: "Spreadsheets", colorVar: "--c1" },
  docx: { label: "DOC", group: "Documents", colorVar: "--c3" },
  doc: { label: "DOC", group: "Documents", colorVar: "--c3" },
  txt: { label: "TXT", group: "Text", colorVar: "--c6" },
  json: { label: "TXT", group: "Text", colorVar: "--c6" },
  zip: { label: "ZIP", group: "Archives", colorVar: "--c5" },
};

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/csv": "csv",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
  "application/json": "json",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
};

const DEFAULT_KIND: FileKind = {
  label: "FILE",
  group: "Other",
  colorVar: "--c6",
};

export const GROUP_TO_MIMES: Record<string, string[]> = {
  Images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  PDFs: ["application/pdf"],
  Spreadsheets: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
  Documents: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  Text: ["text/plain", "application/json"],
  Archives: ["application/zip", "application/x-zip-compressed"],
};

export function getFileKind(mimeOrExt: string): FileKind {
  const input = mimeOrExt.toLowerCase().trim();

  let ext = input;
  if (input.includes("/")) {
    ext = MIME_TO_EXT[input] ?? "";
  } else {
    ext = input.replace(/^\./, "");
  }

  return EXT_TO_KIND[ext] ?? DEFAULT_KIND;
}

export type StatsByTypeRow = { mimeType: string; count: number; size: number };

export type GroupedTypeStat = {
  label: string;
  count: number;
  size: number;
  colorToken: string;
};

export function groupByFileType(rows: StatsByTypeRow[]): GroupedTypeStat[] {
  const byGroup = new Map<string, GroupedTypeStat>();

  for (const row of rows) {
    const kind = getFileKind(row.mimeType);
    const existing = byGroup.get(kind.group);
    if (existing) {
      existing.count += row.count;
      existing.size += row.size;
    } else {
      byGroup.set(kind.group, {
        label: kind.group,
        count: row.count,
        size: row.size,
        colorToken: kind.colorVar,
      });
    }
  }

  return Array.from(byGroup.values()).sort((a, b) => b.count - a.count);
}

export function formatChartDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export type UploadHistoryRow = { day: string; count: number };
export type ChartUploadHistoryPoint = { label: string; count: number };

export function fillUploadHistory(
  rows: UploadHistoryRow[],
  days = 30
): ChartUploadHistoryPoint[] {
  const countsByDay = new Map<string, number>();
  for (const row of rows) {
    const d = new Date(row.day);
    if (Number.isNaN(d.getTime())) continue;
    countsByDay.set(d.toISOString().slice(0, 10), row.count);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const points: ChartUploadHistoryPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    points.push({
      label: formatChartDay(d.toISOString()),
      count: countsByDay.get(key) ?? 0,
    });
  }

  return points;
}
