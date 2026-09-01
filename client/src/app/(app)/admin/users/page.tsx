"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { AdminRoute } from "@/components/auth/AdminRoute";
import { DeleteUserModal } from "@/components/admin/DeleteUserModal";
import type { AdminUser } from "@/components/admin/UsersTable";
import { UsersTable } from "@/components/admin/UsersTable";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteUser, useUpdateUserRole, useUsers } from "@/hooks/useAdmin";
import { EmptyState, ErrorState, Pagination, SearchInput, TableSkeleton } from "@/components/ui";
import type { Role } from "@/lib/types";

const PAGE_SIZE = 10;

function AdminUsersContent() {
  const { user: currentUser } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const usersQuery = useUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const handleRoleChange = (user: AdminUser, role: Role) => {
    setUpdatingUserId(user.id);
    updateRole.mutate(
      { id: user.id, role },
      {
        onSuccess: () => {
          toast.success(`${user.name} is now ${role === "ADMIN" ? "an admin" : "a user"}`);
        },
        onError: (error: unknown) => {
          const message =
            error && typeof error === "object" && "message" in error
              ? String((error as { message?: string }).message)
              : "Failed to update role";
          toast.error(message);
        },
        onSettled: () => setUpdatingUserId(null),
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    deleteUser.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success(`${userToDelete.name} was deleted`);
        setUserToDelete(null);
      },
      onError: (error: unknown) => {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message?: string }).message)
            : "Failed to delete user";
        toast.error(message);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search users…"
        wrapperClassName="max-w-[320px]"
      />

      {usersQuery.isLoading ? (
        <TableSkeleton rows={8} />
      ) : usersQuery.isError ? (
        <ErrorState
          message="We couldn't load the users list."
          onRetry={() => usersQuery.refetch()}
        />
      ) : !usersQuery.data || usersQuery.data.data.length === 0 ? (
        <EmptyState
          heading="No users found"
          message={search ? "Try a different search." : "No users have registered yet."}
        />
      ) : (
        <>
          <UsersTable
            users={usersQuery.data.data}
            currentUserId={currentUser?.id}
            onRoleChange={handleRoleChange}
            onDeleteRequest={setUserToDelete}
            updatingUserId={updatingUserId}
          />
          <Pagination
            page={page}
            pageCount={usersQuery.data.totalPages}
            totalItems={usersQuery.data.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <DeleteUserModal
        user={userToDelete}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteUser.isPending}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <AdminUsersContent />
    </AdminRoute>
  );
}
