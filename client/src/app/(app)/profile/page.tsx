"use client";

import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ErrorState, Skeleton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useStats";

function ProfileContent() {
  const { user } = useAuth();
  const statsQuery = useUserStats();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader user={user} />

      {statsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-26 rounded-xl" />
          <Skeleton className="h-26 rounded-xl" />
          <Skeleton className="h-26 rounded-xl" />
        </div>
      ) : statsQuery.isError || !statsQuery.data ? (
        <ErrorState
          message="We couldn't load your stats."
          onRetry={() => statsQuery.refetch()}
        />
      ) : (
        <ProfileStats
          filesUploaded={statsQuery.data.totalFiles}
          storageBytes={statsQuery.data.storageUsed}
          verified={user.verified}
        />
      )}

      <ChangePasswordForm />
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
