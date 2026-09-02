import { describe, expect, it } from "vitest";
import type { ZodType } from "zod";

import {
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyEmailSchema,
} from "./auth";

const messagesFor = (schema: ZodType, value: unknown): string[] => {
  const result = schema.safeParse(value);

  if (result.success) return [];

  return result.error.issues.map((issue) => issue.message);
};

const signUpBody = (password: string) => ({
  body: { name: "Ahmed", email: "ahmed@example.com", password },
});

describe("signUpSchema", () => {
  it("accepts a valid registration body", () => {
    expect(signUpSchema.safeParse(signUpBody("Password1")).success).toBe(true);
  });

  it("rejects a password with no uppercase letter", () => {
    expect(messagesFor(signUpSchema, signUpBody("password1"))).toContain(
      "Password must contain at least one uppercase letter"
    );
  });

  it("rejects a password with no lowercase letter", () => {
    expect(messagesFor(signUpSchema, signUpBody("PASSWORD1"))).toContain(
      "Password must contain at least one lowercase letter"
    );
  });

  it("rejects a password with no digit", () => {
    expect(messagesFor(signUpSchema, signUpBody("Passwords"))).toContain(
      "Password must contain at least one number"
    );
  });

  it("rejects a password under eight characters", () => {
    expect(messagesFor(signUpSchema, signUpBody("Pass1"))).toContain(
      "Password must be at least 8 characters"
    );
  });

  it("accepts a password longer than a hundred characters", () => {
    const long = `A${"a".repeat(120)}1`;

    expect(long.length).toBeGreaterThan(100);
    expect(signUpSchema.safeParse(signUpBody(long)).success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    const result = signUpSchema.safeParse({
      body: { name: "Ahmed", email: "not-an-email", password: "Password1" },
    });

    expect(result.success).toBe(false);
    expect(result.success ? [] : result.error.issues.map((i) => i.path)).toEqual(
      [["body", "email"]]
    );
  });
});

describe("loginSchema", () => {
  // The policy belongs on register and reset only; login must still accept
  // passwords that predate it, such as the seeded admin's.
  it("accepts a password that does not meet the policy", () => {
    const result = loginSchema.safeParse({
      body: { email: "ahmed@example.com", password: "admin" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(
      messagesFor(loginSchema, {
        body: { email: "ahmed@example.com", password: "" },
      })
    ).toContain("Password is required");
  });
});

describe("verifyEmailSchema", () => {
  it("rejects a code that is not six characters", () => {
    expect(
      messagesFor(verifyEmailSchema, {
        body: { email: "ahmed@example.com", code: "12345" },
      })
    ).toContain("Code must be 6 digits");
  });

  it("rejects a code containing non-digits", () => {
    expect(
      messagesFor(verifyEmailSchema, {
        body: { email: "ahmed@example.com", code: "12a456" },
      })
    ).toContain("Code must contain digits only");
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a valid reset body", () => {
    const result = resetPasswordSchema.safeParse({
      body: {
        email: "ahmed@example.com",
        code: "123456",
        password: "NewPassword1",
      },
    });

    expect(result.success).toBe(true);
  });
});
