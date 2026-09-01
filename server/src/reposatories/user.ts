import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { Role } from "../generated/prisma/enums";

export type UserSortBy = "createdAt" | "name" | "email" | "role";

export type UserListParams = {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  sortBy: UserSortBy;
  sortOrder: "asc" | "desc";
};

const listSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  verified: true,
  createdAt: true,
  _count: { select: { files: { where: { deletedAt: null } } } },
} satisfies Prisma.UserSelect;

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

  static updateRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  static delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  static countAdmins() {
    return prisma.user.count({ where: { role: Role.ADMIN } });
  }

  static counts() {
    return Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { verified: true } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);
  }

  static findAll(params: UserListParams) {
    const { page, limit, search, role, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: listSelect,
      }),
      prisma.user.count({ where }),
    ]);
  }
}

export default UserRepository;
