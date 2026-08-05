"use client";

import { useRef, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import {
  Check,
  Download,
  ExternalLink,
  FileUp,
  Loader2,
  Palette,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/common/Skeleton";
import api from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { GET_PAYSLIP_TEMPLATES } from "@/lib/graphql/payroll/queries";
import {
  SET_DEFAULT_PAYSLIP_TEMPLATE,
  CREATE_PAYSLIP_TEMPLATE,
  DELETE_PAYSLIP_TEMPLATE,
} from "@/lib/graphql/payroll/mutations";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/common/ConfirmationModal";

type Props = {
  organizationId?: string;
};

const LAYOUTS = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "compact", label: "Compact" },
  { value: "minimal", label: "Minimal" },
];

type Theme = {
  primary?: string;
  muted?: string;
  accent?: string;
  hero_bg?: string;
  earning_bg?: string;
  deduction_bg?: string;
  table_header_bg?: string;
  table_header_fg?: string;
  show_net_hero?: boolean;
  show_logo?: boolean;
  use_source_pdf?: boolean;
};

async function downloadDemoPdf(
  templateId: string,
  templateName: string,
  organizationId?: string
) {
  const qs = organizationId
    ? `?organization_id=${encodeURIComponent(organizationId)}`
    : "";
  const path = `${API_ENDPOINTS.payslipTemplateDemo(templateId)}${qs}`;
  const res = await api.get(path, { responseType: "blob" });
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
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = (templateName || "payslip").replace(/[^\w\-]+/g, "_").slice(0, 40);
  a.href = url;
  a.download = `demo_payslip_${safe}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isUploadedTemplate(t: any) {
  return (
    t?.layoutKey === "uploaded" ||
    t?.layoutKey === "networth" ||
    t?.source === "cloned" ||
    t?.theme?.use_source_pdf ||
    t?.theme?.renderer === "networth_replica"
  );
}

type PayslipTemplateRow = {
  __typename?: string;
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  layoutKey?: string;
  theme?: Theme | null;
  source?: string;
  previewNotes?: string;
  isDefault?: boolean;
  isActive?: boolean;
  isSystem?: boolean;
  organizationId?: string | null;
  sourceFileUrl?: string | null;
};

function TemplateGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading templates"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PayslipTemplatesPanel({ organizationId }: Props) {
  const client = useApolloClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [cloning, setCloning] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [customName, setCustomName] = useState("");
  const [customLayout, setCustomLayout] = useState("classic");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const queryVars = { organizationId: organizationId || undefined };

  const { data, loading } = useQuery(GET_PAYSLIP_TEMPLATES, {
    variables: queryVars,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
  }) as any;

  const readTemplates = (): PayslipTemplateRow[] => {
    try {
      const cached = client.readQuery({
        query: GET_PAYSLIP_TEMPLATES,
        variables: queryVars,
      }) as { payslipTemplates?: PayslipTemplateRow[] } | null;
      return cached?.payslipTemplates || [];
    } catch {
      return [];
    }
  };

  const writeTemplates = (templates: PayslipTemplateRow[]) => {
    client.writeQuery({
      query: GET_PAYSLIP_TEMPLATES,
      variables: queryVars,
      data: { payslipTemplates: templates },
    });
  };

  const [setDefault, { loading: settingDefault }] = useMutation(
    SET_DEFAULT_PAYSLIP_TEMPLATE
  );
  const [createTpl, { loading: creating }] = useMutation(CREATE_PAYSLIP_TEMPLATE);
  const [deleteTpl, { loading: deleting }] = useMutation(DELETE_PAYSLIP_TEMPLATE);

  const templates = data?.payslipTemplates || [];
  const system = templates.filter((t: any) => t.isSystem);
  const custom = templates.filter((t: any) => !t.isSystem);
  const initialLoading = loading && !data;

  const handleSetDefault = async (templateId: string) => {
    try {
      await setDefault({
        variables: {
          templateId,
          organizationId: organizationId || undefined,
        },
        update(_cache, { data: mutData }) {
          const updated = (mutData as any)?.setDefaultPayslipTemplate;
          if (!updated?.id) return;
          const list = readTemplates();
          writeTemplates(
            list.map((t) => ({
              ...t,
              isDefault: String(t.id) === String(updated.id),
            }))
          );
        },
      });
      toast.success("Default payslip template updated");
    } catch (e: any) {
      toast.error(e?.message || "Could not set default");
    }
  };

  const handleDownloadDemo = async (t: any) => {
    setDownloadingId(t.id);
    try {
      await downloadDemoPdf(t.id, t.name, organizationId);
      toast.success(
        isUploadedTemplate(t)
          ? "Downloaded your uploaded template PDF"
          : "Demo payslip downloaded"
      );
    } catch (e: any) {
      toast.error(e?.message || "Could not download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleClone = async (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Upload a PDF payslip");
      return;
    }
    setCloning(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (cloneName.trim()) form.append("name", cloneName.trim());
      if (organizationId) form.append("organization_id", organizationId);
      const res = await api.post(API_ENDPOINTS.PAYSLIP_TEMPLATE_CLONE, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created = res.data;
      if (created?.id) {
        const row: PayslipTemplateRow = {
          __typename: "PayslipTemplate",
          id: String(created.id),
          name: created.name || "Uploaded template",
          slug: created.slug || "",
          description: created.description || "",
          layoutKey: created.layoutKey || "networth",
          theme: created.theme || null,
          source: created.source || "cloned",
          previewNotes: created.previewNotes || "",
          isDefault: Boolean(created.isDefault),
          isActive: true,
          isSystem: false,
          organizationId: organizationId || null,
          sourceFileUrl: created.sourceFileUrl || "",
        };
        const list = readTemplates();
        const withoutDup = list.filter((t) => String(t.id) !== row.id);
        writeTemplates(
          row.isDefault
            ? [row, ...withoutDup.map((t) => ({ ...t, isDefault: false }))]
            : [row, ...withoutDup]
        );
      }
      setCloneName("");
      toast.success("Payslip saved as editable template");
      if (created?.id) {
        try {
          await downloadDemoPdf(
            String(created.id),
            created.name || "uploaded",
            organizationId
          );
        } catch {
          /* optional */
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || "Upload failed");
    } finally {
      setCloning(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    if (!customName.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await createTpl({
        variables: {
          name: customName.trim(),
          layoutKey: customLayout,
          description: "Custom template",
          organizationId: organizationId || undefined,
          setAsDefault: false,
        },
        update(_cache, { data: mutData }) {
          const created = (mutData as any)?.createPayslipTemplate;
          if (!created?.id) return;
          const list = readTemplates();
          if (list.some((t) => String(t.id) === String(created.id))) return;
          const row: PayslipTemplateRow = {
            __typename: "PayslipTemplate",
            isActive: true,
            isSystem: false,
            organizationId: organizationId || null,
            sourceFileUrl: "",
            previewNotes: "",
            slug: "",
            ...created,
          };
          writeTemplates(
            row.isDefault
              ? [row, ...list.map((t) => ({ ...t, isDefault: false }))]
              : [row, ...list]
          );
        },
      });
      setCustomName("");
      toast.success("Template created");
    } catch (e: any) {
      toast.error(e?.message || "Create failed");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const deletedId = deleteTarget.id;
    try {
      await deleteTpl({
        variables: { templateId: deletedId },
        update() {
          writeTemplates(
            readTemplates().filter((t) => String(t.id) !== String(deletedId))
          );
        },
      });
      setDeleteTarget(null);
      toast.success("Template deleted");
    } catch (e: any) {
      toast.error(e?.message || "Could not delete template");
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete payslip template?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed permanently. Gallery templates are not affected.`
            : ""
        }
        confirmText={deleting ? "Deleting…" : "Delete"}
        variant="destructive"
      />
      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-3 pb-5">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold text-foreground">
              Payslip templates
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileUp className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-semibold">Upload payslip → become template</h4>
        </div>
        <p className="text-sm text-muted-foreground py-2">
          Upload your existing payslip PDF. We rebuild a clean matching layout.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 max-w-[300px]">
            <Input
              placeholder="Template name (optional)"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleClone(e.target.files?.[0] || null)}
          />
          <Button disabled={cloning} onClick={() => fileRef.current?.click()}>
            {cloning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Upload PDF"
            )}
          </Button>
        </div>
      </Card>

      <div>
        <h4 className="mb-3 text-sm font-medium text-foreground">
          Your templates
        </h4>
        {initialLoading ? (
          <TemplateGridSkeleton count={2} />
        ) : custom.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No uploaded templates yet. Upload a PDF above.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {custom.map((t: any) => (
              <TemplateCard
                key={t.id}
                template={t}
                busy={settingDefault || deleting}
                downloading={downloadingId === t.id}
                onUse={() => handleSetDefault(t.id)}
                onDownloadDemo={() => handleDownloadDemo(t)}
                onDelete={() =>
                  setDeleteTarget({ id: t.id, name: t.name || "Template" })
                }
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-foreground">
          Teamzen gallery
        </h4>
        {initialLoading ? (
          <TemplateGridSkeleton count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {system.map((t: any) => (
              <TemplateCard
                key={t.id}
                template={t}
                busy={settingDefault}
                downloading={downloadingId === t.id}
                onUse={() => handleSetDefault(t.id)}
                onDownloadDemo={() => handleDownloadDemo(t)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  template: t,
  onUse,
  onDownloadDemo,
  onDelete,
  busy,
  downloading,
}: {
  template: any;
  onUse: () => void;
  onDownloadDemo: () => void;
  onDelete?: () => void;
  busy: boolean;
  downloading: boolean;
}) {
  const theme = (t.theme || {}) as Theme;
  const isActiveDefault = Boolean(t.isDefault && !t.isSystem);
  const uploaded = isUploadedTemplate(t);
  const canDelete = Boolean(onDelete) && !t.isSystem;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        isActiveDefault && "ring-2 ring-primary/40"
      )}
    >
      <div className="relative border-b border-border bg-[#e8eaed] dark:bg-zinc-900/80">
        {uploaded ? (
          <div className="p-3">
            <span className="absolute right-2 top-2 z-10 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
              Clean replica
            </span>
            <PayslipMiniPreview layoutKey="networth" theme={theme} />
          </div>
        ) : (
          <div className="p-3">
            <span className="absolute right-2 top-2 z-10 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
              Demo
            </span>
            <PayslipMiniPreview
              layoutKey={t.layoutKey || "classic"}
              theme={theme}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-foreground">{t.name}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {uploaded ? "Uploaded PDF" : `${t.layoutKey} layout`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {t.description || t.source}
            </p>
          </div>
          {isActiveDefault ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
              <Check className="h-3 w-3" /> Default
            </span>
          ) : null}
        </div>

        {t.sourceFileUrl ? (
          <a
            href={t.sourceFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Open PDF
          </a>
        ) : null}

        <div className="mt-auto flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={downloading}
            onClick={onDownloadDemo}
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Preparing…
              </>
            ) : (
              <>
                <Download className="mr-2 h-3.5 w-3.5" />
                {uploaded ? "Download filled demo" : "Download demo PDF"}
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant={isActiveDefault ? "outline" : "default"}
            className="w-full"
            disabled={busy || isActiveDefault}
            onClick={onUse}
          >
            {isActiveDefault ? "In use" : "Use as default"}
          </Button>
          {canDelete ? (
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={busy}
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PayslipMiniPreview({
  layoutKey,
  theme,
}: {
  layoutKey: string;
  theme: Theme;
}) {
  const primary = theme.primary || "#212529";
  const muted = theme.muted || "#6c757d";
  const accent = theme.accent || "#0d6efd";
  const heroBg = theme.hero_bg || "#f8f9fa";
  const earnBg = theme.earning_bg || "#f0fdf4";
  const dedBg = theme.deduction_bg || "#fef2f2";
  const thBg = theme.table_header_bg || primary;
  const thFg = theme.table_header_fg || "#ffffff";
  const showHero = theme.show_net_hero !== false && layoutKey !== "minimal" && layoutKey !== "networth";
  const compact = layoutKey === "compact" || layoutKey === "minimal";
  const modern = layoutKey === "modern";
  const networth = layoutKey === "networth";

  return (
    <div
      className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-sm border border-black/10 bg-white shadow-md"
      style={{ color: primary }}
      aria-hidden
    >
      {networth ? (
        <div className="absolute bottom-0 right-0 top-0 w-1.5">
          <div className="h-1/4 bg-[#800020]" />
          <div className="h-1/4 bg-[#1e40af]" />
          <div className="h-1/4 bg-[#ca8a04]" />
          <div className="h-1/4 bg-[#166534]" />
        </div>
      ) : null}
      <div
        className="flex items-start justify-between gap-2 border-b px-2.5 py-2"
        style={{ borderColor: "#dee2e6" }}
      >
        <div className="flex min-w-0 items-start gap-1.5">
          {networth ? (
            <div className="mt-0.5 h-5 w-1 shrink-0 bg-zinc-900" />
          ) : theme.show_logo !== false ? (
            <div
              className="mt-0.5 h-5 w-5 shrink-0 rounded"
              style={{ background: accent }}
            />
          ) : null}
          <div className="min-w-0">
            <p
              className="truncate text-[9px] font-bold leading-tight"
              style={{ color: primary }}
            >
              {networth ? "Networth Corp" : "Acme Tech Pvt Ltd"}
            </p>
            <p className="text-[7px]" style={{ color: muted }}>
              {networth ? "Payslip for the month of Mar 2026" : "Payslip"}
            </p>
          </div>
        </div>
        {!networth ? (
          <p
            className="shrink-0 text-[8px] font-semibold"
            style={{ color: primary }}
          >
            Mar 2026
          </p>
        ) : null}
      </div>

      {showHero ? (
        <div
          className={cn("px-2.5", compact ? "py-1.5" : "py-2")}
          style={{
            background: heroBg,
            borderBottom: modern ? `2px solid ${accent}` : undefined,
          }}
        >
          <p className="text-[7px] uppercase tracking-wide" style={{ color: muted }}>
            Net Pay
          </p>
          <p
            className={cn(
              "mt-0.5 font-bold leading-none",
              compact ? "text-[13px]" : "text-[15px]"
            )}
            style={{ color: primary }}
          >
            ₹72,450
          </p>
        </div>
      ) : (
        <div
          className="flex items-center justify-between border-b px-2.5 py-1.5"
          style={{ borderColor: "#dee2e6" }}
        >
          <span className="text-[7px]" style={{ color: muted }}>
            Net pay
          </span>
          <span className="text-[10px] font-bold" style={{ color: primary }}>
            ₹72,450
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 px-2.5 py-2">
        <div className="rounded px-1.5 py-1" style={{ background: earnBg }}>
          <p className="text-[6px] font-medium text-emerald-700">Gross</p>
          <p className="text-[8px] font-bold" style={{ color: primary }}>
            ₹85,000
          </p>
        </div>
        <div className="rounded px-1.5 py-1" style={{ background: dedBg }}>
          <p className="text-[6px] font-medium text-red-600">Deduct</p>
          <p className="text-[8px] font-bold" style={{ color: primary }}>
            ₹12,550
          </p>
        </div>
      </div>

      <div className="px-2.5 pb-2">
        <div
          className="flex items-center justify-between rounded-t px-1.5 py-0.5"
          style={{ background: thBg, color: thFg }}
        >
          <span className="text-[6.5px] font-semibold">Earnings</span>
          <span className="text-[6.5px] font-semibold">Amount</span>
        </div>
        <div className="border border-t-0" style={{ borderColor: "#e9ecef" }}>
          {[
            ["Basic", "₹34,000"],
            ["HRA", "₹13,600"],
          ].map(([n, a]) => (
            <div
              key={n}
              className="flex justify-between border-b px-1.5 py-0.5 last:border-0"
              style={{ borderColor: "#f1f3f5" }}
            >
              <span className="text-[7px]" style={{ color: primary }}>
                {n}
              </span>
              <span className="text-[7px]" style={{ color: muted }}>
                {a}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
