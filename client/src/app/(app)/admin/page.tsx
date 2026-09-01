"use client";

import { useMemo, useState } from "react";

import { AdminRoute } from "@/components/auth/AdminRoute";
import { FileTypeBarChart } from "@/components/admin/FileTypeBarChart";
import { RecentUploadsTable } from "@/components/admin/RecentUploadsTable";
import { useAdminStats } from "@/hooks/useAdmin";
import { ErrorState, Skeleton, StatTile, TableSkeleton } from "@/components/ui";
import { formatBytes } from "@/lib/utils";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function AdminOverviewContent() {
  const statsQuery = useAdminStats();

  const [now] = useState(() => Date.now());

  const newFilesThisWeek = useMemo(() => {
    const uploadHistory = statsQuery.data?.uploadHistory ?? [];
    return uploadHistory
      .filter((d) => now - new Date(d.day).getTime() <= WEEK_MS)
      .reduce((sum, d) => sum + d.count, 0);
  }, [statsQuery.data, now]);

  if (statsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-26 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72.5 rounded-xl" />
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile index={0}
          label="Total Users"
          value={stats.totalUsers}
          delta={`${stats.verifiedUsers} verified · ${stats.unverifiedUsers} pending`}
        />
        <StatTile index={1} label="Total Files" value={stats.totalFiles} />
        <StatTile index={2} label="Storage Used" value={formatBytes(stats.storageUsed)} />
        <StatTile index={3}
          label="New This Week"
          value={`+${newFilesThisWeek}`}
          delta="files uploaded"
        />
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold leading-7">Most uploaded file types</h2>
        {stats.byType.length === 0 ? (
          <p className="text-sm text-muted">No files uploaded yet.</p>
        ) : (
          <FileTypeBarChart data={stats.byType} />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold leading-7">Recent uploads</h2>
        <RecentUploadsTable files={stats.recentUploads} />
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
