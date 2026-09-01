import jwt from "jsonwebtoken";
import { env } from "@/config";

const ACCESS_SECRET = env.jwtSecret;
const REFRESH_SECRET = env.jwtRefreshSecret;

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export type TokenPayload = {
  userId: string;
};

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
};

export const generateTokens = (payload: TokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const payload = jwt.verify(token, ACCESS_SECRET) as TokenPayload;

  return { userId: payload.userId };
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const payload = jwt.verify(token, REFRESH_SECRET) as TokenPayload;

  return { userId: payload.userId };
};
