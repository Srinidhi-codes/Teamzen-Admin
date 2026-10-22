"use client";

import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import moment from "moment";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  UploadCloud,
  Send,
  User,
  Building,
  Search,
  Check,
  X,
  Loader,
  AlertCircle,
  FileCheck,
  Sparkles,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ORG_EMPLOYEE_DOCUMENT_REQUESTS,
  ISSUE_EMPLOYEE_DOCUMENT,
  REJECT_EMPLOYEE_DOCUMENT,
} from "@/lib/graphql/documents/queries";
import { FormSelect } from "@/components/common/FormSelect";
import { Pagination } from "@/components/common/Pagination";
import { useLetterTemplates } from "@/lib/graphql/onboarding/onboardingHook";

type StatusFilter = "pending" | "issued" | "rejected" | "all";

interface EmployeeRequestsPanelProps {
  organizationId?: string;
}

export default function EmployeeRequestsPanel({ organizationId }: EmployeeRequestsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  // Issue modal fields
  const [issueMode, setIssueMode] = useState<"template" | "upload">("upload");
  const [templateId, setTemplateId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [uploading, setUploading] = useState(false);

  const statusVar = statusFilter === "all" ? null : statusFilter;
  const { data, refetch, loading } = useQuery<{ orgEmployeeDocumentRequests: any[] }>(
    ORG_EMPLOYEE_DOCUMENT_REQUESTS,
    {
      variables: {
        status: statusVar,
        organizationId: organizationId || undefined,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const [issueReq, { loading: issuing }] = useMutation<{
    issueEmployeeDocument: { success: boolean; error?: string };
  }>(ISSUE_EMPLOYEE_DOCUMENT);
  const [rejectReq, { loading: rejecting }] = useMutation<{
    rejectEmployeeDocument: { success: boolean; error?: string };
  }>(REJECT_EMPLOYEE_DOCUMENT);

  const { templates: letterTemplates } = useLetterTemplates();

  const requests = data?.orgEmployeeDocumentRequests || [];

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const uName = (r.userName || "").toLowerCase();
      const uEmail = (r.userEmail || "").toLowerCase();
      const title = (r.customTitle || r.category || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      return uName.includes(q) || uEmail.includes(q) || title.includes(q) || reason.includes(q);
    });
  }, [requests, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, organizationId]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, page, pageSize]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (issueMode === "upload" && !file) {
      toast.error("Please select a PDF file to issue");
      return;
    }
    if (issueMode === "template" && !templateId) {
      toast.error("Please select a letter template");
      return;
    }

    try {
      if (issueMode === "upload" && file) {
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        form.append("user_id", selectedReq.userId);
        form.append(
          "title",
          selectedReq.category === "other" && selectedReq.customTitle
            ? selectedReq.customTitle
            : selectedReq.category.replace(/_/g, " ")
        );
        form.append("category", selectedReq.category);
        form.append("employee_request_id", selectedReq.id);

        const res = await fetch("/api/documents/issued/publish/", {
          method: "POST",
          body: form,
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Upload failed");
      } else {
        const res = await issueReq({
          variables: {
            input: {
              requestId: selectedReq.id,
              templateId,
            },
          },
        });
        if (res.data?.issueEmployeeDocument?.error) {
          throw new Error(res.data.issueEmployeeDocument.error);
        }
      }

      toast.success("Document issued and delivered to employee!");
      setIssueModalOpen(false);
      setFile(null);
      setTemplateId("");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to issue document");
    } finally {
      setUploading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }
    try {
      const res = await rejectReq({
        variables: {
          input: {
            requestId: selectedReq.id,
            reason: rejectReason.trim(),
          },
        },
      });
      if (res.data?.rejectEmployeeDocument?.error) {
        throw new Error(res.data.rejectEmployeeDocument.error);
      }
      toast.success("Request marked as declined");
      setRejectModalOpen(false);
      setRejectReason("");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to decline request");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by employee name, email, or certificate type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-medium text-muted-foreground mr-1 hidden md:inline">
            Status:
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-background rounded-lg border border-border/60">
            {(
              [
                { id: "pending", label: "Pending Review", badge: pendingCount },
                { id: "issued", label: "Issued & Sent" },
                { id: "rejected", label: "Declined" },
                { id: "all", label: "All Requests" },
              ] as { id: typeof statusFilter; label: string; badge?: number }[]
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  statusFilter === s.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{s.label}</span>
                {s.badge !== undefined && s.badge > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                      statusFilter === s.id
                        ? "bg-white/20 text-white"
                        : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {s.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filteredRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {searchQuery ? "No matching requests found" : "No requests in this view"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Employee certificate requests for bonafide, visa, and salary letters will appear here.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {paginatedRequests.map((req) => {
          const isPending = req.status === "pending";
          const isIssued = req.status === "issued";
          const isRejected = req.status === "rejected";

          return (
            <div
              key={req.id}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-xs transition-all flex flex-col justify-between gap-4",
                isPending
                  ? "shadow-sm"
                  : "border-border"
              )}
            >
              <div className="space-y-3">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                    {req.category?.replace(/_/g, " ")}
                  </span>

                  {isPending ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                      <Clock className="w-3 h-3" />
                      Pending Action
                    </span>
                  ) : isIssued ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      <Check className="w-3 h-3" />
                      Issued
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                      <X className="w-3 h-3" />
                      Declined
                    </span>
                  )}
                </div>

                {/* Submitter & Title */}
                <div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {(req.userName || "E").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0">
                      <span className="font-semibold text-foreground">{req.userName}</span>
                      {req.userEmail && <span>({req.userEmail})</span>}
                    </div>
                  </div>
                </div>

                {/* Stated Reason */}
                {req.reason && (
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground block mb-0.5">Employee Stated Purpose:</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{req.reason}</p>
                  </div>
                )}

                {/* Rejection Note */}
                {isRejected && req.rejectedReason && (
                  <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400">
                    <span className="font-bold block mb-0.5">Decline Reason:</span>
                    <p>{req.rejectedReason}</p>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground font-mono">
                  Requested {moment(req.createdAt).calendar()}
                  {isIssued && req.issuedAt && ` · Issued ${moment(req.issuedAt).calendar()}`}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                {isPending ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedReq(req);
                        setRejectReason("");
                        setRejectModalOpen(true);
                      }}
                      className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer"
                    >
                      Decline Request
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedReq(req);
                        setFile(null);
                        setTemplateId("");
                        setIssueMode("upload");
                        setIssueModalOpen(true);
                      }}
                      className="h-8 gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <span>Issue Document</span>
                    </Button>
                  </>
                ) : isIssued && req.issuedDocumentUrl ? (
                  <div className="w-full flex justify-end">
                    <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold">
                      <a href={req.issuedDocumentUrl} target="_blank" rel="noreferrer">
                        <Download className="w-3.5 h-3.5 text-primary" />
                        <span>Download Issued File</span>
                      </a>
                    </Button>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">Request finalized</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={filteredRequests.length}
          pageSize={pageSize}
          label="requests"
        />
      )}

      {/* ========================================================
          ISSUE DOCUMENT MODAL
         ======================================================== */}
      {selectedReq && (
        <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <FileCheck className="w-4 h-4 text-primary" />
                Issue Certificate to {selectedReq.userName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Fulfill this request by uploading an official signed PDF or generating from corporate letter templates.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleIssue} className="space-y-4 pt-2">
              {/* Delivery Mode Toggle */}
              <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setIssueMode("upload")}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    issueMode === "upload"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Upload Signed PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIssueMode("template")}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    issueMode === "template"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Generate from Template
                </button>
              </div>

              {issueMode === "upload" ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Upload Official File (PDF)
                  </label>
                  <div
                    onClick={() => document.getElementById("issue-file-upload")?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/30 group"
                  >
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto transition-colors" />
                    <p className="text-xs font-medium text-foreground mt-2">
                      {file ? file.name : "Click to select certificate PDF"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {file ? `${(file.size / 1024).toFixed(0)} KB ready to publish` : "Supports PDF up to 10MB"}
                    </p>
                    <input
                      id="issue-file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Select Letter Template
                  </label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Choose template...</option>
                    {(letterTemplates || []).map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIssueModalOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploading || issuing}
                  className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {uploading || issuing ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Publish &amp; Send to Employee</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================
          DECLINE REQUEST MODAL
         ======================================================== */}
      {selectedReq && (
        <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
                <XCircle className="w-4 h-4" />
                Decline Document Request
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                State the reason why this document request cannot be issued. The employee will receive this note.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleReject} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reason for Declining
                </label>
                <Textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Requires manager approval first, or tenure prerequisite not met..."
                  className="text-xs bg-background leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRejectModalOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={rejecting}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {rejecting ? "Declining..." : "Confirm Decline"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
