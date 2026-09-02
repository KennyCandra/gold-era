import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api";

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const { data } = await api.patch<{ message: string }>(
        "/auth/change-password",
        input,
      );
      return data;
    },
  });
}
