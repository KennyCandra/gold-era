import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  AdminStats,
  FileItem,
  ListQueryParams,
  Paginated,
  Role,
  User,
} from "@/lib/types";

export function useAdminStats() {
  return useQuery({
    queryKey: ["stats", "admin"],
    queryFn: async () => {
      const { data } = await api.get<AdminStats>("/stats/admin");
      return data;
    },
  });
}

export type AdminUserListParams = ListQueryParams;

export function useUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: ["users", "list", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<User>>("/users", { params });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { data } = await api.patch<User>(`/users/${id}`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "admin"] });
    },
  });
}

export type AdminFileListParams = ListQueryParams;

export function useAdminFiles(params: AdminFileListParams) {
  return useQuery({
    queryKey: ["files", "all", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<FileItem>>("/files/all", {
        params,
      });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useDeleteAdminFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/files/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", "all"] });
      queryClient.invalidateQueries({ queryKey: ["stats", "admin"] });
    },
  });
}
