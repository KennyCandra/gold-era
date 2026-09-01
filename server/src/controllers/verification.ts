import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import UserRepository from "@/reposatories/user";
import VerificationCodeRepository from "@/reposatories/verificationCode";
import { AppError } from "@/lib/AppError";
import { generateTokens } from "@/lib/jwt";
import { userWithoutPassword } from "@/lib/data";
import { generateCode, hashCode, compareCode, codeExpiry } from "@/lib/otp";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { VerificationType } from "@/generated/prisma/client";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const issueCode = async (userId: string, type: VerificationType) => {
  const code = generateCode();

  await VerificationCodeRepository.create({
    userId,
    type,
    code: await hashCode(code),
    expiresAt: codeExpiry(),
  });

  return code;
};

const consumeCode = async (userId: string, type: VerificationType, code: string) => {
  const record = await VerificationCodeRepository.findLatest(userId, type);

  if (!record) {
    throw new AppError(401, "Invalid or expired code");
  }

  if (record.expiresAt < new Date()) {
    throw new AppError(410, "Code has expired");
  }

  if (!(await compareCode(code, record.code))) {
    throw new AppError(401, "Invalid or expired code");
  }
};

class verificationController {
  static async verifyEmail(email: string, code: string) {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new AppError(401, "Invalid or expired code");
    }

    if (user.verified) {
      throw new AppError(409, "Email is already verified");
    }

    await consumeCode(user.id, VerificationType.EMAIL_VERIFICATION, code);

    const verifiedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { verified: true },
      });

      await VerificationCodeRepository.deleteAllForUser(
        user.id,
        VerificationType.EMAIL_VERIFICATION,
        tx
      );

      return updated;
    });

    const tokens = generateTokens({ userId: verifiedUser.id });

    return { user: userWithoutPassword(verifiedUser), ...tokens };
  }

  static async resendCode(email: string) {
    const message = "If that email is registered and unverified, a code has been sent";
    const user = await UserRepository.findByEmail(email);

    if (!user || user.verified) {
      return { message };
    }

    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const recent = await VerificationCodeRepository.countSince(
      user.id,
      VerificationType.EMAIL_VERIFICATION,
      since
    );

    if (recent >= RATE_LIMIT) {
      return { message };
    }

    const code = await issueCode(user.id, VerificationType.EMAIL_VERIFICATION);
    await sendVerificationEmail(user.email, code);

    return { message };
  }

  static async forgotPassword(email: string) {
    const message = "If that email is registered, a reset code has been sent";
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return { message };
    }

    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const recent = await VerificationCodeRepository.countSince(
      user.id,
      VerificationType.PASSWORD_RESET,
      since
    );

    if (recent >= RATE_LIMIT) {
      return { message };
    }

    const code = await issueCode(user.id, VerificationType.PASSWORD_RESET);
    await sendPasswordResetEmail(user.email, code);

    return { message };
  }

  static async resetPassword(email: string, code: string, password: string) {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new AppError(401, "Invalid or expired code");
    }

    await consumeCode(user.id, VerificationType.PASSWORD_RESET, code);

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, verified: true },
      });

      await VerificationCodeRepository.deleteAllForUser(
        user.id,
        VerificationType.PASSWORD_RESET,
        tx
      );
    });

    return { message: "Password updated" };
  }
}

export default verificationController;
