import { Prisma } from "../generated/prisma/client";
import { AppError } from "./AppError";

const metaFields = (meta: unknown): string[] => {
  if (!meta || typeof meta !== "object") return [];

  const { target, field_name: fieldName } = meta as {
    target?: unknown;
    field_name?: unknown;
  };

  const raw = target ?? fieldName;

  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === "string");
  if (typeof raw === "string") return [raw];
  return [];
};

const listFields = (fields: string[], fallback: string) =>
  fields.length ? fields.join(", ") : fallback;

const mapKnownError = (
  err: Prisma.PrismaClientKnownRequestError
): AppError | null => {
  const fields = metaFields(err.meta);

  switch (err.code) {
    case "P2000":
      return new AppError(400, `Value for ${listFields(fields, "a field")} is too long`);

    case "P2001":
    case "P2015":
    case "P2018":
    case "P2025":
      return new AppError(404, "Record not found");

    case "P2002":
      return new AppError(409, `${listFields(fields, "This value")} already exists`);

    case "P2003":
      return new AppError(400, `Related record for ${listFields(fields, "this field")} does not exist`);

    case "P2004":
      return new AppError(400, "A database constraint failed");

    case "P2011":
      return new AppError(400, `${listFields(fields, "A required field")} cannot be null`);

    case "P2012":
      return new AppError(400, `Missing required value for ${listFields(fields, "a field")}`);

    case "P2014":
      return new AppError(400, "This change would break a required relation between records");

    case "P2016":
    case "P2023":
      return new AppError(400, "Invalid data in query");

    case "P2019":
    case "P2020":
      return new AppError(400, "Invalid input value");

    case "P2024":
      return new AppError(503, "Database is busy, please try again");

    case "P2028":
      return new AppError(500, "Transaction failed");

    case "P2034":
      return new AppError(409, "Conflicting write, please retry");

    default:
      return null;
  }
};

/**
 * Turns any error thrown by Prisma into an AppError.
 * Returns null when the error did not come from Prisma, so callers can keep
 * their own handling for everything else.
 */
export const toAppError = (err: unknown): AppError | null => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return mapKnownError(err) ?? new AppError(500, "Database error");
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new AppError(400, "Invalid data sent to the database");
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(503, "Database unavailable");
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    return new AppError(500, "Database error");
  }

  return null;
};

export const isPrismaError = (err: unknown): boolean => toAppError(err) !== null;
