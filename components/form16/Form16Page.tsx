"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilePicker } from "@/components/ui/file-picker";
import { FormSelect } from "@/components/common/FormSelect";
import { cn } from "@/lib/utils";

type MatchRow = {
  filename: string;
  matched: boolean;
  matched_by?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  pan?: string | null;
};

function fyStartYear(d = new Date()) {
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

function fyLabel(startYear: number) {
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

function currentFyLabel() {
  return fyLabel(fyStartYear());
}

function financialYearOptions() {
  const current = fyStartYear();
  // Current FY, 6 previous, and next (for early TRACES files)
  return Array.from({ length: 8 }, (_, i) => fyLabel(current + 1 - i));
}

export default function Form16Page({ embedded = false }: { embedded?: boolean }) {
  const [fy, setFy] = useState(currentFyLabel());
  const [busy, setBusy] = useState(false);
  const [matchRows, setMatchRows] = useState<MatchRow[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<any>(null);

  const buildPreviewForm = () => {
    const form = new FormData();
    pendingFiles.forEach((f) => form.append("files", f));
    if (zipFile) form.append("zip", zipFile);
    return form;
  };

  const previewMatch = async () => {
    if (!pendingFiles.length && !zipFile) {
      toast.error("Select PDF files or a zip");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/documents/form16/preview-match/", {
        method: "POST",
        body: buildPreviewForm(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setMatchRows(data.rows || []);
      toast.success(`${(data.rows || []).filter((r: MatchRow) => r.matched).length} matched`);
    } catch (e: any) {
      toast.error(e.message || "Preview failed");
    } finally {
      setBusy(false);
    }
  };

  const publishBulk = async () => {
    if (!pendingFiles.length && !zipFile) {
      toast.error("Select PDF files or a zip");
      return;
    }
    setBusy(true);
    try {
      const form = buildPreviewForm();
      form.append("financial_year", fy);
      const res = await fetch("/api/documents/form16/bulk-publish/", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setBulkResult(data);
      toast.success(`Published ${data.matched?.length || 0} Form 16 file(s)`);
    } catch (e: any) {
      toast.error(e.message || "Publish failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {!embedded && (
        <PageHeader
          title="Form 16"
          description="Publish official TRACES Form 16 PDFs to the employee documents vault."
        />
      )}


      <div className="flex max-w-xs flex-col gap-1">
        <FormSelect
          label="Financial year"
          value={fy}
          onValueChange={setFy}
          options={financialYearOptions().map((year) => ({
            label: year,
            value: year,
          }))}
          className="h-9 rounded-md px-3 py-2"
        />
        <p className="text-xs text-muted-foreground">
          Used as the FY label on published vault documents.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="space-y-3 p-5">
          <h3 className="text-sm font-semibold">Upload TRACES Form 16 PDFs</h3>
          <p className="text-xs text-muted-foreground">
            Name files with employee PAN (e.g. MSXPS6972G_PARTB_2026-27.pdf) or employee ID.
            You can also upload a zip of PDFs.
          </p>
          <div className="space-y-3">
            <FilePicker
              accept=".pdf,application/pdf"
              multiple
              label="Choose PDFs"
              files={pendingFiles}
              onChange={setPendingFiles}
            />
            <FilePicker
              accept=".zip,application/zip"
              label="Choose zip"
              files={zipFile ? [zipFile] : []}
              onChange={(next) => setZipFile(next[0] || null)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={previewMatch}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Preview matches
            </Button>
            <Button type="button" disabled={busy} onClick={publishBulk}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish matched
            </Button>
          </div>
        </Card>

        {matchRows.length > 0 && (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">File</th>
                  <th className="px-4 py-2 font-medium">PAN</th>
                  <th className="px-4 py-2 font-medium">Employee</th>
                  <th className="px-4 py-2 font-medium">Match</th>
                </tr>
              </thead>
              <tbody>
                {matchRows.map((r, i) => (
                  <tr key={`${r.filename}-${i}`} className="border-b last:border-0">
                    <td className="px-4 py-2">{r.filename}</td>
                    <td className="px-4 py-2 tabular-nums">{r.pan || "—"}</td>
                    <td className="px-4 py-2">{r.user_name || "—"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                          r.matched
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {r.matched ? r.matched_by || "yes" : "unmatched"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {bulkResult && (
          <Card className="space-y-2 p-4 text-sm">
            <p>
              Published <strong>{bulkResult.matched?.length || 0}</strong> · Unmatched{" "}
              <strong>{bulkResult.unmatched?.length || 0}</strong> · Errors{" "}
              <strong>{bulkResult.errors?.length || 0}</strong>
            </p>
            {(bulkResult.unmatched || []).length > 0 && (
              <ul className="list-disc pl-5 text-xs text-muted-foreground">
                {bulkResult.unmatched.map((u: any, i: number) => (
                  <li key={i}>
                    {u.filename}: {u.reason}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
