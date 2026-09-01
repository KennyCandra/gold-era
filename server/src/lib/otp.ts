import crypto from "crypto";
import bcrypt from "bcryptjs";

const OTP_ROUNDS = 10;

export const OTP_TTL_MINUTES = 10;

export const generateCode = (): string =>
  String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

export const hashCode = (code: string) => bcrypt.hash(code, OTP_ROUNDS);

export const compareCode = (code: string, hash: string) =>
  bcrypt.compare(code, hash);

export const codeExpiry = (): Date =>
  new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
