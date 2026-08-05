"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  Check,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  GET_IMPORT_TARGET_FIELDS,
  GET_DATA_IMPORT_JOB,
} from "@/lib/graphql/payroll/queries";
import {
  UPDATE_IMPORT_MAPPING,
  PREVIEW_DATA_IMPORT,
  COMMIT_DATA_IMPORT,
} from "@/lib/graphql/payroll/mutations";
import { cn } from "@/lib/utils";

type Step = "upload" | "map" | "preview" | "done";

type Props = {
  organizationId?: string;
};

const STEPS: { id: Step; label: string; short: string }[] = [
  { id: "upload", label: "Upload", short: "File" },
  { id: "map", label: "Map columns", short: "Map" },
  { id: "preview", label: "Preview", short: "Review" },
  { id: "done", label: "Done", short: "Done" },
];

export function DataImportWizard({ organizationId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [jobId, setJobId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [updateExisting, setUpdateExisting] = useState(true);
  const [assignCtc, setAssignCtc] = useState(true);
  const [sendWelcome, setSendWelcome] = useState(false);

  const { data: fieldsData } = useQuery(GET_IMPORT_TARGET_FIELDS, {
    fetchPolicy: "cache-first",
  }) as { data?: { importTargetFields?: { key: string; label: string; required: boolean }[] } };

  const { data: jobData, refetch: refetchJob } = useQuery(GET_DATA_IMPORT_JOB, {
    variables: { id: jobId },
    skip: !jobId,
    fetchPolicy: "cache-first",
  }) as {
    data?: { dataImportJob?: Record<string, unknown> };
    refetch: () => Promise<unknown>;
  };

  const [updateMapping, { loading: mappingLoading }] = useMutation(
    UPDATE_IMPORT_MAPPING
  );
  const [previewImport, { loading: previewLoading }] = useMutation(
    PREVIEW_DATA_IMPORT
  );
  const [commitImport, { loading: commitLoading }] = useMutation(
    COMMIT_DATA_IMPORT
  );

  const job = jobData?.dataImportJob as
    | {
        fileName?: string;
        rowCount?: number;
        headers?: string[];
        sampleRows?: Record<string, string>[];
        previewResult?: Record<string, unknown>;
        commitResult?: Record<string, unknown>;
      }
    | undefined;

  const targets = fieldsData?.importTargetFields || [];
  const headers: string[] = job?.headers || [];
  const sampleRows: Record<string, string>[] = job?.sampleRows || [];
  const preview = (job?.previewResult || {}) as {
    create_count?: number;
    update_count?: number;
    error_count?: number;
    errors?: { row: number; email?: string; issues?: string[] }[];
  };
  const commit = (job?.commitResult || {}) as {
    created?: number;
    updated?: number;
    ctc_assigned?: number;
    failed_count?: number;
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const emailMapped = Object.values(mapping).includes("email");
  const mappedCount = Object.values(mapping).filter(Boolean).length;

  const onFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      const lower = file.name.toLowerCase();
      if (!/\.(csv|xlsx|xls)$/.test(lower)) {
        toast.error("Upload a CSV or Excel (.xlsx) file");
        return;
      }
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        if (organizationId) form.append("organization_id", organizationId);
        form.append("use_ai", "true");
        const res = await api.post(API_ENDPOINTS.PAYROLL_IMPORT_UPLOAD, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const data = res.data;
        setJobId(data.jobId);
        setMapping(data.columnMapping || {});
        setStep("map");
        toast.success(
          `Read ${data.rowCount} rows from ${data.fileName}${
            data.truncated ? " (first 2000 kept)" : ""
          }`
        );
      } catch (e: unknown) {
        const err = e as { response?: { data?: { error?: string } }; message?: string };
        toast.error(
          err?.response?.data?.error || err?.message || "Upload failed"
        );
      } finally {
        setUploading(false);
      }
    },
    [organizationId]
  );

  const usedTargets = useMemo(() => {
    return new Set(Object.values(mapping).filter(Boolean));
  }, [mapping]);

  const handleSaveMapping = async (useAi = false) => {
    if (!jobId) return;
    try {
      const { data } = await updateMapping({
        variables: { jobId, columnMapping: mapping, useAi },
      });
      const next = (data as { updateImportMapping?: { columnMapping?: Record<string, string> } })
        ?.updateImportMapping;
      if (next?.columnMapping) setMapping(next.columnMapping);
      await refetchJob();
      toast.success(useAi ? "AI remapped columns" : "Mapping saved");
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Could not save mapping");
    }
  };

  const handlePreview = async () => {
    if (!jobId) return;
    if (!emailMapped) {
      toast.error("Map a column to Email before preview");
      return;
    }
    try {
      await updateMapping({
        variables: { jobId, columnMapping: mapping, useAi: false },
      });
      await previewImport({ variables: { jobId } });
      await refetchJob();
      setStep("preview");
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Preview failed");
    }
  };

  const handleCommit = async () => {
    if (!jobId) return;
    try {
      await commitImport({
        variables: {
          jobId,
          updateExisting,
          assignCtc,
          sendWelcome,
        },
      });
      await refetchJob();
      setStep("done");
      toast.success("Import committed");
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Commit failed");
    }
  };

  const reset = () => {
    setStep("upload");
    setJobId("");
    setMapping({});
    setDragOver(false);
  };

  const employeesHref = organizationId
    ? `/employees?organizationId=${encodeURIComponent(organizationId)}`
    : "/employees";

  return (
    <div className="flex min-h-[70vh] flex-col">
      <ImportStepper current={step} />

      <div
        key={step}
        className="mt-8 flex-1 opacity-100 transition-opacity duration-300"
      >
        {step === "upload" && (
          <UploadStep
            uploading={uploading}
            dragOver={dragOver}
            inputRef={inputRef}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFile(e.dataTransfer.files?.[0] || null);
            }}
            onPick={() => inputRef.current?.click()}
            onFileChange={(f) => onFile(f)}
          />
        )}

        {step === "map" && job && (
          <MapStep
            fileName={job.fileName || "Spreadsheet"}
            rowCount={job.rowCount || 0}
            headers={headers}
            sampleRows={sampleRows}
            targets={targets}
            mapping={mapping}
            usedTargets={usedTargets}
            emailMapped={emailMapped}
            mappedCount={mappedCount}
            onMappingChange={(col, value) =>
              setMapping((prev) => ({
                ...prev,
                [col]: value === "__skip__" ? "" : value,
              }))
            }
          />
        )}

        {step === "preview" && job && (
          <PreviewStep
            preview={preview}
            updateExisting={updateExisting}
            assignCtc={assignCtc}
            sendWelcome={sendWelcome}
            onUpdateExisting={setUpdateExisting}
            onAssignCtc={setAssignCtc}
            onSendWelcome={setSendWelcome}
          />
        )}

        {step === "done" && (
          <DoneStep
            commit={commit}
            employeesHref={employeesHref}
            onReset={reset}
          />
        )}
      </div>

      {step !== "upload" && step !== "done" && (
        <div className="sticky bottom-0 z-10 -mx-1 mt-8 border-t border-border bg-background/95 px-1 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setStep(stepIndex > 0 ? STEPS[stepIndex - 1].id : "upload")
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {step === "map" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={mappingLoading}
                    onClick={() => handleSaveMapping(true)}
                  >
                    {mappingLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Remap with AI
                  </Button>
                  <Button
                    type="button"
                    disabled={previewLoading || !emailMapped}
                    onClick={handlePreview}
                  >
                    {previewLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Previewing…
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              )}
              {step === "preview" && (
                <Button
                  type="button"
                  disabled={
                    commitLoading ||
                    (preview.create_count ?? 0) + (preview.update_count ?? 0) ===
                      0
                  }
                  onClick={handleCommit}
                >
                  {commitLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    <>
                      Commit import
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImportStepper({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Import progress" className="w-full">
      <ol className="flex items-start justify-between gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li
              key={s.id}
              className={cn(
                "relative flex flex-1 flex-col items-center text-center",
                i < STEPS.length - 1 &&
                  "after:absolute after:left-[calc(50%+1.25rem)] after:right-[calc(-50%+1.25rem)] after:top-5 after:h-px after:content-['']",
                i < STEPS.length - 1 &&
                  (done || active
                    ? "after:bg-primary/40"
                    : "after:bg-border")
              )}
            >
              <span
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-300",
                  done &&
                    "border-primary bg-primary text-primary-foreground",
                  active &&
                    "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px] shadow-primary/15",
                  !done &&
                    !active &&
                    "border-border bg-card text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={cn(
                  "mt-2.5 text-xs font-medium sm:text-sm",
                  active || done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.short}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function UploadStep({
  uploading,
  dragOver,
  inputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onPick,
  onFileChange,
}: {
  uploading: boolean;
  dragOver: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onPick: () => void;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Import employees
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Drop a headcount or payroll sheet. We map columns, preview creates and
          updates, then load people into Teamzen.
        </p>
      </div>

      <button
        type="button"
        disabled={uploading}
        onClick={onPick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "group relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all duration-200",
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
          uploading && "pointer-events-none opacity-80"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          disabled={uploading}
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
            dragOver ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>
        <p className="text-base font-semibold text-foreground">
          {uploading
            ? "Reading spreadsheet…"
            : dragOver
              ? "Drop to upload"
              : "Drag & drop your file here"}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {uploading ? "Mapping columns with AI when available" : "or click to browse"}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {["CSV", "XLSX", "XLS"].map((ext) => (
            <span
              key={ext}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {ext}
            </span>
          ))}
        </div>
      </button>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <HintCard
          title="Required"
          body="An Email column so we can create or match employees."
        />
        <HintCard
          title="Optional"
          body="Name, PAN, bank, DOJ, department, designation, annual CTC."
        />
      </div>
    </div>
  );
}

function HintCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-sm text-foreground">{body}</p>
    </div>
  );
}

function MapStep({
  fileName,
  rowCount,
  headers,
  sampleRows,
  targets,
  mapping,
  usedTargets,
  emailMapped,
  mappedCount,
  onMappingChange,
}: {
  fileName: string;
  rowCount: number;
  headers: string[];
  sampleRows: Record<string, string>[];
  targets: { key: string; label: string; required: boolean }[];
  mapping: Record<string, string>;
  usedTargets: Set<string>;
  emailMapped: boolean;
  mappedCount: number;
  onMappingChange: (col: string, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Map columns
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Match each spreadsheet column to a Teamzen field.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
            <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="max-w-[180px] truncate">{fileName}</span>
            <span className="text-muted-foreground">· {rowCount} rows</span>
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium",
              emailMapped
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
            )}
          >
            {emailMapped ? "Email mapped" : "Email required"}
            {" · "}
            {mappedCount}/{headers.length} mapped
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
          <span>Spreadsheet column</span>
          <span>Sample values</span>
          <span>Maps to</span>
        </div>
        <ul className="divide-y divide-border">
          {headers.map((h) => {
            const sample = sampleRows
              .map((r) => r?.[h])
              .filter((v) => v != null && String(v).trim() !== "")
              .slice(0, 2)
              .join(" · ");
            const mapped = Boolean(mapping[h]);
            return (
              <li
                key={h}
                className={cn(
                  "grid gap-3 px-4 py-3.5 transition-colors sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-4",
                  mapped ? "bg-transparent" : "bg-muted/10"
                )}
              >
                <div>
                  <p className="font-medium text-foreground">{h}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                    {sample || "No sample"}
                  </p>
                </div>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">
                  {sample || "—"}
                </p>
                <Select
                  value={mapping[h] || "__skip__"}
                  onValueChange={(v) => onMappingChange(h, v)}
                >
                  <SelectTrigger
                    className={cn(
                      "h-10 w-full",
                      mapped && "border-primary/30"
                    )}
                  >
                    <SelectValue placeholder="Skip" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">Skip column</SelectItem>
                    {targets.map((t) => {
                      const taken =
                        usedTargets.has(t.key) && mapping[h] !== t.key;
                      return (
                        <SelectItem
                          key={t.key}
                          value={t.key}
                          disabled={taken}
                        >
                          {t.label}
                          {t.required ? " *" : ""}
                          {taken ? " (used)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function PreviewStep({
  preview,
  updateExisting,
  assignCtc,
  sendWelcome,
  onUpdateExisting,
  onAssignCtc,
  onSendWelcome,
}: {
  preview: {
    create_count?: number;
    update_count?: number;
    error_count?: number;
    errors?: { row: number; email?: string; issues?: string[] }[];
  };
  updateExisting: boolean;
  assignCtc: boolean;
  sendWelcome: boolean;
  onUpdateExisting: (v: boolean) => void;
  onAssignCtc: (v: boolean) => void;
  onSendWelcome: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Preview import
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review what will change, then commit when you&apos;re ready.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <PreviewStat
          icon={Users}
          label="Will create"
          value={preview.create_count ?? 0}
          tone="emerald"
        />
        <PreviewStat
          icon={RefreshCw}
          label="Will update"
          value={preview.update_count ?? 0}
          tone="sky"
        />
        <PreviewStat
          icon={AlertTriangle}
          label="Errors"
          value={preview.error_count ?? 0}
          tone="amber"
        />
      </div>

      {(preview.errors || []).length > 0 && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold text-foreground">
            Rows with issues
          </p>
          <ul className="mt-3 max-h-44 space-y-2 overflow-y-auto text-sm text-muted-foreground">
            {(preview.errors || []).slice(0, 30).map((e) => (
              <li
                key={e.row}
                className="rounded-lg border border-border/60 bg-background/60 px-3 py-2"
              >
                <span className="font-medium text-foreground">
                  Row {e.row}
                  {e.email ? ` · ${e.email}` : ""}
                </span>
                <span className="mt-0.5 block">
                  {(e.issues || []).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
        <ToggleRow
          title="Update existing employees"
          description="Match by email and overwrite mapped fields."
          checked={updateExisting}
          onChange={onUpdateExisting}
        />
        <ToggleRow
          title="Assign annual CTC"
          description="Create or update salary structure when CTC is present."
          checked={assignCtc}
          onChange={onAssignCtc}
        />
        <ToggleRow
          title="Send welcome email"
          description="Notify newly created users with login details."
          checked={sendWelcome}
          onChange={onSendWelcome}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 px-4 py-4 sm:items-center">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function DoneStep({
  commit,
  employeesHref,
  onReset,
}: {
  commit: {
    created?: number;
    updated?: number;
    ctc_assigned?: number;
    failed_count?: number;
  };
  employeesHref: string;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
        Import complete
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your spreadsheet is loaded into Teamzen.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3 text-left">
        <ResultTile label="Created" value={commit.created ?? 0} />
        <ResultTile label="Updated" value={commit.updated ?? 0} />
        <ResultTile label="CTC set" value={commit.ctc_assigned ?? 0} />
      </div>

      {(commit.failed_count ?? 0) > 0 && (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">
          {commit.failed_count} row(s) failed — check mapping and try again for
          those.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="outline" onClick={onReset}>
          Import another file
        </Button>
        <Button type="button" asChild>
          <Link href={employeesHref}>View employees</Link>
        </Button>
      </div>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function PreviewStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone: "emerald" | "sky" | "amber";
}) {
  const tones = {
    emerald:
      "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
    sky: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20",
    amber:
      "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
  };
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-5 transition-transform duration-200 hover:-translate-y-0.5",
        tones[tone]
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
