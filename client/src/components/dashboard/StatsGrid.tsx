import { StatTile } from "@/components/ui";
import { formatBytes, formatRelative } from "@/lib/utils";
import type { FileItem, UserStats } from "@/lib/types";

export interface StatsGridProps {
  stats: UserStats;
  lastFile?: FileItem;
}

export function StatsGrid({ stats, lastFile }: StatsGridProps) {
  const typeCount = stats.byType.filter((t) => t.count > 0).length;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile index={0} label="Total Files" value={stats.totalFiles} />
      <StatTile index={1} label="Storage Used" value={formatBytes(stats.storageUsed)} />
      <StatTile index={2} label="File Types" value={typeCount} />
      <StatTile index={3}
        label="Last Upload"
        value={
          <span className="flex flex-col gap-1">
            <span className="whitespace-nowrap text-[clamp(20px,2vw,30px)] font-semibold leading-9 tracking-[-0.02em] tabular-nums">
              {lastFile ? formatRelative(lastFile.createdAt) : "—"}
            </span>
            {lastFile && (
              <span className="truncate text-[13px] font-normal leading-[18px] text-subtle">
                {lastFile.originalName}
              </span>
            )}
          </span>
        }
      />
    </div>
  );
}
