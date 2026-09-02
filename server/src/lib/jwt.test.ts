import { describe, expect, it } from "vitest";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt";

// src/test/setup.ts supplies JWT_SECRET / JWT_REFRESH_SECRET before "@/config"
// is imported, so these modules load with distinct signing secrets.

const USER_ID = "user-123";

type DecodedPayload = {
  userId: string;
  iat: number;
  exp: number;
};

const decode = (token: string): DecodedPayload => {
  const [, payload] = token.split(".");

  if (!payload) throw new Error("token has no payload segment");

  return JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8")
  ) as DecodedPayload;
};

describe("jwt", () => {
  it("round-trips a user id through an access token", () => {
    const token = generateAccessToken({ userId: USER_ID });

    expect(verifyAccessToken(token)).toEqual({ userId: USER_ID });
  });

  it("round-trips a user id through a refresh token", () => {
    const token = generateRefreshToken({ userId: USER_ID });

    expect(verifyRefreshToken(token)).toEqual({ userId: USER_ID });
  });

  it("refuses a refresh token where an access token is expected", () => {
    const refreshToken = generateRefreshToken({ userId: USER_ID });

    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });

  it("refuses an access token where a refresh token is expected", () => {
    const accessToken = generateAccessToken({ userId: USER_ID });

    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });

  it("refuses a tampered token", () => {
    const token = generateAccessToken({ userId: USER_ID });
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it("puts only the user id in the access token and expires it in 15 minutes", () => {
    const decoded = decode(generateAccessToken({ userId: USER_ID }));

    expect(Object.keys(decoded).sort()).toEqual(["exp", "iat", "userId"]);
    expect(decoded.exp - decoded.iat).toBe(15 * 60);
  });
});
