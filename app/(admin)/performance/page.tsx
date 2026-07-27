import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export default function Page() {
  return (
    <div className="page-shell">
      <PageHeader
        title="Performance"
        description="Reviews, goals, and performance cycles."
      />

      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Coming soon</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Performance reviews and goal tracking aren’t available in this release yet. You can
          continue managing people, leave, attendance, and payroll from the main modules.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/employees"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            Employees
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
