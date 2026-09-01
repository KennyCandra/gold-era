"use client";

import Link from "next/link";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { FilesByTypeChart } from "@/components/dashboard/FilesByTypeChart";
import { RecentUploads } from "@/components/dashboard/RecentUploads";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { UploadHistoryChart } from "@/components/dashboard/UploadHistoryChart";
import { Button, EmptyState, ErrorState } from "@/components/ui";
import { useRecentFiles, useUserStats } from "@/hooks/useStats";
import type { ApiError } from "@/lib/types";

export default function DashboardPage() {
  const statsQuery = useUserStats();
  const recentQuery = useRecentFiles(5);

  if (statsQuery.isLoading || recentQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (statsQuery.isError || !statsQuery.data) {
    const error = statsQuery.error as ApiError | null;
    return (
      <ErrorState message={error?.message} onRetry={() => statsQuery.refetch()} />
    );
  }

  const stats = statsQuery.data;
  const recentFiles = recentQuery.data?.data ?? [];

  if (stats.totalFiles === 0) {
    return (
      <EmptyState
        heading="No files yet"
        message="Upload your first file to see stats and activity here."
        action={
          <Link href="/upload">
            <Button>Upload files</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StatsGrid stats={stats} lastFile={recentFiles[0]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.35fr]">
        <FilesByTypeChart data={stats.filesByType} />
        <UploadHistoryChart data={stats.uploadsOverTime} />
      </div>

      {recentFiles.length > 0 && <RecentUploads files={recentFiles} />}
    </div>
  );
}
