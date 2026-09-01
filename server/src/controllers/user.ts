import { AppError } from "@/lib/AppError";
import { storage } from "@/lib/storage";
import { userWithoutPassword } from "@/lib/data";
import UserRepository, { UserListParams } from "@/reposatories/user";
import FileRepository from "@/reposatories/file";
import { Role } from "@/generated/prisma/enums";

const assertNotLastAdmin = async (targetRole: Role) => {
  if (targetRole !== Role.ADMIN) {
    return;
  }

  const admins = await UserRepository.countAdmins();

  if (admins <= 1) {
    throw new AppError(400, "Cannot remove the last remaining admin");
  }
};

const findOr404 = async (id: string) => {
  const user = await UserRepository.findById(id);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

class userController {
  static async list(params: UserListParams) {
    const [users, total] = await UserRepository.findAll(params);

    return {
      data: users.map(({ _count, ...user }) => ({
        ...user,
        fileCount: _count.files,
      })),
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    };
  }

  static async updateRole(targetId: string, role: Role) {
    const target = await findOr404(targetId);

    if (target.role !== role) {
      await assertNotLastAdmin(target.role);
    }

    const updated = await UserRepository.updateRole(targetId, role);

    return { user: userWithoutPassword(updated) };
  }

  static async remove(actorId: string, targetId: string) {
    if (actorId === targetId) {
      throw new AppError(400, "You cannot delete your own account");
    }

    const target = await findOr404(targetId);

    await assertNotLastAdmin(target.role);

    const files = await FileRepository.findKeysForUser(targetId);

    await Promise.all(files.map(({ key }) => storage.delete(key)));

    await UserRepository.delete(targetId);

    return { message: "User deleted", filesDeleted: files.length };
  }
}

export default userController;
