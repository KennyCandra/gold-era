import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import type { ApiError } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/verify-email",
  "/auth/resend-code",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/logout",
];

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .get<{ user: unknown; accessToken: string }>("/auth/refresh", {
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
      })
      .then((res) => {
        useAuthStore.getState().setAccessToken(res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const config = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = config?.url ?? "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

    if (status === 401 && config && !isAuthEndpoint && !config._retry) {
      config._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        return api.request(config);
      } catch {
        useAuthStore.getState().clearAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    const normalized: ApiError = {
      message: backendMessage ?? error.message ?? "Something went wrong",
      statusCode: status,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(normalized);
  }
);
