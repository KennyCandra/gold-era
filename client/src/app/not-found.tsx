"use client";

import { useRouter } from "next/navigation";

import { Button, EmptyState } from "@/components/ui";

function NotFoundIcon() {
  return (
    <span className="text-3xl font-semibold leading-9 tracking-[-0.02em] tabular-nums text-accent-text">
      404
    </span>
  );
}

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-[480px]">
        <EmptyState
          icon={<NotFoundIcon />}
          heading="This page doesn't exist"
          message="The link may be broken, or the file was deleted."
          action={
            <Button className="mt-1" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
          }
          className="py-16"
        />
      </div>
    </div>
  );
}
