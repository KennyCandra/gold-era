import * as z from "zod";

const roleSchema = z.enum(["USER", "ADMIN"]);

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).optional(),
    role: roleSchema.optional(),
    sortBy: z.enum(["createdAt", "name", "email", "role"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid user id" }),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid user id" }),
  }),
  body: z.object({
    role: roleSchema,
  }),
});
