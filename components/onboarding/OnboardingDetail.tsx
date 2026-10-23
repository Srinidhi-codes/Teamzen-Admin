"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  Clock,
  Compass,
  Eye,
  Mail,
  Play,
  Trash2,
  UserCheck,
  ClipboardCheck,
  CheckSquare,
  Pencil,
  Users,
  Briefcase,
  Calendar,
  LayoutTemplate,
  FileText,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  Landmark,
  ShieldCheck,
  Laptop,
  FileBadge,
  Check,
  Loader2,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Upload,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { Skeleton } from "@/components/common/Skeleton";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { startHrOnboardingTour } from "@/components/onboarding/OnboardingTour";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  useOnboardingDetail,
  useOnboardingMutations,
} from "@/lib/graphql/onboarding/onboardingHook";
import type {
  EmployeeDocument,
  OnboardingTask,
  OfferLetter,
} from "@/lib/graphql/onboarding/types";
import { useStore } from "@/lib/store/useStore";
import { normalizePortalUrl } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatJoinDate(value?: string | Date | null) {
  if (value == null || value === "") return "—";
  if (typeof value === "string") {
    const day = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (day) {
      const m = moment(day[1], "YYYY-MM-DD", true);
      if (m.isValid()) return m.format("DD MMM YYYY");
    }
  }
  const m = moment(value);
  return m.isValid() ? m.format("DD MMM YYYY") : String(value);
}

function formatDateTime(value?: string | Date | null) {
  if (value == null || value === "") return "—";
  const m = moment(value);
  return m.isValid() ? m.format("DD MMM YYYY, hh:mm A") : String(value);
}

