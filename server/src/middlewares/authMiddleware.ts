import { AppError } from "@/lib/AppError";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";
import UserRepository from "@/reposatories/user";
import { Role } from "@/generated/prisma/enums";
import type { Request, Response, NextFunction } from "express";

const loadUser = async (userId: string | undefined) => {
  if (!userId) {
    throw new AppError(401, "Not Authorized");
  }

  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new AppError(401, "Not Authorized");
  }

  return { id: user.id, role: user.role, verified: user.verified };
};

export async function authMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  const [scheme, accessToken] = (request.headers.authorization ?? "").split(" ");

  if (scheme !== "Bearer" || !accessToken) {
    throw new AppError(401, "Not Authorized");
  }

  const { userId } = verifyAccessToken(accessToken);

  request.user = await loadUser(userId);

  next();
}

export async function refreshTokenMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(401, "Not Authorized");
  }

  const { userId } = verifyRefreshToken(refreshToken);

  req.user = await loadUser(userId);

  next();
}

export function requireVerified(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) {
    throw new AppError(401, "Not Authorized");
  }

  if (!req.user.verified) {
    throw new AppError(403, "Email not verified");
  }

  next();
}

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Not Authorized");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "Forbidden");
    }

    next();
  };

export const requireAdmin = authorize(Role.ADMIN);
