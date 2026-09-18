"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import axios from "axios";
import { Check, Download, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { FilePicker } from "@/components/ui/file-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  GET_PAYROLL_RUNS,
  GET_PAYSLIP_TEMPLATES,
} from "@/lib/graphql/payroll/queries";
import { SET_DEFAULT_PAYSLIP_TEMPLATE } from "@/lib/graphql/payroll/mutations";
import { cn } from "@/lib/utils";

type Props = {
  organizationId?: string;
};

type MatchRow = {
  index: number;
  fileName: string;
  matched: boolean;
  matchBy?: "employee_id" | "name" | null;
  reason?: string;
  payslipId?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  currentStatus?: string | null;
};

type PreviewResult = {
  runId: string;
  total: number;
  matched: number;
  unmatched: number;
  files: MatchRow[];
};

type Theme = {
  accent?: string;
  hero_bg?: string;
};

type PayslipTemplate = {
  id: string;
  name: string;
  description?: string;
  layoutKey: string;
  theme?: Theme | null;
  isDefault: boolean;
  isSystem: boolean;
};

type PayrollRun = {
  id: string;
  month: number;
  year: number;
  status: string;
  organization?: { name?: string } | null;
};

type TemplateQueryData = { payslipTemplates: PayslipTemplate[] };
type RunsQueryData = { payrollRuns: PayrollRun[] };
type BulkResult = PreviewResult & { published?: number };

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

