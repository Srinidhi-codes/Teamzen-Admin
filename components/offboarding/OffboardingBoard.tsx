"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/common/Skeleton";
import { OFFBOARDING_OVERVIEW, OFFBOARDINGS } from "@/lib/graphql/offboarding/queries";

export default function OffboardingBoard() {
  const { data: overviewData, loading: overviewLoading } = useQuery(OFFBOARDING_OVERVIEW, {
    fetchPolicy: "cache-and-network",
  });
  const { data, loading, refetch } = useQuery(OFFBOARDINGS, {
    variables: { status: null },
    fetchPolicy: "cache-and-network",
  });

  const overview = overviewData?.offboardingOverview;
  const rows = data?.offboardings || [];
  const showOverviewSkeleton = overviewLoading && !overview;
  const showTableSkeleton = loading && rows.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offboarding / F&F"
        description="Track exit clearance, settlements, and relieving letters."
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        }
      />

      {showOverviewSkeleton ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="p-3">
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="h-7 w-10" />
            </Card>
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
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

      <Card className="overflow-hidden">
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
            {rows.map((row: any) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{row.userName}</div>
                  <div className="text-xs text-muted-foreground">{row.userEmail}</div>
                </td>
                <td className="px-4 py-3 capitalize">
                  {row.status?.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3 tabular-nums">{row.progressPct}%</td>
                <td className="px-4 py-3 text-xs">
                  {row.exitDate || "—"}
                  <br />
                  {row.lastWorkingDay || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/offboarding/${row.id}`}>Open</Link>
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
