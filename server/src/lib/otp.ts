import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Codes are short-lived and low-entropy, so they use fewer rounds than
 * passwords — a 6-digit space is brute-forceable offline regardless, which is
 * what the 10 minute expiry is for.
 */
const OTP_ROUNDS = 10;

export const OTP_TTL_MINUTES = 10;

/** 6-digit code. crypto, not Math.random — the latter is predictable. */
export const generateCode = (): string =>
  String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

export const hashCode = (code: string) => bcrypt.hash(code, OTP_ROUNDS);

export const compareCode = (code: string, hash: string) =>
  bcrypt.compare(code, hash);

export const codeExpiry = (): Date =>
  new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
