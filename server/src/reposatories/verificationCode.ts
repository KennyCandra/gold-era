import { prisma } from "../lib/prisma";
import { Prisma, VerificationType } from "../generated/prisma/client";

type Client = Prisma.TransactionClient | typeof prisma;

export class VerificationCodeRepository {
  static create(
    data: { userId: string; code: string; type: VerificationType; expiresAt: Date },
    client: Client = prisma
  ) {
    return client.verificationCode.create({ data });
  }

  static findLatest(userId: string, type: VerificationType, client: Client = prisma) {
    return client.verificationCode.findFirst({
      where: { userId, type },
      orderBy: { createdAt: "desc" },
    });
  }

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
