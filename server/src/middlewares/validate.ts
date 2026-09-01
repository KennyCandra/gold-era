import { Request , Response , NextFunction } from "express";
import * as z from "zod";

export const validate = (schema : z.ZodType<any , any ,any>) => (req : Request, res : Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json(errors)
}

  res.locals.validated = result.data;

  next();
};

