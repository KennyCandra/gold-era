import { prisma } from "@/lib/prisma";
import FileRepository from "@/reposatories/file";

type HistoryRow = { day: Date; count: number };

class statsController {
  static async user(userId: string) {
    const [totalFiles, sizeAgg, byType] = await FileRepository.stats(userId);

    const uploadHistory = await prisma.$queryRaw<HistoryRow[]>`
      SELECT date_trunc('day', created_at) AS day, count(*)::int AS count
      FROM files
      WHERE user_id = ${userId}
        AND deleted_at IS NULL
        AND created_at >= (now() at time zone 'utc') - interval '30 days'
      GROUP BY 1
      ORDER BY 1
    `;

    return {
      totalFiles,
      storageUsed: sizeAgg._sum.size ?? 0,
      byType: byType.map((row) => ({
        mimeType: row.mimeType,
        count: row._count._all,
        size: row._sum.size ?? 0,
      })),
      uploadHistory,
    };
  }
}

export default statsController;
