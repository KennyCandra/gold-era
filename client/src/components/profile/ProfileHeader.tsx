import { Avatar, RoleBadge } from "@/components/ui";
import type { User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-border bg-surface p-6">
      <Avatar name={user.name} size="lg" className="h-16 w-16 flex-none text-xl" />
      <div className="flex flex-col gap-1.5">
        <span className="text-2xl font-semibold leading-8 tracking-[-0.02em]">{user.name}</span>
        <span className="text-sm text-muted">{user.email}</span>
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role === "ADMIN" ? "Admin" : "User"} />
          <span className="text-[13px] leading-[18px] text-subtle">
            Member since {formatDate(user.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
