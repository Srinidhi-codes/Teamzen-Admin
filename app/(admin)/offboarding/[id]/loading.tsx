import { FormSkeleton, Skeleton } from "@/components/common/Skeleton";

export default function OffboardingDetailLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading offboarding">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <FormSkeleton />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
    </div>
  );
}
