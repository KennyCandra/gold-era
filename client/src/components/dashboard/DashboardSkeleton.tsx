import { Skeleton, TableSkeleton } from "@/components/ui";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.35fr]">
        <Skeleton className="h-[308px] w-full rounded-xl" />
        <Skeleton className="h-[308px] w-full rounded-xl" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
