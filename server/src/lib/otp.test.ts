import crypto from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import { codeExpiry, compareCode, generateCode, hashCode } from "./otp";

describe("otp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("generates a six digit code", () => {
    expect(generateCode()).toMatch(/^\d{6}$/);
  });

  it("pads a small random draw with leading zeros", () => {
    vi.spyOn(crypto, "randomInt").mockImplementation(
      (() => 7) as unknown as typeof crypto.randomInt
    );

    expect(generateCode()).toBe("000007");
  });

  it("round-trips a code through hash and compare", async () => {
    const code = "123456";
    const hash = await hashCode(code);

    expect(hash).not.toBe(code);
    await expect(compareCode(code, hash)).resolves.toBe(true);
  });

  it("rejects a code that does not match the hash", async () => {
    const hash = await hashCode("123456");

    await expect(compareCode("654321", hash)).resolves.toBe(false);
  });

  it("expires a code ten minutes after it is issued", () => {
    const now = new Date("2025-01-01T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    expect(codeExpiry().toISOString()).toBe("2025-01-01T00:10:00.000Z");
  });
});
