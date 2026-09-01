import { prisma } from "@/lib/prisma";
import FileRepository from "@/reposatories/file";
import UserRepository from "@/reposatories/user";

type HistoryRow = { day: Date; count: number };

const userHistory = (userId: string) =>
  prisma.$queryRaw<HistoryRow[]>`
    -- count(*) is a bigint, which JSON.stringify throws on outright.
    SELECT date_trunc('day', created_at) AS day, count(*)::int AS count
    FROM files
    WHERE user_id = ${userId}
      AND deleted_at IS NULL
      AND created_at >= (now() at time zone 'utc') - interval '30 days'
    GROUP BY 1
    ORDER BY 1
  `;

const globalHistory = () =>
  prisma.$queryRaw<HistoryRow[]>`
    SELECT date_trunc('day', created_at) AS day, count(*)::int AS count
    FROM files
    WHERE deleted_at IS NULL
      AND created_at >= (now() at time zone 'utc') - interval '30 days'
    GROUP BY 1
    ORDER BY 1
  `;

const toByType = (
  rows: { mimeType: string; _count: { _all: number }; _sum: { size: number | null } }[]
) =>
  rows
    .map((row) => ({
      mimeType: row.mimeType,
      count: row._count._all,
      size: row._sum.size ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

class statsController {
  static async user(userId: string) {
    const [totalFiles, sizeAgg, byType] = await FileRepository.stats({ userId });

    const uploadHistory = await userHistory(userId);

    return {
      totalFiles,
      storageUsed: sizeAgg._sum.size ?? 0,
      byType: toByType(byType),
      uploadHistory,
    };
  }

  static async admin() {
    const [
      [totalUsers, verifiedUsers, adminUsers],
      [totalFiles, sizeAgg, byType],
      [filesOnDisk, sizeOnDiskAgg],
      recentUploads,
      uploadHistory,
    ] = await Promise.all([
      UserRepository.counts(),
      FileRepository.stats(),
      FileRepository.stats({ includeDeleted: true }),
      FileRepository.recent(10),
      globalHistory(),
    ]);

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      adminUsers,
      totalFiles,
      storageUsed: sizeAgg._sum.size ?? 0,
      storageOnDisk: sizeOnDiskAgg._sum.size ?? 0,
      deletedFiles: filesOnDisk - totalFiles,
      byType: toByType(byType),
      recentUploads,
      uploadHistory,
    };
  }
}

export default statsController;
