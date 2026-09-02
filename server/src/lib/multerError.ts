import multer from "multer";
import { AppError } from "./AppError";

export const toAppError = (err: unknown): AppError | null => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return new AppError(413, "File is too large");
      case "LIMIT_UNEXPECTED_FILE":
        return new AppError(400, "Unexpected field name");
      default:
        return new AppError(400, err.message);
    }
  }

  if (err instanceof Error && err.message.startsWith("Unsupported file type")) {
    return new AppError(400, err.message);
  }

  return null;
};
