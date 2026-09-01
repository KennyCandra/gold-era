import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const MAX_CONTENT_LENGTH = 50_000;

const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
]);

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const normalize = (text: string): string | null => {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, MAX_CONTENT_LENGTH);
};


export const extractContent = async (
  buffer: Buffer,
  mimeType: string
): Promise<string | null> => {
  const type = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";

  try {
    if (TEXT_MIME_TYPES.has(type) || type.startsWith("text/")) {
      return normalize(buffer.toString("utf8"));
    }

    if (type === "application/pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });

      try {
        const { text } = await parser.getText({ pageJoiner: "\n" });
        return normalize(text);
      } finally {
        await parser.destroy();
      }
    }

    if (type === DOCX_MIME_TYPE) {
      const { value } = await mammoth.extractRawText({ buffer });
      return normalize(value);
    }

    return null;
  } catch {
    return null;
  }
};
