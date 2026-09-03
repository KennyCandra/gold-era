"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AuthResponse, User } from "@/lib/types";

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (email: string, code: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAccessToken = useAuthStore((s) => s.clearAccessToken);

  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (useAuthStore.getState().accessToken) {
        if (!cancelled) setBootstrapped(true);
        return;
      }
      try {
        const res = await api.get<AuthResponse>("/auth/refresh");
        if (cancelled) return;
        setAccessToken(res.data.accessToken);
        queryClient.setQueryData(["auth", "profile"], res.data.user);
      } catch {
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    data: user,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const res = await api.get<{ user: User }>("/auth/profile");
      return res.data.user;
    },
    enabled: bootstrapped && !!accessToken,
    retry: false,
  });

  const isLoading = !bootstrapped || (!!accessToken && isProfileLoading);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      setAccessToken(res.data.accessToken);
      queryClient.setQueryData(["auth", "profile"], res.data.user);
      return res.data.user;
    },
    [queryClient, setAccessToken]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await api.post("/auth/register", { name, email, password });
    },
    []
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const res = await api.post<AuthResponse>("/auth/verify-email", {
        email,
        code,
      });
      setAccessToken(res.data.accessToken);
      queryClient.setQueryData(["auth", "profile"], res.data.user);
    },
    [queryClient, setAccessToken]
  );

  const resendCode = useCallback(async (email: string) => {
    await api.post("/auth/resend-code", { email });
  }, []);


  const forgotPassword = useCallback(async (email: string) => {
    const res = await api.post<{ message: string }>("/auth/forgot-password", {
      email,
    });
    return res.data.message;
  }, []);

  const resetPassword = useCallback(
    async (email: string, code: string, password: string) => {
      await api.post("/auth/reset-password", { email, code, password });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
    }
    clearAccessToken();
    queryClient.clear();
    router.push("/login");
  }, [queryClient, router, clearAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      isVerified: user?.verified === true,
      login,
      register,
      verifyEmail,
      resendCode,
      forgotPassword,
      resetPassword,
      logout,
    }),
    [
      user,
      isLoading,
      login,
      register,
      verifyEmail,
      resendCode,
      forgotPassword,
      resetPassword,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
