"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import {
  Users,
  Wallet,
  Play,
  Banknote,
  Plus,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GET_PAYROLL_SETUP_CHECKLIST, GET_PAYROLL_RUNS } from "@/lib/graphql/payroll/queries";
import {
  ENSURE_FOUNDER_PAYROLL_SETUP,
  INITIATE_PAYROLL_RUN,
  PUBLISH_PAYSLIPS,
} from "@/lib/graphql/payroll/mutations";
import { GET_ALL_USERS } from "@/lib/graphql/users/queries";
import { CREATE_USER } from "@/lib/graphql/users/mutations";
import { usePayrollMutations } from "@/lib/graphql/payroll/payrollHook";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import api from "@/lib/api/client";
import { useStore } from "@/lib/store/useStore";

type StepId = "people" | "ctc" | "run" | "pay";

const STEPS: { id: StepId; label: string; icon: typeof Users }[] = [
  { id: "people", label: "People", icon: Users },
  { id: "ctc", label: "Set CTC", icon: Wallet },
  { id: "run", label: "Run payroll", icon: Play },
  { id: "pay", label: "Pay", icon: Banknote },
];

function tempPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function formatInr(n: number | string | null | undefined) {
  const v = Number(n || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

interface FounderPayrollModeProps {
  organizationId?: string;
}

export function FounderPayrollMode({ organizationId }: FounderPayrollModeProps) {
  const { user: me } = useStore();
  const resolvedOrgId =
    organizationId || (me?.organization?.id ? String(me.organization.id) : undefined);
  const orgVars = { organizationId: resolvedOrgId || undefined };
  const [step, setStep] = useState<StepId>("people");
  const [structureId, setStructureId] = useState<string>("");
  const [structureName, setStructureName] = useState("Standard CTC");
  const [ctcDrafts, setCtcDrafts] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runSummary, setRunSummary] = useState<{
    totalGross?: number;
    totalDeduction?: number;
    totalNetPay?: number;
    status?: string;
  } | null>(null);
  const [bankFormat, setBankFormat] = useState("neft");
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bankAccountNumber: "",
    bankIfscCode: "",
  });

  const { assignSalaryToEmployee } = usePayrollMutations();

  const [ensureSetup, { loading: ensuring }] = useMutation(ENSURE_FOUNDER_PAYROLL_SETUP);
  const [createUser] = useMutation(CREATE_USER);
  const [initiateRun] = useMutation(INITIATE_PAYROLL_RUN);
  const [publishPayslips] = useMutation(PUBLISH_PAYSLIPS);

  const {
    data: checklistData,
    refetch: refetchChecklist,
  } = useQuery(GET_PAYROLL_SETUP_CHECKLIST, {
    variables: orgVars,
    fetchPolicy: "cache-and-network",
  }) as any;

  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery(GET_ALL_USERS, {
    variables: {
      page: 1,
      pageSize: 200,
      filters: {
        isActive: true,
        ...(resolvedOrgId ? { organizationId: resolvedOrgId } : {}),
      },
    },
    fetchPolicy: "cache-and-network",
  }) as any;

  const { data: runsData, refetch: refetchRuns } = useQuery(GET_PAYROLL_RUNS, {
    variables: orgVars,
    fetchPolicy: "cache-and-network",
  }) as any;

  const checklist = checklistData?.payrollSetupChecklist;
  const users: any[] = usersData?.allUsers?.results ?? [];
  const employees = useMemo(
    () => users.filter((u) => u.role === "employee" || u.role === "manager"),
    [users]
  );
  const missingCtc = useMemo(
    () =>
      employees.filter(
        (u) => !u.salaryDetails?.annualCtc || !u.salaryDetails?.isActive
      ),
    [employees]
  );
  const withCtc = useMemo(
    () =>
      employees.filter(
        (u) => u.salaryDetails?.annualCtc && u.salaryDetails?.isActive
      ),
    [employees]
  );
  const missingBank = useMemo(
    () =>
      employees.filter(
        (u) => !u.bankAccountNumber?.trim() || !u.bankIfscCode?.trim()
      ),
    [employees]
  );

  const bootstrap = useCallback(async () => {
    try {
      const { data } = await ensureSetup({
        variables: { organizationId: resolvedOrgId || undefined },
      });
      const payload = (data as any)?.ensureFounderPayrollSetup;
      if (payload?.defaultStructureId) {
        setStructureId(String(payload.defaultStructureId));
        setStructureName(payload.defaultStructureName || "Standard CTC");
      }
      await refetchChecklist();
    } catch (err: any) {
      toast.error(err?.message || "Could not prepare payroll setup");
    }
  }, [ensureSetup, resolvedOrgId, refetchChecklist]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    // Suggest step from checklist
    if (!checklist) return;
    if ((checklist.activeEmployees ?? 0) === 0) setStep("people");
    else if ((checklist.employeesMissingCtc ?? 0) > 0) setStep("ctc");
    else if (!activeRunId) setStep("run");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — only on mount

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName.trim() || !newEmp.email.trim()) {
      toast.error("First name and email are required");
      return;
    }
    setBusy(true);
    const password = tempPassword();
    try {
      const { data } = await createUser({
        variables: {
          input: {
            firstName: newEmp.firstName.trim(),
            lastName: newEmp.lastName.trim() || ".",
            email: newEmp.email.trim().toLowerCase(),
            password,
            role: "employee",
            bankAccountNumber: newEmp.bankAccountNumber.trim() || null,
            bankIfscCode: newEmp.bankIfscCode.trim() || null,
            ...(resolvedOrgId ? { organizationId: resolvedOrgId } : {}),
          },
        },
      });
      const payload = (data as any)?.createUser;
      if (!payload?.success) {
        throw new Error(payload?.error || "Failed to create employee");
      }
      toast.success(
        `Added ${newEmp.firstName}. Temporary password: ${password}`,
        { duration: 12000 }
      );
      setAddOpen(false);
      setNewEmp({
        firstName: "",
        lastName: "",
        email: "",
        bankAccountNumber: "",
        bankIfscCode: "",
      });
      await Promise.all([refetchUsers(), refetchChecklist()]);
    } catch (err: any) {
      toast.error(err?.message || "Could not add employee");
    } finally {
      setBusy(false);
    }
  };

  const handleAssignCtc = async (userId: string) => {
    if (!structureId) {
      toast.error("Salary structure not ready yet — wait a moment and retry");
      await bootstrap();
      return;
    }
    const raw = ctcDrafts[userId];
    const annualCtc = Number(String(raw || "").replace(/,/g, ""));
    if (!annualCtc || annualCtc <= 0) {
      toast.error("Enter a valid annual CTC");
      return;
    }
    setAssigningId(userId);
    try {
      // First of current month so they appear in this month's payroll run
      const now = new Date();
      const effectiveFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const result = await assignSalaryToEmployee(
        userId,
        structureId,
        annualCtc,
        effectiveFrom
      );
      if (!result.success) throw new Error(result.error || "Assign failed");
      toast.success("CTC assigned");
      setCtcDrafts((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      await Promise.all([refetchUsers(), refetchChecklist()]);
    } catch (err: any) {
      toast.error(err?.message || "Could not assign CTC");
    } finally {
      setAssigningId(null);
    }
  };

  const handleRunPayroll = async () => {
    if (withCtc.length === 0) {
      toast.error("Assign CTC to at least one employee first");
      setStep("ctc");
      return;
    }
    setBusy(true);
    try {
      const { data } = await initiateRun({
        variables: { month, year },
      });
      const run = (data as any)?.initiatePayrollRun;
      if (!run?.id) throw new Error("Payroll run failed");
      setActiveRunId(String(run.id));
      setRunSummary({
        totalGross: run.totalGross,
        totalDeduction: run.totalDeduction,
        totalNetPay: run.totalNetPay,
        status: run.status,
      });
      toast.success(`Payroll processed for ${month}/${year}`);
      await refetchRuns();
      setStep("pay");
    } catch (err: any) {
      toast.error(err?.message || "Could not process payroll");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!activeRunId) {
      toast.error("Process a payroll run first");
      setStep("run");
      return;
    }
    setBusy(true);
    try {
      await publishPayslips({ variables: { payrollRunId: activeRunId } });
      toast.success("Payslips published");
      await refetchRuns();
    } catch (err: any) {
      toast.error(err?.message || "Could not publish payslips");
    } finally {
      setBusy(false);
    }
  };

  const handleBankDownload = async () => {
    if (!activeRunId) {
      toast.error("Process a payroll run first");
      return;
    }
    setBusy(true);
    try {
      const res = await api.get(
        API_ENDPOINTS.payrollBankExport(activeRunId, bankFormat),
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
        match?.[1] || `bank_payout_${bankFormat}_run${activeRunId}.csv`;
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
          toast.error(JSON.parse(text)?.error || "Download failed");
        } catch {
          toast.error("Download failed");
        }
      } else {
        toast.error(err?.message || "Download failed");
      }
    } finally {
      setBusy(false);
    }
  };

  // Prefer latest matching run from list when summary incomplete
  useEffect(() => {
    if (!activeRunId || runSummary?.totalNetPay != null) return;
    const runs = runsData?.payrollRuns ?? [];
    const found = runs.find((r: any) => String(r.id) === String(activeRunId));
    if (found) {
      setRunSummary({
        totalGross: found.totalGross,
        totalDeduction: found.totalDeduction,
        totalNetPay: found.totalNetPay,
        status: found.status,
      });
    }
  }, [activeRunId, runsData, runSummary?.totalNetPay]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quick Payroll
              </p>
              <h2 className="text-base font-semibold text-foreground">
                Get your team paid in four steps
              </h2>
              <p className="text-sm text-muted-foreground">
                Structure: {structureName}
                {ensuring ? " · preparing…" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">
                  {checklist?.activeEmployees ?? employees.length}
                </strong>{" "}
                people
              </span>
              <span>
                <strong className="text-foreground">
                  {checklist?.employeesWithCtc ?? withCtc.length}
                </strong>{" "}
                with CTC
              </span>
              {(checklist?.employeesMissingBank ?? missingBank.length) > 0 && (
                <span className="text-amber-700 dark:text-amber-400">
                  {checklist?.employeesMissingBank ?? missingBank.length} missing
                  bank
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1 border-b border-border px-2 py-2 sm:px-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = s.id === step;
            const done = i < stepIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : done
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span>
                  {i + 1}. {s.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 sm:p-6">
          {step === "people" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Your team
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add people quickly, or import a sheet if you already have one.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/employees/import">
                      <Upload className="mr-1.5 h-4 w-4" />
                      Import sheet
                    </Link>
                  </Button>
                  <Button onClick={() => setAddOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Quick add
                  </Button>
                </div>
              </div>

              {usersLoading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading employees…
                </div>
              ) : employees.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No employees yet. Add your first hire or import a CSV/Excel.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {employees.slice(0, 12).map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {u.salaryDetails?.annualCtc ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            CTC set
                          </span>
                        ) : (
                          <span>No CTC</span>
                        )}
                        {!u.bankAccountNumber?.trim() && (
                          <span className="ml-2 text-amber-700 dark:text-amber-400">
                            · no bank
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                  {employees.length > 12 && (
                    <li className="px-4 py-2 text-center text-xs text-muted-foreground">
                      +{employees.length - 12} more — manage in{" "}
                      <Link href="/employees" className="text-primary hover:underline">
                        Employees
                      </Link>
                    </li>
                  )}
                </ul>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep("ctc")}
                  disabled={employees.length === 0}
                >
                  Continue to CTC
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "ctc" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Annual CTC
                </h3>
                <p className="text-sm text-muted-foreground">
                  Uses <strong>{structureName}</strong> (Basic 40% + HRA 20%). You
                  can refine components later in Advanced.
                </p>
              </div>

              {missingCtc.length === 0 ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-6 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium text-foreground">
                    All {withCtc.length} employees have CTC assigned
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {missingCtc.map((u) => (
                    <li
                      key={u.id}
                      className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Annual CTC"
                          className="w-36"
                          value={ctcDrafts[u.id] || ""}
                          onChange={(e) =>
                            setCtcDrafts((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          disabled={assigningId === u.id}
                          onClick={() => handleAssignCtc(u.id)}
                        >
                          {assigningId === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Assign"
                          )}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {withCtc.length > 0 && missingCtc.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {withCtc.length} already assigned · {missingCtc.length} remaining
                </p>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("people")}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep("run")}
                  disabled={withCtc.length === 0}
                >
                  Continue to run
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "run" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Process this month
                </h3>
                <p className="text-sm text-muted-foreground">
                  Creates the run and calculates payslips for everyone with CTC.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="w-36">
                  <label className="mb-1.5 block text-sm font-medium">Month</label>
                  <Select
                    value={String(month)}
                    onValueChange={(v) => setMonth(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {new Date(2000, m - 1, 1).toLocaleString("en", {
                            month: "long",
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28">
                  <label className="mb-1.5 block text-sm font-medium">Year</label>
                  <Select
                    value={String(year)}
                    onValueChange={(v) => setYear(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[year - 1, year, year + 1].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Will include <strong>{withCtc.length}</strong> employees with CTC.
              </p>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("ctc")}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleRunPayroll} disabled={busy}>
                  {busy ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-1.5 h-4 w-4" />
                  )}
                  Process payroll
                </Button>
              </div>
            </div>
          )}

          {step === "pay" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Publish &amp; pay
                </h3>
                <p className="text-sm text-muted-foreground">
                  Publish payslips for the portal, then download a bank file for
                  net banking.
                </p>
              </div>

              {!activeRunId ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                  <p className="mb-3 text-sm text-muted-foreground">
                    No run processed in this session yet.
                  </p>
                  <Button variant="outline" onClick={() => setStep("run")}>
                    Go to Run payroll
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                      <p className="text-xs text-muted-foreground">Gross</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatInr(runSummary?.totalGross)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                      <p className="text-xs text-muted-foreground">Deductions</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatInr(runSummary?.totalDeduction)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                      <p className="text-xs text-muted-foreground">Net pay</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatInr(runSummary?.totalNetPay)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <Button onClick={handlePublish} disabled={busy}>
                      {busy ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      )}
                      Publish payslips
                    </Button>

                    <div className="w-40">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Bank format
                      </label>
                      <Select value={bankFormat} onValueChange={setBankFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neft">NEFT</SelectItem>
                          <SelectItem value="imps">IMPS</SelectItem>
                          <SelectItem value="hdfc">HDFC</SelectItem>
                          <SelectItem value="icici">ICICI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleBankDownload}
                      disabled={busy}
                    >
                      <Download className="mr-1.5 h-4 w-4" />
                      Bank file
                    </Button>

                    <Button variant="ghost" asChild>
                      <Link href={`/payroll/${activeRunId}`}>
                        Open run
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}

              <div className="flex justify-start">
                <Button variant="ghost" onClick={() => setStep("run")}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick add employee</DialogTitle>
            <DialogDescription>
              A temporary password is shown once after create. They can change it
              later.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                required
                value={newEmp.firstName}
                onChange={(e) =>
                  setNewEmp((p) => ({ ...p, firstName: e.target.value }))
                }
              />
              <Input
                label="Last name"
                value={newEmp.lastName}
                onChange={(e) =>
                  setNewEmp((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </div>
            <Input
              label="Email"
              type="email"
              required
              value={newEmp.email}
              onChange={(e) =>
                setNewEmp((p) => ({ ...p, email: e.target.value }))
              }
            />
            <Input
              label="Bank account"
              value={newEmp.bankAccountNumber}
              onChange={(e) =>
                setNewEmp((p) => ({ ...p, bankAccountNumber: e.target.value }))
              }
            />
            <Input
              label="IFSC"
              value={newEmp.bankIfscCode}
              onChange={(e) =>
                setNewEmp((p) => ({ ...p, bankIfscCode: e.target.value }))
              }
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-1.5 h-4 w-4" />
                )}
                Add employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FounderPayrollMode;
