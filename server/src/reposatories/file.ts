import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";

type Client = Prisma.TransactionClient | typeof prisma;

export type FileListParams = {
  userId?: string;
  page: number;
  limit: number;
  search?: string;
  mimeType?: string;
  sortBy: "createdAt" | "size" | "originalName";
  sortOrder: "asc" | "desc";
};

export class FileRepository {
  static createMany(
    data: Prisma.FileCreateManyInput[],
    client: Client = prisma
  ) {
    return client.file.createMany({ data });
  }

  static findByKeys(keys: string[], client: Client = prisma) {
    return client.file.findMany({ where: { key: { in: keys } } });
  }

  static findById(id: string, userId?: string, client: Client = prisma) {
    return client.file.findFirst({
      where: { id, deletedAt: null, ...(userId ? { userId } : {}) },
    });
  }

  static findAll(params: FileListParams, client: Client = prisma) {
    const { userId, page, limit, search, mimeType, sortBy, sortOrder } = params;

    const where: Prisma.FileWhereInput = {
      deletedAt: null,
      ...(userId ? { userId } : {}),
      ...(mimeType ? { mimeType } : {}),
      ...(search
        ? { originalName: { contains: search, mode: "insensitive" } }
        : {}),
    };

    return Promise.all([
      client.file.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true, originalName: true, mimeType: true, size: true,
          createdAt: true, userId: true,
        },
      }),
      client.file.count({ where }),
    ]);
  }

  static softDelete(id: string, userId?: string, client: Client = prisma) {
    return client.file.updateMany({
      where: { id, deletedAt: null, ...(userId ? { userId } : {}) },
      data: { deletedAt: new Date() },
    });
  }

  static softDeleteAllForUser(userId: string, client: Client = prisma) {
    return client.file.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  static deleteByKeys(keys: string[], client: Client = prisma) {
    return client.file.deleteMany({ where: { key: { in: keys } } });
  }

  static stats(userId?: string, client: Client = prisma) {
    const where: Prisma.FileWhereInput = {
      deletedAt: null,
      ...(userId ? { userId } : {}),
    };

    return Promise.all([
      client.file.count({ where }),
      client.file.aggregate({ where, _sum: { size: true } }),
      client.file.groupBy({
        by: ["mimeType"],
        where,
        _count: { _all: true },
        _sum: { size: true },
      }),
    ]);
  }
}

export default FileRepository;
