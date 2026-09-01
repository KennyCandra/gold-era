"use client";

import { useMemo, useState } from "react";

import { AdminRoute } from "@/components/auth/AdminRoute";
import { FileTypeBarChart } from "@/components/admin/FileTypeBarChart";
import { RecentUploadsTable } from "@/components/admin/RecentUploadsTable";
import { useAdminFiles, useAdminStats } from "@/hooks/useAdmin";
import { ErrorState, Skeleton, StatTile, TableSkeleton } from "@/components/ui";
import { formatBytes } from "@/lib/utils";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function AdminOverviewContent() {
  const statsQuery = useAdminStats();
  const recentFilesQuery = useAdminFiles({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [now] = useState(() => Date.now());

  const newFilesThisWeek = useMemo(() => {
    const uploadsOverTime = statsQuery.data?.uploadsOverTime ?? [];
    return uploadsOverTime
      .filter((d) => now - new Date(d.date).getTime() <= WEEK_MS)
      .reduce((sum, d) => sum + d.count, 0);
  }, [statsQuery.data, now]);

  if (statsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[290px] rounded-xl" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (statsQuery.isError || !statsQuery.data) {
    return (
      <ErrorState
        message="We couldn't load the admin overview."
        onRetry={() => statsQuery.refetch()}
      />
    );
  }

  const stats = statsQuery.data;
  const recentFiles = recentFilesQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total Users"
          value={stats.totalUsers}
          delta={`${stats.verifiedUsers} verified · ${stats.pendingUsers} pending`}
        />
        <StatTile label="Total Files" value={stats.totalFiles} />
        <StatTile label="Storage Used" value={formatBytes(stats.totalSize)} />
        <StatTile
          label="New This Week"
          value={`+${newFilesThisWeek}`}
          delta="files uploaded"
        />
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold leading-7">Most uploaded file types</h2>
        {stats.filesByType.length === 0 ? (
          <p className="text-sm text-muted">No files uploaded yet.</p>
        ) : (
          <FileTypeBarChart data={stats.filesByType} />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold leading-7">Recent uploads</h2>
        <RecentUploadsTable files={recentFiles} isLoading={recentFilesQuery.isLoading} />
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <AdminRoute>
      <AdminOverviewContent />
    </AdminRoute>
  );
}
