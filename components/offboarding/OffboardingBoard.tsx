"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import moment from "moment";
import { RotateCcw, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/common/FormSelect";
import { Skeleton } from "@/components/common/Skeleton";
import { OFFBOARDING_OVERVIEW, OFFBOARDINGS } from "@/lib/graphql/offboarding/queries";
import { OffboardingTourButton } from "@/components/offboarding/OffboardingTour";

type OffboardingOverview = {
  total: number;
  initiated: number;
  inProgress: number;
  settlementPending: number;
  lettersPending: number;
  completed: number;
  cancelled: number;
};

type OffboardingRow = {
  id: string;
  status?: string | null;
  progressPct: number;
  exitDate?: string | null;
  lastWorkingDay?: string | null;
  userName?: string | null;
  userEmail?: string | null;
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    initiated: "bg-slate-100 text-slate-700",
    in_progress: "bg-yellow-100 text-yellow-800",
    settlement_pending: "bg-orange-100 text-orange-800",
    letters_pending: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
  };
  return map[status] || "bg-muted text-muted-foreground";
}

export default function OffboardingBoard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data: overviewData, loading: overviewLoading } = useQuery<{
    offboardingOverview?: OffboardingOverview | null;
  }>(OFFBOARDING_OVERVIEW, {
    fetchPolicy: "cache-and-network",
  });
  const { data, loading, refetch } = useQuery<
    { offboardings?: OffboardingRow[] | null },
    { status: string | null }
  >(OFFBOARDINGS, {
    variables: { status: status || null },
    fetchPolicy: "cache-and-network",
  });

  const overview = overviewData?.offboardingOverview;
  const rawRows = data?.offboardings || [];
  
  const rows = rawRows.filter((r) => {
    if (search) {
      const s = search.toLowerCase();
      if (!r.userName?.toLowerCase().includes(s) && !r.userEmail?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const showOverviewSkeleton = overviewLoading && !overview;
  const showTableSkeleton = loading && rawRows.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offboarding / F&F"
        description="Track exit clearance, settlements, and relieving letters."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <OffboardingTourButton variant="board" />
            <Link
              id="offboarding-letters-link"
              href="/onboarding/letters"
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Letter templates
            </Link>
            <button
              onClick={() => refetch()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Refresh"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {showOverviewSkeleton ? (
        <div id="offboarding-kpis" className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="p-3">
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="h-7 w-10" />
            </Card>
          ))}
        </div>
      ) : overview ? (
        <div id="offboarding-kpis" className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {[
            ["Total", overview.total],
            ["Initiated", overview.initiated],
            ["In progress", overview.inProgress],
            ["Settlement", overview.settlementPending],
            ["Letters", overview.lettersPending],
            ["Completed", overview.completed],
            ["Cancelled", overview.cancelled],
          ].map(([label, value]) => (
            <Card key={String(label)} className="p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold tabular-nums">{value}</p>
            </Card>
          ))}
        </div>
      ) : null}

      <div id="offboarding-filters" className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          {[
            { value: "", label: "All statuses" },
            { value: "initiated", label: "Initiated" },
            { value: "in_progress", label: "In progress" },
            { value: "settlement_pending", label: "Settlement pending" },
            { value: "letters_pending", label: "Letters pending" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ].map((s) => (
            <Button
              key={s.value || "all"}
              type="button"
              size="sm"
              variant={status === s.value ? "default" : "secondary"}
              onClick={() => setStatus(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <Card id="offboarding-table" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Exit / LWD</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {showTableSkeleton &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Skeleton className="mb-1.5 h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-2 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="mb-1 h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-8 w-14" />
                  </td>
                </tr>
              ))}
            {!showTableSkeleton && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted-foreground">
                  No offboarding records. Start F&F from an employee card.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{row.userName}</div>
                  <div className="text-xs text-muted-foreground">{row.userEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge(
                      row.status || ""
                    )}`}
                  >
                    {row.status?.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{row.progressPct}%</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span title="Exit Date"><strong className="font-medium">Exit:</strong> {row.exitDate ? moment(row.exitDate).format("DD MMM YYYY") : "—"}</span>
                    <span title="Last Working Day"><strong className="font-medium">LWD:</strong> {row.lastWorkingDay ? moment(row.lastWorkingDay).format("DD MMM YYYY") : "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline" className="group relative w-20 overflow-hidden">
                    <Link href={`/offboarding/${row.id}`}>
                      <span className="transition-transform duration-200 group-hover:-translate-x-2">Open</span>
                      <ArrowRight className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
