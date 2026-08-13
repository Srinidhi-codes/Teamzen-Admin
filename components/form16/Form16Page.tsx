"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, Upload, Wand2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";

type Tab = "bulk" | "generate";

type MatchRow = {
  filename: string;
  matched: boolean;
  matched_by?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  pan?: string | null;
};

function currentFyLabel() {
  const d = new Date();
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${String(y + 1).slice(-2)}`;
}

export default function Form16Page({ embedded = false }: { embedded?: boolean }) {
  const [tab, setTab] = useState<Tab>("bulk");
  const [fy, setFy] = useState(currentFyLabel());
  const [busy, setBusy] = useState(false);
  const [matchRows, setMatchRows] = useState<MatchRow[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [overridesCsv, setOverridesCsv] = useState("");
  const [genResults, setGenResults] = useState<any[]>([]);
  const [bulkResult, setBulkResult] = useState<any>(null);

  const { user: me } = useStore();
  const organizationId =
    me?.role === "superadmin" ? undefined : me?.organization?.id;

  const { users, isUsersLoading } = useGraphQLUsers({
    page: 1,
    pageSize: 200,
    filters: {
      isActive: true,
      ...(organizationId ? { organizationId } : {}),
    },
  });

  const employeeList = useMemo(
    () => (users || []).filter((u: any) => u.role === "employee"),
    [users]
  );

  const parseOverridesCsv = (): Record<string, Record<string, number>> => {
    // CSV: userId|email|pan, section_80c, hra_exempt
    const map: Record<string, Record<string, number>> = {};
    const lines = overridesCsv
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      if (line.toLowerCase().startsWith("user") || line.toLowerCase().startsWith("email")) {
        continue;
      }
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length < 2) continue;
      const key = parts[0];
      const section_80c = Number(parts[1] || 0) || 0;
      const hra_exempt = Number(parts[2] || 0) || 0;
      let userId = key;
      const byEmail = employeeList.find(
        (u: any) => u.email?.toLowerCase() === key.toLowerCase()
      );
      const byPan = employeeList.find(
        (u: any) => (u.panNumber || "").toUpperCase() === key.toUpperCase()
      );
      if (byEmail) userId = byEmail.id;
      else if (byPan) userId = byPan.id;
      map[userId] = { section_80c, hra_exempt };
    }
    return map;
  };

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

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(employeeList.map((u: any) => u.id)));
  };

  const generate = async (allActive = false) => {
    if (!allActive && selectedIds.size === 0) {
      toast.error("Select at least one employee");
      return;
    }
    setBusy(true);
    setGenResults([]);
    try {
      const res = await fetch("/api/documents/form16/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          financial_year: fy,
          all_active: allActive,
          user_ids: allActive ? undefined : Array.from(selectedIds),
          overrides: parseOverridesCsv(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Generate failed");
      setGenResults(data.results || []);
      toast.success(`Generated ${data.generated || 0} · failed ${data.failed || 0}`);
    } catch (e: any) {
      toast.error(e.message || "Generate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {!embedded && (
        <PageHeader
          title="Form 16"
          description="Bulk-publish official PDFs to the employee vault, or generate Part B from payroll data."
        />
      )}

      <SegmentedTabs
        value={tab}
        onChange={(id) => setTab(id as Tab)}
        tabs={[
          { id: "bulk", label: "Bulk upload", icon: Upload },
          { id: "generate", label: "Generate Part B", icon: Wand2 },
        ]}
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            label="Financial year"
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            placeholder="2025-26"
          />
        </div>
        <p className="pb-2 text-xs text-muted-foreground">
          Assessment year for FY {fy} is derived automatically (e.g. 2025-26 → AY 2026-27).
        </p>
      </div>

      {tab === "bulk" && (
        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <h3 className="text-sm font-semibold">Upload TRACES / official Form 16 PDFs</h3>
            <p className="text-xs text-muted-foreground">
              Name files with employee PAN (e.g. MSXPS6972G_PARTB_2026-27.pdf) or employee ID.
              You can also upload a zip of PDFs.
            </p>
            <div className="flex flex-wrap gap-3">
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) =>
                  setPendingFiles(Array.from(e.target.files || []))
                }
              />
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
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
      )}

      {tab === "generate" && (
        <div className="space-y-4">
          <Card className="space-y-3 border-amber-200/60 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="text-sm text-amber-950 dark:text-amber-100">
                <p className="font-medium">Generated Part B matches your TRACES template layout</p>
                <p className="mt-1 text-xs opacity-90">
                  Teamzen fills the official Part B grid (watermark, logos, annexure tables) from
                  payslip totals. HRA exemption and 80C default to 0 unless you provide CSV
                  overrides. Prefer Bulk upload when you already have TRACES-issued PDFs.
                  Set org TAN / CIT (TDS) and employee residential address for complete headers.
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Employees</h3>
              <Button type="button" size="sm" variant="outline" onClick={selectAll}>
                Select all active
              </Button>
            </div>
            {isUsersLoading ? (
              <p className="text-sm text-muted-foreground">Loading employees…</p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
                {employeeList.map((u: any) => (
                  <li key={u.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleUser(u.id)}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {u.firstName} {u.lastName}
                        <span className="text-muted-foreground">
                          {" · "}
                          {u.panNumber || "no PAN"}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="space-y-3 p-5">
            <h3 className="text-sm font-semibold">Optional overrides CSV</h3>
            <p className="text-xs text-muted-foreground">
              One row per employee: <code>userId|email|pan, section_80c, hra_exempt</code>
            </p>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
              placeholder={"email@company.com,150000,0\nMSXPS6972G,100000,24000"}
              value={overridesCsv}
              onChange={(e) => setOverridesCsv(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={busy} onClick={() => generate(false)}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate & publish selected
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => generate(true)}
              >
                Generate for all active
              </Button>
            </div>
          </Card>

          {genResults.length > 0 && (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Employee</th>
                    <th className="px-4 py-2 font-medium">Gross</th>
                    <th className="px-4 py-2 font-medium">Slips</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {genResults.map((r) => (
                    <tr key={r.user_id} className="border-b last:border-0">
                      <td className="px-4 py-2">{r.user_name}</td>
                      <td className="px-4 py-2 tabular-nums">
                        {r.gross_salary != null ? Number(r.gross_salary).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="px-4 py-2 tabular-nums">{r.payslip_count ?? "—"}</td>
                      <td className="px-4 py-2">
                        {r.success ? (
                          r.download_url ? (
                            <a
                              className="text-primary underline"
                              href={r.download_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>
                          ) : (
                            "OK"
                          )
                        ) : (
                          <span className="text-destructive">{r.error || "Failed"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
