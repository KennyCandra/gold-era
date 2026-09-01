"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { FileItem, ListQueryParams, Paginated, UserStats } from "@/lib/types";

export function useUserStats() {
  return useQuery({
    queryKey: ["stats", "user"],
    queryFn: async () => {
      const { data } = await api.get<UserStats>("/stats/user");
      return data;
    },
  });
}

/**
 * Fetches the most recently uploaded files for the "Recent uploads" card.
 * Uses the same `files` list query key convention as the files feature so
 * results dedupe/share cache with an equivalent list query elsewhere.
 */
export function useRecentFiles(limit = 5) {
  const params: ListQueryParams = {
    page: 1,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  return useQuery({
    queryKey: ["files", "list", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<FileItem>>("/files", { params });
      return data;
    },
  });
}
