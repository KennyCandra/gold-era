import * as z from "zod";

export const listFilesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).optional(),
    mimeType: z
      .string()
      .trim()
      .min(1)
      .optional()
      .transform((val) =>
        val
          ? val
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v.length > 0)
          : undefined
      ),
    userId: z.uuid().optional(),
    sortBy: z.enum(["createdAt", "size", "originalName"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const fileIdSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid file id" }),
  }),
});
