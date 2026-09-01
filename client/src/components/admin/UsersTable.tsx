import { Trash2 } from "lucide-react";

import {
  Avatar,
  RoleBadge,
  Select,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { Role, User } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export type AdminUser = User & {
  fileCount?: number;
  _count?: { files?: number };
};

function fileCountOf(user: AdminUser): number | null {
  if (typeof user.fileCount === "number") return user.fileCount;
  if (typeof user._count?.files === "number") return user._count.files;
  return null;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

export interface UsersTableProps {
  users: AdminUser[];
  currentUserId?: string;
  onRoleChange: (user: AdminUser, role: Role) => void;
  onDeleteRequest: (user: AdminUser) => void;
  updatingUserId?: string | null;
  className?: string;
}

export function UsersTable({
  users,
  currentUserId,
  onRoleChange,
  onDeleteRequest,
  updatingUserId,
  className,
}: UsersTableProps) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow header>
          <TableCell header>User</TableCell>
          <TableCell header className="w-[130px]">
            Role
          </TableCell>
          <TableCell header className="w-[110px]">
            Status
          </TableCell>
          <TableCell header align="right" className="w-[70px]">
            Files
          </TableCell>
          <TableCell header align="right" className="w-[120px]">
            Joined
          </TableCell>
          <TableCell header className="w-[44px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const count = fileCountOf(user);

          return (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={user.name} />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-[13px] leading-[18px] text-subtle">
                      {user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {isSelf ? (
                  <div title="You cannot change your own role">
                    <RoleBadge role={user.role === "ADMIN" ? "Admin" : "User"} />
                  </div>
                ) : (
                  <Select
                    options={ROLE_OPTIONS}
                    value={user.role}
                    onChange={(value) => onRoleChange(user, value as Role)}
                    disabled={updatingUserId === user.id}
                    aria-label={`Role for ${user.name}`}
                    className="w-[104px]"
                  />
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={user.verified ? "Verified" : "Pending"} />
              </TableCell>
              <TableCell align="right" className="tabular-nums text-muted">
                {count ?? "—"}
              </TableCell>
              <TableCell align="right" className="tabular-nums text-subtle">
                {formatDate(user.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(user)}
                    disabled={isSelf}
                    title={isSelf ? "You cannot delete your own account" : "Delete user"}
                    aria-label={`Delete ${user.name}`}
                    className={cn(
                      "flex h-[30px] w-[30px] items-center justify-center rounded-md text-muted transition-colors",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-border focus-visible:outline-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                      !isSelf && "hover:bg-danger-subtle hover:text-danger",
                    )}
                  >
                    <Trash2 className="h-[15px] w-[15px]" strokeWidth={1.5} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