function getInitials(name: string) {
  if (!name) return "ON";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatStatus(status: string) {
  if (!status) return "Pending Activation";
  const s = status.toLowerCase();
  if (s === "invited" || s === "preboarding" || s === "pending") {
    return "Pending Activation";
  }
  if (s === "in_progress") return "In Progress";
  if (s === "completed") return "Completed";
  if (s === "cancelled") return "Cancelled";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAssignee(role?: string, name?: string | null) {
  if (name) return name;
  if (!role) return "Employee";
  const r = role.toLowerCase();
  if (r === "employee") return "Employee";
  if (r === "hr" || r === "admin" || r === "superadmin") return "HR Team";
  if (r === "it") return "IT Team";
  if (r === "manager") return "Manager";
  return role.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTaskIcon(taskTitle: string, category?: string) {
  const t = (taskTitle || "").toLowerCase();
  const c = (category || "").toLowerCase();

  if (t.includes("offer") || c.includes("offer")) {
    return <FileText className="h-4 w-4" />;
  }
  if (t.includes("personal") || t.includes("bank details") || t.includes("profile")) {
    return <Users className="h-4 w-4" />;
  }
  if (t.includes("id proof") || t.includes("identity") || t.includes("passport")) {
    return <FileBadge className="h-4 w-4" />;
  }
  if (t.includes("pan") || t.includes("tax")) {
    return <CreditCard className="h-4 w-4" />;
  }
  if (t.includes("aadhaar") || t.includes("biometric") || t.includes("fingerprint")) {
    return <Fingerprint className="h-4 w-4" />;
  }
  if (t.includes("bank proof") || t.includes("cheque") || t.includes("bank")) {
    return <Landmark className="h-4 w-4" />;
  }
  if (t.includes("kyc") || t.includes("verify") || t.includes("verification")) {
    return <ShieldCheck className="h-4 w-4" />;
  }
  if (t.includes("laptop") || t.includes("asset") || t.includes("hardware") || t.includes("it")) {
    return <Laptop className="h-4 w-4" />;
  }
  if (t.includes("email") || t.includes("account") || t.includes("slack") || t.includes("google")) {
    return <Mail className="h-4 w-4" />;
  }
  return <CheckSquare className="h-4 w-4" />;
}

function getActivateWarning(
  userName: string,
  tasks: OnboardingTask[],
  documents: EmployeeDocument[]
) {
  const openTasks = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "skipped"
  );
  const requiredOpen = openTasks.filter((t) => t.isRequired);
  const pendingDocs = documents.filter(
    (d) => d.verificationStatus === "pending"
  );
  const rejectedDocs = documents.filter(
    (d) => d.verificationStatus === "rejected"
  );
  const incomplete =
    openTasks.length > 0 ||
    pendingDocs.length > 0 ||
    rejectedDocs.length > 0;

  if (!incomplete) {
    return {
      incomplete: false,
      title: `Activate ${userName}?`,
      description:
        "Their account will become active and day-1+ onboarding tasks will be created.",
    };
  }

  const parts: string[] = [];
  if (requiredOpen.length > 0) {
    parts.push(
      `${requiredOpen.length} required task${requiredOpen.length === 1 ? "" : "s"} still open`
    );
  }
  const optionalOpen = openTasks.length - requiredOpen.length;
  if (optionalOpen > 0) {
    parts.push(
      `${optionalOpen} optional task${optionalOpen === 1 ? "" : "s"} still open`
    );
  }
  if (pendingDocs.length > 0) {
    parts.push(
      `${pendingDocs.length} document${pendingDocs.length === 1 ? "" : "s"} awaiting verification`
    );
  }
  if (rejectedDocs.length > 0) {
    parts.push(
      `${rejectedDocs.length} document${rejectedDocs.length === 1 ? "" : "s"} rejected`
    );
  }

  return {
    incomplete: true,
    title: `Activate ${userName} with incomplete preboarding?`,
    description: `${parts.join(". ")}. You can still activate; remaining work continues after day 1.`,
  };
}

export default function OnboardingDetailPage({ id }: { id: string }) {
  const { onboarding, isLoading, error, refetch } = useOnboardingDetail(id);
  const { setAssistantOpen, setAssistantQuery } = useStore();
  const {
    activate,
    cancel,
    completeTask,
    verifyDoc,
    sendInvite,
    generateOffer,
    sendOfferEmail,
    activateLoading,
    cancelLoading,
    completeTaskLoading,
    verifyDocLoading,
    sendInviteLoading,
    generateOfferLoading,
    sendOfferEmailLoading,
  } = useOnboardingMutations();

  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [includeCtc, setIncludeCtc] = useState(false);
  const [includeEvp, setIncludeEvp] = useState(true);
  const [annualCtc, setAnnualCtc] = useState("");
  const [sendAfterGenerate, setSendAfterGenerate] = useState(true);
  const [offerMode, setOfferMode] = useState<"generate" | "upload">("generate");
  const [uploading, setUploading] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [closeHireModalOpen, setCloseHireModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<OnboardingTask | null>(null);
  const [editSummaryOpen, setEditSummaryOpen] = useState(false);

  const offerFileRef = useRef<HTMLInputElement>(null);
  const headerBusy = activateLoading || cancelLoading || sendInviteLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6" aria-busy="true" aria-label="Loading onboarding">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !onboarding) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-destructive font-semibold">
          {(error as Error)?.message || "Onboarding not found"}
        </p>
        <Link href="/onboarding" className="text-primary hover:underline text-sm font-medium">
          ← Back to Onboarding
        </Link>
      </div>
    );
  }

  async function run(action: () => Promise<unknown>, okMsg: string) {
    try {
      const res: any = await action();
      const payload = res?.data?.sendPreboardingInvite;
      if (payload?.inviteUrl) {
        const cleanUrl = normalizePortalUrl(payload.inviteUrl);
        await navigator.clipboard?.writeText(cleanUrl).catch(() => undefined);
        toast.success(`Invite resent & link copied to clipboard`);
      } else {
        toast.success(okMsg);
      }
      refetch();
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Action failed";
      toast.error(errMsg);
    }
  }

  const activateWarning = getActivateWarning(
    onboarding.userName,
    onboarding.tasks,
    onboarding.documents
  );

  const totalTasks = onboarding.tasks.length;
  const completedTasks = onboarding.tasks.filter((t) => t.status === "completed").length;
  const progressPercentage =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : onboarding.progressPct || 0;

  async function handleGenerateOffer() {
    const ctcValue = annualCtc.trim() ? Number(annualCtc) : undefined;
    if (includeCtc && (ctcValue === undefined || Number.isNaN(ctcValue) || ctcValue <= 0)) {
      toast.error("Enter a valid annual CTC to include the annexure.");
      return;
    }
    await run(
      () =>
        generateOffer({
          variables: {
            input: {
              onboardingId: id,
              includeCtcAnnexure: includeCtc,
              annualCtc: includeCtc ? ctcValue : null,
              sendEmail: sendAfterGenerate,
            },
          },
        }),
      sendAfterGenerate
        ? "Offer PDF generated and emailed to candidate"
        : "Offer PDF generated successfully"
    );
  }

  async function handleUploadOffer(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("onboarding_id", id);
      form.append("send_email", sendAfterGenerate ? "true" : "false");
      const res = await axios.post(`/api${API_ENDPOINTS.ONBOARDING_OFFER_UPLOAD}`, form, {
        withCredentials: true,
      });
      if (!res.data?.success) {
        throw new Error(res.data?.error || "Upload failed");
      }
      toast.success(
        sendAfterGenerate
          ? "Offer PDF uploaded and emailed to candidate."
          : res.data?.warning || "Offer PDF uploaded successfully."
      );
      await refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (offerFileRef.current) offerFileRef.current.value = "";
    }
  }

  function handleViewTask(task: OnboardingTask) {
    const t = (task.title || "").toLowerCase();
    if (t.includes("offer") && onboarding?.offerLetter?.pdfUrl) {
      window.open(onboarding.offerLetter.pdfUrl, "_blank");
      return;
    }
    if (t.includes("kyc") || t.includes("upload") || t.includes("proof") || t.includes("document")) {
      setDocModalOpen(true);
      return;
    }
    setSelectedTaskDetails(task);
  }

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* 1. Header with Breadcrumbs and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: "Onboarding", href: "/onboarding" },
            { label: "Hires", href: "/onboarding" },
            { label: onboarding.userName },
          ]}
        />

        {/* Top Action Buttons */}
        <div id="onboarding-detail-actions" className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => startHrOnboardingTour("detail")}
            className="gap-1.5 h-9 rounded-xl border-border bg-card text-foreground hover:bg-muted text-xs sm:text-sm font-medium cursor-pointer shadow-xs"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
            Tour this hire
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={sendInviteLoading || headerBusy}
            onClick={() =>
              run(
                () => sendInvite({ variables: { onboardingId: id } }),
                "Invite resent (offer PDF attached if available)"
              )
            }
            className="gap-1.5 h-9 rounded-xl border-border bg-card text-foreground hover:bg-muted text-xs sm:text-sm font-medium cursor-pointer shadow-xs"
          >
            {sendInviteLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Mail className="h-4 w-4 text-muted-foreground" />
            )}
            Resend invite
          </Button>

          {onboarding.status !== "in_progress" &&
            onboarding.status !== "completed" &&
            onboarding.status !== "cancelled" && (
              <Button
                type="button"
                size="sm"
                disabled={activateLoading || headerBusy}
                onClick={() => setActivateModalOpen(true)}
                className="gap-1.5 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
              >
                {activateLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                Activate employee
              </Button>
            )}

          {onboarding.status !== "cancelled" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={cancelLoading || headerBusy}
              onClick={() => setCloseHireModalOpen(true)}
              className="gap-1.5 h-9 rounded-xl border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs sm:text-sm font-medium shadow-xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              Close hire
            </Button>
          )}
        </div>
      </div>

      {/* 2. Employee Profile & Progress Banner */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Large Initials Avatar */}
          <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-primary dark:bg-primary border border-indigo-100 dark:border-indigo-900/40 text-white dark:text-white flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 shadow-xs">
            {getInitials(onboarding.userName)}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {onboarding.userName}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Clock className="h-3.5 w-3.5" />
                {formatStatus(onboarding.status)}
              </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 mt-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground/80" />
                {onboarding.userEmail}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground/80" />
                Invited on {formatJoinDate(onboarding.startedAt || onboarding.joinDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end min-w-[240px]">
          <div className="flex items-center justify-between w-full md:justify-end gap-3 text-xs sm:text-sm">
            <span className="text-muted-foreground font-medium">Onboarding Progress</span>
            <span className="font-bold text-foreground text-sm sm:text-base">{progressPercentage}%</span>
          </div>
          <div className="w-full sm:w-64 h-2.5 bg-muted rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground mt-1.5">
            {completedTasks} of {totalTasks} tasks completed
          </span>
        </div>
      </div>

      {/* 3. Action Cards Row (Next Action & HR Checklist) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Card 1: Next Action */}
        <div className="rounded-2xl border border-primary dark:border-primary bg-primary/50 dark:bg-primary/20 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary dark:bg-primary flex items-center justify-center text-white dark:text-white shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm sm:text-base text-foreground truncate">
                Next Action: Activate Employee
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                Activate your employee to start the onboarding process.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setActivateModalOpen(true)}
            disabled={onboarding.status === "in_progress" || onboarding.status === "completed"}
            className="bg-primary hover:bg-primary/80 text-white rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold shrink-0 cursor-pointer shadow-xs"
          >
            Activate Employee
          </Button>
        </div>

        {/* Card 2: HR Checklist */}
        <div className="rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm sm:text-base text-foreground truncate">
                HR Checklist
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                Review and complete the mandatory HR checklist items.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              document.getElementById("onboarding-detail-tasks")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group relative overflow-hidden border-primary text-primary hover:bg-primary/10 rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-2">View Checklist</span>
            <ArrowRight className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100" />
          </Button>
        </div>
      </div>

      {/* 4. Middle 2-Column Section (Employee Summary & Offer Letter) */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: Employee Summary */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
              <h3 className="font-bold text-base sm:text-lg text-foreground">Employee Summary</h3>
              <button
                type="button"
                onClick={() => setEditSummaryOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary/70 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-3 text-muted-foreground font-medium">
                  <Users className="w-4 h-4 text-muted-foreground/70" />
                  Department
                </span>
                <span className="font-semibold text-foreground">{onboarding.departmentName || "Sales"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-3 text-muted-foreground font-medium">
                  <Briefcase className="w-4 h-4 text-muted-foreground/70" />
                  Designation
                </span>
                <span className="font-semibold text-foreground">{onboarding.designationName || "Operations Manager"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-3 text-muted-foreground font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground/70" />
                  Join Date
                </span>
                <span className="font-semibold text-foreground">{formatJoinDate(onboarding.joinDate)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-3 text-muted-foreground font-medium">
                  <LayoutTemplate className="w-4 h-4 text-muted-foreground/70" />
                  Template
                </span>
                <span className="font-semibold text-foreground">{onboarding.templateName || "Standard Onboarding"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Offer Letter */}
        <div id="onboarding-detail-offer" className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
            <h3 className="font-bold text-base sm:text-lg text-foreground">Offer Letter</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-3">
              {/* Toggle Mode */}
              <div className="flex rounded-lg p-0.5 bg-muted/60 border border-border/60 w-fit">
                <button
                  type="button"
                  onClick={() => setOfferMode("generate")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    offerMode === "generate"
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Generate PDF
                </button>
                <button
                  type="button"
                  onClick={() => setOfferMode("upload")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    offerMode === "upload"
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload PDF
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {offerMode === "generate" && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={includeCtc}
                        onChange={(e) => setIncludeCtc(e.target.checked)}
                        className="rounded border-border text-sky-600 focus:ring-sky-500"
                      />
                      Include CTC annexure in generated PDF
                    </label>
                    {includeCtc && (
                      <div className="pl-5 pt-1">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 text-xs max-w-[180px]"
                          placeholder="Annual CTC INR"
                          value={annualCtc}
                          onChange={(e) => setAnnualCtc(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={includeEvp}
                    onChange={(e) => setIncludeEvp(e.target.checked)}
                    className="rounded border-border text-sky-600 focus:ring-sky-500"
                  />
                  Include EVP link in offer letter
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {offerMode === "generate" ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={generateOfferLoading}
                    onClick={handleGenerateOffer}
                    className="bg-primary hover:bg-primary/70 text-white text-xs font-semibold rounded-lg px-4 cursor-pointer"
                  >
                    {generateOfferLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                    Generate PDF
                  </Button>
                ) : (
                  <>
                    <input
                      ref={offerFileRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadOffer(f);
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={uploading}
                      onClick={() => offerFileRef.current?.click()}
                      className="bg-primary hover:bg-primary/70 text-white text-xs font-semibold rounded-lg px-4 cursor-pointer"
                    >
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                      Upload PDF
                    </Button>
                  </>
                )}

                {onboarding.offerLetter?.pdfUrl ? (
                  <a
                    href={onboarding.offerLetter.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs font-medium rounded-lg px-3 cursor-pointer"
                    >
                      Preview Offer
                    </Button>
                  </a>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-xs font-medium rounded-lg px-3 opacity-60"
                  >
                    Preview Offer
                  </Button>
                )}
              </div>
            </div>

            {/* Offer Status Box */}
            <div>
              {onboarding.offerLetter ? (
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-800/50 p-4 flex items-center gap-3.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200 leading-tight">
                      {onboarding.offerLetter.status === "accepted" ? "Offer letter accepted" : "Offer letter sent"}
                    </p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/70 mt-1">
                      {onboarding.offerLetter.acceptedAt
                        ? `Accepted on ${formatDateTime(onboarding.offerLetter.acceptedAt)}`
                        : `Sent on ${formatDateTime(onboarding.offerLetter.signedUploadedAt || onboarding.startedAt || new Date())}`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No offer letter created yet. Generate or upload one.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Card: Onboarding Tasks (Full Width Table) */}
      <div id="onboarding-detail-tasks" className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground">Onboarding Tasks</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Track completion of all onboarding activities for this employee.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {completedTasks} of {totalTasks} completed
            </span>
            <div className="w-24 sm:w-32 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground">{progressPercentage}%</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-10">#</th>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-right sm:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {onboarding.tasks.map((task, idx) => {
                const isCompleted = task.status === "completed";
                const isSkipped = task.status === "skipped";

                return (
                  <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 text-muted-foreground font-medium text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center shrink-0">
                          {getTaskIcon(task.title, task.requiresDocumentCategory)}
                        </div>
                        <span className="font-semibold text-foreground text-xs sm:text-sm">
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          <Check className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      ) : isSkipped ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          Skipped
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium text-xs">
                      {task.dueAt ? formatJoinDate(task.dueAt) : "25 Oct 2026"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium text-xs">
                      {formatAssignee(task.assigneeRole, task.assigneeName)}
                    </td>
                    <td className="py-3 px-4">
                      {isCompleted ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTask(task)}
                          className="group relative h-8 w-20 overflow-hidden rounded-lg text-xs font-medium cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5 transition-transform duration-200 group-hover:-translate-x-2">
                            View
                          </span>
                          <ArrowRight className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={completingTaskId === task.id || completeTaskLoading}
                          onClick={async () => {
                            setCompletingTaskId(task.id);
                            try {
                              await run(
                                () => completeTask({ variables: { taskId: task.id } }),
                                "Task completed"
                              );
                            } finally {
                              setCompletingTaskId(null);
                            }
                          }}
                          className="group relative h-8 overflow-hidden rounded-lg px-3 text-xs font-semibold cursor-pointer"
                        >
                          {completingTaskId === task.id ? (
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Saving…
                            </span>
                          ) : (
                            <>
                              <span className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                Mark complete
                              </span>
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Activation */}
      <ConfirmationModal
        isOpen={activateModalOpen}
        onClose={() => setActivateModalOpen(false)}
        onConfirm={() =>
          run(
            () => activate({ variables: { onboardingId: id } }),
            "Employee activated"
          )
        }
        variant={activateWarning.incomplete ? "destructive" : "success"}
        title={activateWarning.title}
        description={activateWarning.description}
        confirmText={
          activateWarning.incomplete ? "Activate anyway" : "Activate"
        }
        cancelText="Cancel"
      />

      {/* Confirmation Modal for Closing Hire */}
      <ConfirmationModal
        isOpen={closeHireModalOpen}
        onClose={() => setCloseHireModalOpen(false)}
        onConfirm={() =>
          run(
            () => cancel({ variables: { onboardingId: id } }),
            "Onboarding cancelled"
          )
        }
        variant="destructive"
        title={`Close hire for ${onboarding.userName}?`}
        description="This will cancel the onboarding process for this employee."
        confirmText="Close Hire"
        cancelText="Cancel"
      />

      {/* Document & KYC Verification Modal */}
      <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              Document & KYC Verification
            </DialogTitle>
          </DialogHeader>

          <div id="onboarding-detail-docs" className="space-y-4 pt-2">
            {onboarding.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No documents uploaded yet by the candidate.
              </p>
            ) : (
              onboarding.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-border/80 bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-foreground capitalize">
                        {doc.title || doc.fileName || doc.category}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        Category: {doc.category}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                        doc.verificationStatus === "approved"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                          : doc.verificationStatus === "rejected"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200"
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    {doc.fileUrl ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View File
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">File not available</span>
                    )}

                    {doc.verificationStatus === "pending" && (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Rejection reason (if rejecting)"
                          className="h-8 text-xs w-48"
                          value={rejectReason[doc.id] || ""}
                          onChange={(e) =>
                            setRejectReason({
                              ...rejectReason,
                              [doc.id]: e.target.value,
                            })
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={verifyDocLoading}
                          onClick={() =>
                            run(
                              () =>
                                verifyDoc({
                                  variables: { documentId: doc.id, approve: true },
                                }),
                              "Document approved"
                            )
                          }
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3"
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={verifyDocLoading}
                          onClick={() =>
                            run(
                              () =>
                                verifyDoc({
                                  variables: {
                                    documentId: doc.id,
                                    approve: false,
                                    rejectionReason:
                                      rejectReason[doc.id] || "Please re-upload document with clear visibility",
                                  },
                                }),
                              "Document rejected"
                            )
                          }
                          className="h-8 text-xs px-3"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Details Modal */}
      {selectedTaskDetails && (
        <Dialog open={!!selectedTaskDetails} onOpenChange={() => setSelectedTaskDetails(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                {getTaskIcon(selectedTaskDetails.title, selectedTaskDetails.requiresDocumentCategory)}
                {selectedTaskDetails.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold capitalize">{selectedTaskDetails.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Phase</span>
                <span className="font-semibold uppercase">{selectedTaskDetails.phase}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Assigned To</span>
                <span className="font-semibold">
                  {formatAssignee(selectedTaskDetails.assigneeRole, selectedTaskDetails.assigneeName)}
                </span>
              </div>
              {selectedTaskDetails.dueAt && (
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-semibold">{formatJoinDate(selectedTaskDetails.dueAt)}</span>
                </div>
              )}
              {selectedTaskDetails.description && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1">Description</span>
                  <p className="p-2.5 rounded-lg bg-muted/40 text-foreground text-xs leading-relaxed">
                    {selectedTaskDetails.description}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Summary Modal */}
      <Dialog open={editSummaryOpen} onOpenChange={setEditSummaryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Pencil className="w-4 h-4 text-sky-600" />
              Edit Employee Summary
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs sm:text-sm">
            <p className="text-muted-foreground text-xs">
              To update full employee profile details, edit the employee record in the Employees directory.
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Department
                </label>
                <Input
                  disabled
                  value={onboarding.departmentName || "Sales"}
                  className="bg-muted text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Designation
                </label>
                <Input
                  disabled
                  value={onboarding.designationName || "Operations Manager"}
                  className="bg-muted text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Join Date
                </label>
                <Input
                  disabled
                  value={formatJoinDate(onboarding.joinDate)}
                  className="bg-muted text-foreground"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditSummaryOpen(false)}
              >
                Close
              </Button>
              <Link href={`/employees`}>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white"
                >
                  Go to Employees
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
