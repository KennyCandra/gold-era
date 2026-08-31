import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";

export class UserRepository {
  static findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email },
    });
  }

  static findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  static update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  static findAll(params: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const { page, limit, search, sortBy = "name", sortOrder = "asc" } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);
  }
}


export default UserRepository;