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


function toFieldErrors(data: unknown): Record<string, string[]> | undefined {
  if (!Array.isArray(data)) return undefined;

  const errors: Record<string, string[]> = {};
  for (const issue of data) {
    if (!issue || typeof issue !== "object") continue;
    const { field, message } = issue as { field?: unknown; message?: unknown };
    if (typeof message !== "string") continue;
    const key =
      typeof field === "string" ? field.split(".").pop() || field : "_";
    (errors[key] ??= []).push(message);
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}

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

    const fieldErrors = error.response?.data?.errors ?? toFieldErrors(error.response?.data);
    const firstFieldMessage = fieldErrors
      ? Object.values(fieldErrors)[0]?.[0]
      : undefined;

    const normalized: ApiError = {
      message:
        backendMessage ??
        firstFieldMessage ??
        error.message ??
        "Something went wrong",
      statusCode: status,
      errors: fieldErrors,
    };

    return Promise.reject(normalized);
  }
);
