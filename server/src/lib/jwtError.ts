import jwt from "jsonwebtoken";
import { AppError } from "./AppError";

export const toAppError = (err: unknown): AppError | null => {
  if (err instanceof jwt.TokenExpiredError) {
    return new AppError(401, "Token expired");
  }

  if (err instanceof jwt.NotBeforeError) {
    return new AppError(401, "Token not active yet");
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return new AppError(401, "Invalid token");
  }

  return null;
};
