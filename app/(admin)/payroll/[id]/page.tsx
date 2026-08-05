"use client";

import React, { use } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_PAYROLL_RUN_DETAILS,
  GET_ADVANCE_RECOVERY_PREVIEW,
} from "@/lib/graphql/payroll/queries";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  DollarSign,
  Settings2,
  RefreshCcw,
  Play,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { PayrollAdjustmentModal } from "@/components/payroll/PayrollAdjustmentModal";
import { PayrollTourButton } from "@/components/payroll/PayrollTour";
import {
  PROCESS_PAYROLL_RUN,
  PUBLISH_PAYSLIPS,
  EXECUTE_PAYROLL_PAYOUT,
} from "@/lib/graphql/payroll/mutations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import api from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const BANK_FORMATS = [
  { value: "neft", label: "NEFT (generic)" },
  { value: "imps", label: "IMPS (generic)" },
  { value: "hdfc", label: "HDFC bulk" },
  { value: "icici", label: "ICICI bulk" },
] as const;
function statusChip(status: string) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    processing: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    failed: "bg-destructive/10 text-destructive",
    published: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  };
  return map[status] || "bg-muted text-muted-foreground";
}

export default function PayrollRunDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useStore();

  const { data, loading, error, refetch } = useQuery(GET_PAYROLL_RUN_DETAILS, {
    variables: { id },
    fetchPolicy: "network-only",
    skip: !!(user && user.role !== "admin" && user.role !== "superadmin"),
  }) as any;

  const { data: advancePreview } = useQuery(GET_ADVANCE_RECOVERY_PREVIEW, {
    skip: !!(user && user.role !== "admin" && user.role !== "superadmin"),
  }) as any;

  const [publishPayslips, { loading: publishing }] = useMutation(PUBLISH_PAYSLIPS);
  const [executePayout, { loading: paying }] = useMutation<{
    executePayrollPayout: number;
  }>(EXECUTE_PAYROLL_PAYOUT);
  const [processRun, { loading: processing }] = useMutation(PROCESS_PAYROLL_RUN);

  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [bankFormat, setBankFormat] = React.useState<string>("neft");
  const [downloadingBank, setDownloadingBank] = React.useState(false);
  const run = data?.payrollRun;

  if (user && user.role !== "admin" && user.role !== "superadmin") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-base font-semibold text-foreground">Access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only admins can access payroll.</p>
        <Link href="/dashboard" className="mt-6">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading payroll run…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
        {error.message}
      </div>
    );
  }

  if (!run) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <h2 className="text-base font-semibold text-foreground">Payroll run not found</h2>
        <Link href="/payroll" className="mt-6 inline-block">
          <Button variant="outline">Back to payroll</Button>
        </Link>
      </div>
    );
  }

  const locked = !!run.hasLockedPayslips;
  const hasPayslips = (run.payslips || []).length > 0;
  const publishedCount = run.publishedCount ?? 0;
  const paidCount = run.paidCount ?? 0;

  const stepIndex =
    paidCount > 0
      ? 4
      : publishedCount > 0
        ? 3
        : run.status === "completed" && hasPayslips
          ? 2
          : run.status === "draft" || run.status === "failed"
            ? 0
            : 1;

  const steps = [
    { label: "Draft", desc: "Run created" },
    { label: "Process", desc: "Calculate payslips" },
    { label: "Review", desc: "Adjust / advances" },
    { label: "Publish", desc: "PDFs + employee view" },
    { label: "Payout", desc: "Bank transfer" },
  ];

  const handleProcess = async () => {
    try {
      await processRun({ variables: { payrollRunId: id } });
      toast.success("Payroll calculated");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePublish = async () => {
    try {
      await publishPayslips({ variables: { payrollRunId: id } });
      toast.success("Payslips published");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleProcessPayouts = async () => {
    try {
      const res = await executePayout({ variables: { payrollRunId: id } });
      toast.success(
        `Processed payouts for ${res.data?.executePayrollPayout ?? 0} employees.`
      );
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDownloadBankFile = async () => {
    setDownloadingBank(true);
    try {
      const res = await api.get(
        API_ENDPOINTS.payrollBankExport(id, bankFormat),
        { responseType: "blob" }
      );
      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await (res.data as Blob).text();
        let msg = "Download failed";
        try {
          msg = JSON.parse(text)?.error || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const disposition = res.headers?.["content-disposition"] || "";
      const match = /filename="?([^"]+)"?/i.exec(disposition);
      const filename =
        match?.[1] ||
        `bank_payout_${bankFormat}_run${id}.csv`;
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const skipped = Number(res.headers?.["x-skipped-count"] || 0);
      const included = Number(res.headers?.["x-included-count"] || 0);
      if (skipped > 0) {
        toast.success(
          `Downloaded ${included} payouts · skipped ${skipped} without bank details`
        );
      } else {
        toast.success(`Downloaded bank file (${included} employees)`);
      }
    } catch (err: any) {
      const data = err?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          toast.error(parsed?.error || err.message || "Download failed");
        } catch {
          toast.error(err.message || "Download failed");
        }
      } else {
        toast.error(
          data?.error || err.message || "Download failed"
        );
      }
    } finally {
      setDownloadingBank(false);
    }
  };

  const recoveries = advancePreview?.advanceRecoveryPreview || [];

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/payroll"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to payroll
          </Link>
          <PageHeader
            eyebrow="Payroll run"
            title={`${monthNames[run.month - 1]} ${run.year}`}
            description="Follow the steps: process → review → publish → payout."
          />
        </div>
        <PayrollTourButton variant="detail" />
      </div>

      <Card id="payroll-run-stepper" className="p-4">
        <ol className="grid gap-3 sm:grid-cols-5">
          {steps.map((s, i) => (
            <li
              key={s.label}
              className={cn(
                "rounded-lg border px-3 py-2",
                i <= stepIndex
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted/30"
              )}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Step {i + 1}
              </p>
              <p className="text-sm font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-muted-foreground">Net pay</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₹{Number(run.totalNetPay).toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Gross</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₹{Number(run.totalGross).toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Deductions</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-destructive">
            ₹{Number(run.totalDeduction).toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Status</p>
          <span
            className={cn(
              "mt-2 inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize",
              statusChip(run.status)
            )}
          >
            {run.status}
          </span>
        </Card>
      </div>

      {recoveries.length > 0 && !locked && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <p className="text-sm font-semibold text-foreground">
            Advances to recover on next process
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {recoveries.map((r: any) => (
              <li key={r.advanceId}>
                {r.userName}: ₹{Number(r.deduct).toLocaleString()} (remaining after ₹
                {Number(r.remainingAfter).toLocaleString()})
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          id="payroll-process"
          onClick={handleProcess}
          disabled={processing || locked}
          variant={run.status === "draft" || run.status === "failed" ? "default" : "outline"}
        >
          {run.status === "draft" || !hasPayslips ? (
            <Play className="mr-2 h-4 w-4" />
          ) : (
            <RefreshCcw className={cn("mr-2 h-4 w-4", processing && "animate-spin")} />
          )}
          {processing
            ? "Processing…"
            : locked
              ? "Locked (published/paid)"
              : hasPayslips
                ? "Recalculate"
                : "Process payroll"}
        </Button>
        <Button
          id="payroll-publish"
          onClick={handlePublish}
          disabled={publishing || run.status !== "completed" || !hasPayslips}
          variant="outline"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {publishing ? "Publishing…" : "Publish payslips"}
        </Button>
        <Button
          id="payroll-payout"
          onClick={handleProcessPayouts}
          disabled={paying || publishedCount === 0}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          {paying ? "Processing…" : "Process payouts"}
        </Button>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-1.5">
          <Select value={bankFormat} onValueChange={setBankFormat}>
            <SelectTrigger className="h-8 w-[150px] border-0 bg-transparent shadow-none">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              {BANK_FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            id="payroll-bank-export"
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={downloadingBank || !hasPayslips}
            onClick={handleDownloadBankFile}
          >
            {downloadingBank ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {downloadingBank ? "Preparing…" : "Bank file"}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Bank file exports NEFT/IMPS CSV for net banking upload. Skips employees
        without account number or IFSC.
      </p>

      <Card className="overflow-hidden p-0">
        <DataTable
          isLoading={false}
          data={run.payslips || []}
          columns={[
            {
              key: "user",
              label: "Employee",
              render: (_val, row: any) => (
                <div>
                  <p className="font-medium text-foreground">
                    {row.user?.firstName ?? "Unknown"} {row.user?.lastName ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.user?.email ?? "—"}</p>
                </div>
              ),
            },
            {
              key: "workedDays",
              label: "Attendance",
              render: (val, row: any) => (
                <span className="text-sm">
                  {val} days (LOP: {row.lopDays})
                </span>
              ),
            },
            {
              key: "grossEarnings",
              label: "Gross",
              render: (val) => (
                <span className="tabular-nums">₹{Number(val).toLocaleString()}</span>
              ),
            },
            {
              key: "totalDeductions",
              label: "Deductions",
              render: (val) => (
                <span className="tabular-nums text-destructive">
                  ₹{Number(val).toLocaleString()}
                </span>
              ),
            },
            {
              key: "netPay",
              label: "Net pay",
              render: (val) => (
                <span className="font-medium tabular-nums">
                  ₹{Number(val).toLocaleString()}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (val) => (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize",
                    statusChip(String(val))
                  )}
                >
                  {val}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (_val: any, row: any) => (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (row.payslipPdf?.url) window.open(row.payslipPdf.url, "_blank");
                      else toast.error("PDF not ready. Publish payslips first.");
                    }}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (row.user) setSelectedUser(row.user);
                      else toast.error("User data missing");
                    }}
                    disabled={locked}
                  >
                    <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                    Adjust
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <PayrollAdjustmentModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        month={run.month}
        year={run.year}
        onSuccess={() => {
          toast.info("Adjustment saved. Click Recalculate to apply.");
        }}
      />
    </div>
  );
}
