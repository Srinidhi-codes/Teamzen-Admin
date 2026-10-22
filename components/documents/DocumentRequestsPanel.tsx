"use client";

import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import moment from "moment";
import {
  FileText,
  Clock,
  ExternalLink,
  PlusCircle,
  Search,
  Check,
  X,
  Loader,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Building,
  User,
  Calendar,
  XCircle,
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
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/common/Pagination";
import {
  CANCEL_DOCUMENT_REQUEST,
  ORGANIZATION_DOCUMENT_REQUESTS,
  REQUEST_EMPLOYEE_DOCUMENT,
  VERIFY_VAULT_DOCUMENT,
} from "@/lib/graphql/documents/queries";

const CATEGORIES = [
  { value: "id_proof", label: "Government ID Proof", desc: "Passport, Voter ID, or Driving License" },
  { value: "pan", label: "PAN Card", desc: "Permanent Account Number for tax compliance" },
  { value: "aadhaar", label: "Aadhaar Card", desc: "UIDAI National Identification Document" },
  { value: "bank_proof", label: "Bank Account Proof", desc: "Cancelled cheque or passbook with IFSC" },
  { value: "education", label: "Degree & Education", desc: "Degree certificates or marksheets" },
  { value: "exit_clearance", label: "Exit Clearance", desc: "Asset handover or signed relieving form" },
  { value: "hr_request", label: "General HR Requirement", desc: "Any official HR requirement form" },
  { value: "other", label: "Custom Document", desc: "Specify any custom compliance document" },
];

type StatusFilter = "open" | "fulfilled" | "cancelled" | "all";

type DocumentRequestRow = {
  id: string;
  title: string;
  category?: string | null;
  description?: string | null;
  status: string;
  dueAt?: string | null;
  createdAt: string;
  fulfilledAt?: string | null;
  userId: string;
  userName?: string | null;
  fileUrl?: string | null;
  verificationStatus?: string | null;
  fulfilledDocumentId?: string | null;
};

interface DocumentRequestsPanelProps {
  organizationId?: string;
}

export default function DocumentRequestsPanel({ organizationId }: DocumentRequestsPanelProps) {
  const { user: me } = useStore();
  const effectiveOrgId =
    organizationId !== undefined ? organizationId : me?.role === "superadmin" ? undefined : me?.organization?.id;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // New Request Form State
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("id_proof");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");

  // Fetch users for employee dropdown (filtered by organizationId)
  const { users } = useGraphQLUsers({
    page: 1,
    pageSize: 300,
    filters: {
      isActive: true,
      ...(effectiveOrgId ? { organizationId: effectiveOrgId } : {}),
    },
  });

  const employeeList = useMemo(
    () => (users || []).filter((u: any) => u.role === "employee"),
    [users]
  );

  const statusVar = statusFilter === "all" ? null : statusFilter;
  const { data, loading, refetch } = useQuery<{
    organizationDocumentRequests?: DocumentRequestRow[] | null;
  }>(ORGANIZATION_DOCUMENT_REQUESTS, {
    variables: {
      status: statusVar,
      organizationId: effectiveOrgId || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const [requestDoc, { loading: requesting }] = useMutation<any>(REQUEST_EMPLOYEE_DOCUMENT);
  const [cancelReq, { loading: cancelling }] = useMutation<any>(CANCEL_DOCUMENT_REQUEST);
  const [verifyDoc, { loading: verifying }] = useMutation<any>(VERIFY_VAULT_DOCUMENT);

  const requests = data?.organizationDocumentRequests || [];

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const uName = (r.userName || "").toLowerCase();
      const t = (r.title || "").toLowerCase();
      const c = (r.category || "").toLowerCase();
      return uName.includes(q) || t.includes(q) || c.includes(q);
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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please select an employee");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    try {
      const res = await requestDoc({
        variables: {
          input: {
            userId,
            title: title.trim(),
            category,
            description: description.trim(),
            dueAt: dueAt || null,
          },
        },
      });
      if (res.data?.requestEmployeeDocument?.error) {
        throw new Error(res.data.requestEmployeeDocument.error);
      }
      toast.success("Document requirement dispatched to employee!");
      setRequestModalOpen(false);
      setUserId("");
      setTitle("");
      setDescription("");
      setDueAt("");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to create request");
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      const res = await cancelReq({
        variables: { requestId: id },
      });
      if (res.data?.cancelDocumentRequest?.error) {
        throw new Error(res.data.cancelDocumentRequest.error);
      }
      toast.success("Request cancelled");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel request");
    }
  };

  const handleVerify = async (docId: string, approve: boolean, reason?: string) => {
    try {
      const res = await verifyDoc({
        variables: {
          documentId: docId,
          approve,
          rejectionReason: reason || undefined,
        },
      });
      if (res.data?.verifyVaultDocument?.error) {
        throw new Error(res.data.verifyVaultDocument.error);
      }
      toast.success(approve ? "Document approved & verified" : "Document rejected");
      setRejectModalOpen(false);
      setRejectionReason("");
      setSelectedDocId(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Verification update failed");
    }
  };

  const openCount = requests.filter((r) => r.status === "open").length;
  const fulfilledCount = requests.filter((r) => r.status === "fulfilled").length;

  return (
    <div className="space-y-4">
      {/* Top Search, Filters & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search requirements by employee, title, or category..."
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

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-0.5 bg-background rounded-lg border border-border/60">
            {(
              [
                { id: "open", label: "Open (Pending)", badge: openCount },
                { id: "fulfilled", label: "Fulfilled", badge: fulfilledCount },
                { id: "cancelled", label: "Cancelled" },
                { id: "all", label: "All" },
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

          <Button
            size="sm"
            onClick={() => setRequestModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Request Document</span>
          </Button>
        </div>
      </div>

      {/* Requests Grid */}
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
              {searchQuery ? "No matching document requirements" : "No requests found"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Click &quot;Request Document&quot; above to request employee KYC documents, PAN cards, or credentials.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {paginatedRequests.map((req) => {
          const isOpen = req.status === "open";
          const isFulfilled = req.status === "fulfilled";
          const isOverdue = req.dueAt && moment(req.dueAt).isBefore(moment(), "day") && isOpen;
          const isApproved = req.verificationStatus === "approved" || req.verificationStatus === "verified";
          const isRejected = req.verificationStatus === "rejected";

          return (
            <div
              key={req.id}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-xs transition-all flex flex-col justify-between gap-4",
                isOverdue
                  ? "border-rose-500/30 bg-rose-500/[0.02]"
                  : isFulfilled && !isApproved
                  ? "border-sky-500/30"
                  : "border-border hover:border-primary/40"
              )}
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                    {req.category?.replace(/_/g, " ")}
                  </span>

                  {isOpen ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                        isOverdue
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {isOverdue ? "Overdue" : "Pending Employee Upload"}
                    </span>
                  ) : isFulfilled ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                        isApproved
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                          : isRejected
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25"
                      )}
                    >
                      {isApproved ? (
                        <>
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </>
                      ) : isRejected ? (
                        <>
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          Uploaded &bull; Review Needed
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      Cancelled
                    </span>
                  )}
                </div>

                {/* Title & Employee */}
                <div>
                  <h4 className="text-base font-bold text-foreground">{req.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {(req.userName || "E").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-foreground">{req.userName}</span>
                  </div>
                </div>

                {/* Description */}
                {req.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {req.description}
                  </p>
                )}

                {/* Due Date & Timestamps */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                  {req.dueAt && (
                    <span className={cn(isOverdue && "text-rose-600 dark:text-rose-400 font-bold")}>
                      Due: {moment(req.dueAt).format("MMM D, YYYY")}
                    </span>
                  )}
                  <span>Created {moment(req.createdAt).calendar()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                {isOpen ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelRequest(req.id)}
                    className="h-8 text-xs text-muted-foreground hover:text-destructive cursor-pointer ml-auto"
                  >
                    Cancel Requirement
                  </Button>
                ) : isFulfilled ? (
                  <div className="w-full flex items-center justify-between gap-2">
                    {req.fileUrl ? (
                      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold">
                        <a href={req.fileUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Uploaded File</span>
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Uploaded</span>
                    )}

                    {req.fulfilledDocumentId && !isApproved && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocId(req.fulfilledDocumentId!);
                            setRejectModalOpen(true);
                          }}
                          className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerify(req.fulfilledDocumentId!, true)}
                          className="h-8 gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">Cancelled</span>
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
          label="requirements"
        />
      )}

      {/* ========================================================
          REQUEST DOCUMENT FROM EMPLOYEE MODAL
         ======================================================== */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <PlusCircle className="w-4 h-4 text-primary" />
              Request Document from Employee
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assign an official upload requirement to an employee. They will be notified via their portal and transactional email.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
            {/* Employee Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Assign to Employee <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select employee...</option>
                {employeeList.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat.value);
                      if (!title) setTitle(cat.label);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                      category === cat.value
                        ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary"
                        : "bg-background border-border hover:bg-muted/40"
                    )}
                  >
                    <p className={cn("text-xs font-bold", category === cat.value ? "text-primary" : "text-foreground")}>
                      {cat.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Requirement Title <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scanned PAN Card Copy"
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Instructions / Submission Guidelines
              </label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Please ensure your name and permanent account number are clearly visible..."
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Due Date
              </label>
              <Input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRequestModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={requesting}
                className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              >
                {requesting ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Send Requirement</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* REJECT MODAL */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <XCircle className="w-4 h-4" />
              Reject Document Submission
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide feedback for the employee explaining why this submission was rejected and what needs correction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Image was blurry or signature missing..."
              className="text-xs bg-background"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={verifying || !rejectionReason.trim()}
                onClick={() => {
                  if (selectedDocId) handleVerify(selectedDocId, false, rejectionReason);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {verifying ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
