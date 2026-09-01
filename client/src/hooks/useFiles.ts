import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { FileItem, ListQueryParams, Paginated } from "@/lib/types";

export function useFiles(params: ListQueryParams) {
  return useQuery({
    queryKey: ["files", "list", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<FileItem>>("/files", { params });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useFile(id: string) {
  return useQuery({
    queryKey: ["files", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<{ file: FileItem }>(`/files/${id}`);
      return data.file;
    },
    enabled: !!id,
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/files/${id}`);
      return id;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["files", "list"] });

      const previousQueries = queryClient.getQueriesData<Paginated<FileItem>>({
        queryKey: ["files", "list"],
      });

      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData<Paginated<FileItem>>(queryKey, {
          ...data,
          data: data.data.filter((file) => file.id !== id),
          total: Math.max(0, data.total - 1),
        });
      });

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      // A deletion changes the admin file list and both stats views too.
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export async function downloadFile(file: Pick<FileItem, "id" | "originalName">) {
  const response = await api.get<Blob>(`/files/${file.id}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.originalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Firefox cancels an in-flight download if the object URL is revoked
  // synchronously after click, so defer it a tick.
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
}
