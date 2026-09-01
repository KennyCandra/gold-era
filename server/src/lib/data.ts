import { User } from "@/generated/prisma/client";

export const userWithoutPassword = (user : User) => {
    const {password , createdAt , updatedAt , ...rest} = user;
    return rest;
}