"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { FullScreenSpinner } from "@/components/auth/FullScreenSpinner";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, isVerified, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isVerified) {
      const email = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
      router.replace(`/verify-email${email}`);
    }
  }, [isLoading, isAuthenticated, isVerified, user?.email, router]);

  if (isLoading || !isAuthenticated || !isVerified) {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}
