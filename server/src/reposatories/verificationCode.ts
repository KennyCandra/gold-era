import { prisma } from "../lib/prisma";
import { Prisma, VerificationType } from "../generated/prisma/client";

/**
 * Accepts an optional transaction client so callers can compose these with
 * other writes (e.g. creating a user and its first code atomically).
 */
type Client = Prisma.TransactionClient | typeof prisma;

export class VerificationCodeRepository {
  static create(
    data: { userId: string; code: string; type: VerificationType; expiresAt: Date },
    client: Client = prisma
  ) {
    return client.verificationCode.create({ data });
  }

  /** Newest code wins — older ones are ignored even if unexpired. */
  static findLatest(userId: string, type: VerificationType, client: Client = prisma) {
    return client.verificationCode.findFirst({
      where: { userId, type },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Rows are kept (not deleted on resend) so this count is the rate limit. */
  static countSince(
    userId: string,
    type: VerificationType,
    since: Date,
    client: Client = prisma
  ) {
    return client.verificationCode.count({
      where: { userId, type, createdAt: { gte: since } },
    });
  }

  static deleteAllForUser(
    userId: string,
    type: VerificationType,
    client: Client = prisma
  ) {
    return client.verificationCode.deleteMany({ where: { userId, type } });
  }
}

export default VerificationCodeRepository;
