import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError";
import { toAppError as toPrismaAppError } from "../lib/prismaError";
import { toAppError as toJwtAppError } from "../lib/jwtError";
import { toAppError as toMulterAppError } from "../lib/multerError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error =
    err instanceof AppError
      ? err
      : toPrismaAppError(err) ?? toJwtAppError(err) ?? toMulterAppError(err);

  if (error) {
    if (!(err instanceof AppError)) console.error(err);

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