async function downloadDemoPdf(
  templateId: string,
  templateName: string,
  organizationId?: string
) {
  const qs = organizationId
    ? `?organization_id=${encodeURIComponent(organizationId)}`
    : "";
  const res = await api.get(
    `${API_ENDPOINTS.payslipTemplateDemo(templateId)}${qs}`,
    { responseType: "blob" }
  );
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `demo_${(templateName || "payslip").replace(/[^\w-]+/g, "_")}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function PayslipTemplatesPanel({ organizationId }: Props) {
  const [runId, setRunId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [uploading, setUploading] = useState<"preview" | "publish" | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const queryVars = { organizationId: organizationId || undefined };
  const { data, loading, refetch } = useQuery<TemplateQueryData>(
    GET_PAYSLIP_TEMPLATES,
    {
    variables: queryVars,
    fetchPolicy: "network-only",
    }
  );
  const { data: runsData, refetch: refetchRuns } = useQuery<RunsQueryData>(
    GET_PAYROLL_RUNS,
    {
      variables: queryVars,
      fetchPolicy: "network-only",
    }
  );
  const [setDefault, { loading: settingDefault }] = useMutation(
    SET_DEFAULT_PAYSLIP_TEMPLATE
  );

  const templates = data?.payslipTemplates || [];
  const gallery = templates.filter((template) => template.isSystem);
  const orgDefault = templates.find(
    (template) => !template.isSystem && template.isDefault
  );
  const activeLayout =
    orgDefault?.layoutKey ||
    templates.find((template) => template.isSystem && template.isDefault)
      ?.layoutKey ||
    "classic";
  const completedRuns = (runsData?.payrollRuns || []).filter(
    (run) => run.status === "completed"
  );

  const handleSetDefault = async (templateId: string) => {
    try {
      await setDefault({
        variables: { templateId, organizationId: organizationId || undefined },
      });
      await refetch();
      toast.success("Default payslip design updated");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not update design"));
    }
  };

  const handleDownload = async (template: PayslipTemplate) => {
    setDownloadingId(template.id);
    try {
      await downloadDemoPdf(template.id, template.name, organizationId);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not download demo"));
    } finally {
      setDownloadingId(null);
    }
  };

  const chooseFiles = (selected: File[]) => {
    setFiles(selected);
    setPreview(null);
  };

  const submitBulk = async (mode: "preview" | "publish") => {
    if (!runId) {
      toast.error("Select a processed payroll run");
      return;
    }
    if (!files.length) {
      toast.error("Select payslip PDFs");
      return;
    }
    setUploading(mode);
    try {
      const form = new FormData();
      form.append("run_id", runId);
      form.append("mode", mode);
      files.forEach((file) => form.append("files", file));
      if (mode === "publish" && preview) {
        form.append(
          "mapping",
          JSON.stringify(
            preview.files
              .filter((row) => row.matched && row.payslipId)
              .map((row) => ({ index: row.index, payslipId: row.payslipId }))
          )
        );
      }
      const { data: result } = await api.post<BulkResult>(
        API_ENDPOINTS.PAYSLIP_BULK_UPLOAD,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (mode === "preview") {
        setPreview(result);
        toast.success(
          `${result.matched} of ${result.total} PDFs matched employees`
        );
      } else {
        toast.success(`${result.published || 0} payslips published`);
        setFiles([]);
        setPreview(null);
        await refetchRuns();
      }
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Bulk upload failed"));
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Standard payslip designs
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a distinct, real-world payroll format. Teamzen generates every
          employee&apos;s payslip from payroll data using the selected design.
        </p>

        {loading && !data ? (
          <div className="mt-5 flex min-h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {gallery.map((template) => {
              const inUse = template.layoutKey === activeLayout;
              return (
                <div
                  key={template.id}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-xl border bg-card",
                    inUse ? "border-primary ring-2 ring-primary/20" : "border-border"
                  )}
                >
                  <PayslipPreview
                    layout={template.layoutKey}
                    theme={template.theme || {}}
                  />
                  <div className="flex flex-1 flex-col p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{template.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      {inUse && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                          <Check className="h-3 w-3" /> In use
                        </span>
                      )}
                    </div>
                    <div className="mt-auto space-y-2 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={downloadingId === template.id}
                        onClick={() => handleDownload(template)}
                      >
                        {downloadingId === template.id ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-3.5 w-3.5" />
                        )}
                        Download demo
                      </Button>
                      <Button
                        size="sm"
                        className="w-full"
                        variant={inUse ? "outline" : "default"}
                        disabled={inUse || settingDefault}
                        onClick={() => handleSetDefault(template.id)}
                      >
                        {inUse ? "Selected" : "Use this design"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Publish your own payslip PDFs
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bulk upload finalized PDFs. Filenames are matched to this run by
              employee ID first, then by a unique full name. Preview is required;
              unmatched files are never published.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Processed payroll run
            </label>
            <Select value={runId} onValueChange={(value) => {
              setRunId(value);
              setPreview(null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {completedRuns.map((run) => (
                  <SelectItem key={run.id} value={String(run.id)}>
                    {MONTHS[run.month - 1]} {run.year} · {run.organization?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Payslip PDFs
            </label>
            <FilePicker
              accept=".pdf,application/pdf"
              multiple
              disabled={!!uploading}
              label="Choose PDFs"
              emptyLabel="No payslips selected"
              files={files}
              onChange={chooseFiles}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Example: EMP-001_Aanya_Sharma_Mar-2026.pdf
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!!uploading}
            onClick={() => submitBulk("preview")}
          >
            {uploading === "preview" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Preview matches
          </Button>
          <Button
            disabled={!preview?.matched || !!uploading}
            onClick={() => submitBulk("publish")}
          >
            {uploading === "publish" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            Publish {preview?.matched || 0} matched
          </Button>
        </div>

        {preview && (
          <div className="mt-5 overflow-hidden rounded-lg border border-border">
            <div className="flex flex-wrap gap-3 border-b border-border bg-muted/30 px-3 py-2 text-xs">
              <span>{preview.total} files</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                {preview.matched} matched
              </span>
              <span className="text-destructive">
                {preview.unmatched} unmatched
              </span>
            </div>
            <div className="max-h-80 divide-y divide-border overflow-y-auto">
              {preview.files.map((row) => (
                <div
                  key={`${row.index}-${row.fileName}`}
                  className="grid gap-1 px-3 py-2 text-xs sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <span className="truncate font-medium">{row.fileName}</span>
                  <span className={row.matched ? "text-foreground" : "text-destructive"}>
                    {row.matched
                      ? `${row.employeeName} · ${row.employeeId || "No employee ID"}`
                      : row.reason}
                  </span>
                  <span className="text-muted-foreground">
                    {row.matched ? `by ${row.matchBy?.replace("_", " ")}` : "Skipped"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function PayslipPreview({
  layout,
  theme,
}: {
  layout: string;
  theme: Theme;
}) {
  const accent = theme.accent || "#0f766e";
  const compact = layout === "compact";
  const minimal = layout === "minimal";
  const modern = layout === "modern";

  return (
    <div className="h-44 border-b border-border bg-muted/30 p-3">
      <div className="mx-auto h-full max-w-56 overflow-hidden border border-black/10 bg-white p-2 text-zinc-900 shadow-sm">
        <div
          className={cn(
            "flex items-start justify-between border-b pb-1",
            modern && "border-b-4"
          )}
          style={{ borderColor: modern ? accent : "#d4d4d8" }}
        >
          <div>
            <p className="text-[8px] font-bold">ACME INDUSTRIES PVT LTD</p>
            <p className="text-[6px] text-zinc-500">Salary slip · March 2026</p>
          </div>
          <div className="h-5 w-5 rounded-sm" style={{ background: accent }} />
        </div>
        {!minimal && (
          <div
            className={cn("my-1.5 px-2", compact ? "py-1" : "py-2")}
            style={{ background: theme.hero_bg || "#f4f4f5" }}
          >
            <p className="text-[5px] uppercase text-zinc-500">Net pay</p>
            <p className={cn("font-bold", compact ? "text-[10px]" : "text-sm")}>
              ₹72,450
            </p>
          </div>
        )}
        <div className={cn("grid grid-cols-2 gap-x-3", compact ? "text-[5px]" : "text-[6px]")}>
          <span>Employee: Aanya Sharma</span><span>ID: EMP-001</span>
          <span>Department: Engineering</span><span>PAN: ABCDE1234F</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["Earnings", "Deductions"].map((label) => (
            <div key={label} className="border border-zinc-200">
              <p
                className="px-1 py-0.5 text-[6px] font-bold text-white"
                style={{ background: minimal ? "#3f3f46" : accent }}
              >
                {label}
              </p>
              <div className={cn("space-y-0.5 p-1", compact ? "text-[5px]" : "text-[6px]")}>
                <div className="flex justify-between"><span>Basic</span><span>34,000</span></div>
                <div className="flex justify-between"><span>HRA</span><span>13,600</span></div>
                <div className="flex justify-between border-t pt-0.5 font-bold">
                  <span>Total</span><span>47,600</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
