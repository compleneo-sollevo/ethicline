import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-1">
      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-1 h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="rounded-xl border bg-card p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
