import { AppError } from "./AppError";

type BodyParserError = Error & { type?: string };

export const toAppError = (err: unknown): AppError | null => {
  if (!(err instanceof Error)) {
    return null;
  }

  switch ((err as BodyParserError).type) {
    case "entity.parse.failed":
      return new AppError(400, "Malformed JSON body");
    case "entity.too.large":
      return new AppError(413, "Request body is too large");
    case "encoding.unsupported":
      return new AppError(415, "Unsupported content encoding");
    case "request.aborted":
      return new AppError(400, "Request aborted");
    default:
      return null;
  }
};
