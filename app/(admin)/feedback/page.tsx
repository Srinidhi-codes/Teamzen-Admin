"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client/react";
import { FEEDBACK_LIST } from "@/lib/graphql/feedback/queries";
import {
  CREATE_FEEDBACK,
  REPLY_TO_FEEDBACK,
  UPDATE_FEEDBACK_STATUS,
  ESCALATE_FEEDBACK,
} from "@/lib/graphql/feedback/mutations";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/common/Pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import moment from "moment";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import {
  Bug,
  Sparkles,
  Heart,
  HelpCircle,
  Megaphone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  FileText,
  Check,
  User,
  Lock,
  UploadCloud,
  Inbox,
  Paperclip,
  ExternalLink,
  ImageIcon,
  X,
  Send,
  PlusCircle,
  Building,
  ArrowUpRight,
  Reply,
  Shield,
  Loader,
} from "lucide-react";

type FeedbackItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  status: string;
  visibility: string;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  attachmentCount?: number;
  organizationId?: string | null;
  organizationName?: string | null;
  escalatedToPlatform?: boolean;
  escalatedAt?: string | null;
  escalationNote?: string;
  author?: { id: string; firstName?: string; lastName?: string; email?: string };
  repliedBy?: { firstName?: string; lastName?: string } | null;
  escalatedBy?: { firstName?: string; lastName?: string } | null;
  attachments?: { id: string; fileName?: string; fileUrl?: string; createdAt?: string }[];
};

const CATEGORIES_CONFIG: Record<
  string,
  {
    label: string;
    short: string;
    icon: any;
    badgeClass: string;
    colorClass: string;
    description: string;
  }
> = {
  bug: {
    label: "Bug Report",
    short: "Bug",
    icon: Bug,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    colorClass: "text-rose-500",
    description: "Technical glitches, system lag, crashes, or broken behavior",
  },
  feature: {
    label: "Feature Request",
    short: "Feature",
    icon: Sparkles,
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
    colorClass: "text-purple-500",
    description: "New tools, workflow ideas, or product enhancements",
  },
  praise: {
    label: "Praise & Kudos",
    short: "Praise",
    icon: Heart,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    colorClass: "text-amber-500",
    description: "Team milestones, employee appreciation, or positive shoutouts",
  },
  general: {
    label: "General Inquiry",
    short: "General",
    icon: HelpCircle,
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    colorClass: "text-sky-500",
    description: "General questions, suggestions, or organizational thoughts",
  },
  admin_share: {
    label: "Company Broadcast",
    short: "Broadcast",
    icon: Megaphone,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    colorClass: "text-emerald-500",
    description: "Official announcements and company-wide notifications",
  },
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    step: number;
    badgeClass: string;
    dotClass: string;
    description: string;
  }
> = {
  open: {
    label: "Open",
    step: 1,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dotClass: "bg-amber-500",
    description: "Submitted and waiting for initial admin review",
  },
  in_progress: {
    label: "In Progress",
    step: 2,
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    dotClass: "bg-sky-500",
    description: "Actively under investigation by the administrative team",
  },
  resolved: {
    label: "Resolved",
    step: 3,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-500",
    description: "Addressed and finalized by company administrators",
  },
  closed: {
    label: "Closed",
    step: 3,
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
    description: "Ticket has been closed",
  },
};

function authorName(item: FeedbackItem) {
  const a = item.author;
  if (!a) return "Employee";
  const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
  return name || a.email || "Employee";
}

function mediaHref(url?: string | null) {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isImageAttachment(fileName?: string, fileUrl?: string) {
  const name = (fileName || fileUrl || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(name);
}

async function uploadAttachments(feedbackId: string, files: File[]) {
  for (const file of files) {
    const form = new FormData();
    form.append("feedback_id", feedbackId);
    form.append("file", file);
    await axios.post(`/api${API_ENDPOINTS.FEEDBACK_ATTACHMENTS}`, form, {
      withCredentials: true,
    });
  }
}

export default function FeedbackPage() {
  const { user } = useGraphQLUser();
  const isSuperadmin = user?.role === "superadmin";

  const [tab, setTab] = useState<"inbox" | "escalated" | "share" | "compose">("inbox");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Reply & Escalate State
  const [reply, setReply] = useState("");
  const [escalateNote, setEscalateNote] = useState("");
  const [showEscalateBox, setShowEscalateBox] = useState(false);

  // Compose State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [composeCategory, setComposeCategory] = useState("admin_share");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(FEEDBACK_LIST, {
    variables: {
      status: statusFilter === "all" ? undefined : statusFilter || undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter || undefined,
      organizationId: organizationId || undefined,
    },
    fetchPolicy: "network-only",
  }) as {
    data?: { feedbackList?: FeedbackItem[] };
    loading: boolean;
    error?: Error;
    refetch: () => void;
  };

  const [createFeedback] = useMutation<any>(CREATE_FEEDBACK);
  const [replyToFeedback, { loading: isReplying }] = useMutation<any>(REPLY_TO_FEEDBACK);
  const [updateStatus, { loading: isUpdatingStatus }] = useMutation<any>(UPDATE_FEEDBACK_STATUS);
  const [escalateFeedback, { loading: isEscalating }] = useMutation<any>(ESCALATE_FEEDBACK);

  // Raw list filtered by main tab view
  const tabFilteredItems = useMemo(() => {
    const list = data?.feedbackList || [];
    if (tab === "share") {
      return list.filter((i) => i.category === "admin_share" || i.visibility === "org");
    }
    if (tab === "escalated") {
      return list.filter((i) => i.escalatedToPlatform);
    }
    // "inbox": regular tickets submitted to company
    return list.filter((i) => i.category !== "admin_share");
  }, [data, tab]);

  // Secondary text search filtering
  const filteredItems = useMemo(() => {
    return tabFilteredItems.filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const aName = authorName(item).toLowerCase();
      const org = (item.organizationName || "").toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        aName.includes(q) ||
        org.includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [tabFilteredItems, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, categoryFilter, tab, organizationId]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // Active selected item
  const selected = useMemo(() => {
    if (filteredItems.length === 0) return null;
    return filteredItems.find((i) => i.id === selectedId) || filteredItems[0] || null;
  }, [filteredItems, selectedId]);

  const resetCompose = () => {
    setTitle("");
    setMessage("");
    setFiles([]);
    setComposeCategory("admin_share");
  };

  const handleCreate = async (asShare: boolean) => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (isSuperadmin && !organizationId) {
      toast.error("Please select an organization first");
      return;
    }
    setSaving(true);
    try {
      const { data: res } = await createFeedback({
        variables: {
          input: {
            title: title.trim(),
            message: message.trim(),
            category: asShare ? "admin_share" : composeCategory,
            visibility: asShare ? "org" : "private",
            ...(organizationId ? { organizationId } : {}),
          },
        },
      });
      const payload = res?.createFeedback;
      if (!payload?.success) {
        toast.error(payload?.error || "Failed to create feedback");
        return;
      }
      if (files.length && payload.feedback?.id) {
        await uploadAttachments(payload.feedback.id, files);
      }
      toast.success(asShare ? "Shared with organization" : "Feedback submitted");
      resetCompose();
      setTab(asShare ? "share" : "inbox");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create feedback");
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (newStatus: string = "in_progress") => {
    if (!selected) return;
    if (!reply.trim()) {
      toast.error("Write a reply message first");
      return;
    }
    try {
      const { data: res } = await replyToFeedback({
        variables: {
          input: { id: selected.id, reply: reply.trim(), status: newStatus },
        },
      });
      if (!res?.replyToFeedback?.success) {
        toast.error(res?.replyToFeedback?.error || "Reply failed");
        return;
      }
      toast.success("Reply recorded and status updated");
      setReply("");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Reply failed");
    }
  };

  const handleStatus = async (status: string) => {
    if (!selected) return;
    try {
      const { data: res } = await updateStatus({
        variables: { input: { id: selected.id, status } },
      });
      if (!res?.updateFeedbackStatus?.success) {
        toast.error(res?.updateFeedbackStatus?.error || "Status update failed");
        return;
      }
      toast.success(`Ticket marked as ${status.replace("_", " ")}`);
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Status update failed");
    }
  };

  const handleEscalate = async () => {
    if (!selected) return;
    try {
      const { data: res } = await escalateFeedback({
        variables: {
          input: { id: selected.id, note: escalateNote.trim() || undefined },
        },
      });
      if (!res?.escalateFeedback?.success) {
        toast.error(res?.escalateFeedback?.error || "Could not forward to Teamzen");
        return;
      }
      toast.success("Ticket forwarded to Teamzen platform team");
      setEscalateNote("");
      setShowEscalateBox(false);
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Could not forward to Teamzen");
    }
  };

  const countInbox = (data?.feedbackList || []).filter((i) => i.category !== "admin_share").length;
  const countEscalated = (data?.feedbackList || []).filter((i) => i.escalatedToPlatform).length;
  const countShares = (data?.feedbackList || []).filter((i) => i.category === "admin_share" || i.visibility === "org").length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="HELP & SUPPORT"
        title="Feedback & Support Management"
        description={
          isSuperadmin
            ? "Inspect tickets forwarded by company admins to Teamzen, manage company broadcasts, and review workforce resolutions."
            : "Review employee inquiries and bug reports, post official admin responses, forward platform bugs to Teamzen, or broadcast company updates."
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {isSuperadmin && (
              <OrganizationFilterSelect
                value={organizationId}
                onChange={setOrganizationId}
                placeholder="All Organizations"
              />
            )}
            <Button
              size="sm"
              onClick={() => setTab(tab === "compose" ? "inbox" : "compose")}
              className="gap-2 text-xs font-semibold cursor-pointer shadow-xs"
            >
              {tab === "compose" ? (
                <>
                  <Inbox className="w-3.5 h-3.5" />
                  <span>View Inbox</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ New Broadcast / Post</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("inbox")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
            tab === "inbox"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Company Inbox</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.2 text-[10px] font-bold",
              tab === "inbox"
                ? "bg-white/20 text-white"
                : "bg-muted-foreground/15 text-muted-foreground"
            )}
          >
            {countInbox}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("escalated")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
            tab === "escalated"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Forwarded to Teamzen</span>
          {countEscalated > 0 && (
            <span
              className={cn(
                "rounded-full px-2 py-0.2 text-[10px] font-bold",
                tab === "escalated"
                  ? "bg-white/20 text-white"
                  : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
              )}
            >
              {countEscalated}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("share")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
            tab === "share"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Organization Broadcasts</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.2 text-[10px] font-bold",
              tab === "share"
                ? "bg-white/20 text-white"
                : "bg-muted-foreground/15 text-muted-foreground"
            )}
          >
            {countShares}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("compose")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ml-auto",
            tab === "compose"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Submit Post / Share</span>
        </button>
      </div>

      {/* VIEW A: COMPOSE / SHARE NEW POST */}
      {tab === "compose" && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h3 className="text-base font-bold text-foreground">Create Feedback or Organization Broadcast</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publish company-wide announcements, share internal management notes, or document system feedback.
            </p>
          </div>

          <div className="space-y-5">
            {/* 1. Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                1. Select Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = composeCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setComposeCategory(key)}
                      className={cn(
                        "flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary"
                          : "bg-background border-border hover:bg-muted/40"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <div>
                        <p className={cn("text-xs font-bold", isSelected ? "text-primary" : "text-foreground")}>
                          {config.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {config.short}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Superadmin Target Org */}
            {isSuperadmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Target Organization <span className="text-destructive">*</span>
                </label>
                <OrganizationFilterSelect
                  value={organizationId}
                  onChange={setOrganizationId}
                  placeholder="Select organization to publish for..."
                />
              </div>
            )}

            {/* 2. Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                2. Title / Subject
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Maintenance Notice or Performance Review Guidelines..."
                className="text-xs sm:text-sm bg-background font-medium"
              />
            </div>

            {/* 3. Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                3. Announcement or Feedback Details
              </label>
              <Textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide detailed instructions, context, or updates for your workforce..."
                className="text-xs sm:text-sm bg-background leading-relaxed"
              />
            </div>

            {/* 4. Attachments */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                4. Attachments (Screenshots or documents)
              </label>
              <div
                onClick={() => document.getElementById("admin-feedback-upload")?.click()}
                className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/30 group"
              >
                <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto transition-colors" />
                <p className="text-xs font-medium text-foreground mt-2">
                  Click to browse or drop screenshots & documents
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Supports PNG, JPG, WEBP, PDF up to 10MB each
                </p>
                <input
                  id="admin-feedback-upload"
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                  className="hidden"
                />
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border bg-background text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate font-medium text-foreground">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTab("inbox")}
                className="h-9 px-4 text-xs cursor-pointer"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving || !title.trim() || !message.trim()}
                  onClick={() => handleCreate(false)}
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  Save as Internal Note
                </Button>
                <Button
                  size="sm"
                  disabled={saving || !title.trim() || !message.trim()}
                  onClick={() => handleCreate(true)}
                  className="h-9 px-5 gap-2 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {saving ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Share with Organization</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: MASTER-DETAIL TWO-SECTION INBOX (Matching Frontend Feedback Design) */}
      {tab !== "compose" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          {/* Top Filter & Search Toolbar */}
          <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex flex-col gap-3">
            {/* Category Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border/40">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer",
                  categoryFilter === "all"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                All Categories
              </button>
              {Object.entries(CATEGORIES_CONFIG).map(([catKey, config]) => {
                const Icon = config.icon;
                const isSelected = categoryFilter === catKey;
                const count = tabFilteredItems.filter((i) => i.category === catKey).length;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategoryFilter(catKey)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{config.short}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                        isSelected ? "bg-white/20 text-white" : "bg-muted-foreground/15 text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Status Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search tickets by title, author, org, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-background"
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

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground mr-1">Status:</span>
                <div className="flex items-center gap-1 p-0.5 bg-background rounded-lg border border-border/60">
                  {[
                    { id: "all", label: "All" },
                    { id: "open", label: "Open" },
                    { id: "in_progress", label: "In Progress" },
                    { id: "resolved", label: "Resolved" },
                    { id: "closed", label: "Closed" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatusFilter(s.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                        statusFilter === s.id
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Master-Detail Split Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-[640px] h-[calc(100vh-270px)] min-h-[720px] divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left Column: Tickets List */}
            <div className="overflow-y-auto divide-y divide-border/60 bg-muted/[0.08] custom-scrollbar flex flex-col">
              {loading && (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse border border-border/50" />
                  ))}
                </div>
              )}

              {!loading && filteredItems.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                        ? "No matching tickets"
                        : tab === "share"
                        ? "No organization broadcasts"
                        : tab === "escalated"
                        ? "No escalated tickets"
                        : "Inbox is clean"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">
                      {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                        ? "Try clearing filters to see all submissions."
                        : "New employee feedback tickets will appear here."}
                    </p>
                  </div>
                  {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setCategoryFilter("all");
                      }}
                      className="h-8 text-xs cursor-pointer"
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
              )}

              {!loading &&
                paginatedItems.map((item) => {
                  const isSelected = selected?.id === item.id;
                  const cat = CATEGORIES_CONFIG[item.category] || CATEGORIES_CONFIG.general;
                  const CatIcon = cat.icon;
                  const stat = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
                  const formattedDate = moment(item.createdAt).fromNow();
                  const hasReply = Boolean(item.adminReply);
                  const attachCount = item.attachments?.length || 0;
                  const aName = authorName(item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "w-full text-left p-4 transition-all duration-150 cursor-pointer flex flex-col gap-2 hover:bg-muted/30 border-l-4",
                        isSelected
                          ? "bg-card border-l-primary dark:border-l-[#38ABB1] shadow-xs"
                          : "border-l-transparent bg-transparent"
                      )}
                    >
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                              cat.badgeClass
                            )}
                          >
                            <CatIcon className="w-3 h-3" />
                            <span>{cat.short}</span>
                          </span>

                          {item.escalatedToPlatform && (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/25">
                              <Shield className="w-2.5 h-2.5" />
                              Teamzen
                            </span>
                          )}

                          {item.visibility === "org" && (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                              <Megaphone className="w-2.5 h-2.5" />
                              Broadcast
                            </span>
                          )}
                        </div>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            stat.badgeClass
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", stat.dotClass)} />
                          <span>{stat.label}</span>
                        </span>
                      </div>

                      {/* Title & Author */}
                      <div>
                        <h4
                          className={cn(
                            "text-sm font-bold tracking-tight transition-colors line-clamp-1",
                            isSelected
                              ? "text-primary dark:text-[#38ABB1]"
                              : "text-foreground hover:text-primary"
                          )}
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-medium text-foreground/80 truncate">
                            {aName}
                          </span>
                          {item.organizationName && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 truncate text-[10px] text-muted-foreground font-mono">
                                <Building className="w-2.5 h-2.5" />
                                {item.organizationName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Excerpt Message Preview */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Bottom Metadata */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3 text-muted-foreground/70" />
                          {formattedDate}
                        </span>

                        <div className="flex items-center gap-2">
                          {attachCount > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono">
                              <Paperclip className="w-3 h-3" />
                              <span>{attachCount}</span>
                            </span>
                          )}

                          {hasReply && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              <Check className="w-2.5 h-2.5" />
                              Replied
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

              {totalPages > 1 && (
                <div className="p-2 border-t border-border/80 bg-card/60 shrink-0">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    total={filteredItems.length}
                    pageSize={pageSize}
                    label="tickets"
                  />
                </div>
              )}
            </div>

            {/* Right Column: Selected Ticket Details & Admin Action Center */}
            <div className="overflow-y-auto bg-card p-5 sm:p-6 flex flex-col justify-between custom-scrollbar">
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-primary dark:text-[#38ABB1]">
                    <Inbox className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Select a Ticket</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Choose any ticket from the left inbox to view full context, user details, review attachments, and post administrative replies.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Metadata Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(() => {
                        const cat = CATEGORIES_CONFIG[selected.category] || CATEGORIES_CONFIG.general;
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
                              cat.badgeClass
                            )}
                          >
                            <span>{cat.label}</span>
                          </span>
                        );
                      })()}

                      {(() => {
                        const stat = STATUS_CONFIG[selected.status] || STATUS_CONFIG.open;
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                              stat.badgeClass
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full", stat.dotClass)} />
                            <span>{stat.label}</span>
                          </span>
                        );
                      })()}

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground border border-border">
                        {selected.visibility === "org" ? (
                          <>
                            <Megaphone className="w-3 h-3 text-emerald-500" />
                            <span>Public Org Broadcast</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>Private Ticket</span>
                          </>
                        )}
                      </span>

                      {selected.organizationName && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground border border-border">
                          <Building className="w-3 h-3 text-primary" />
                          <span>{selected.organizationName}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{moment(selected.createdAt).format("MMM D, YYYY · h:mm A")}</span>
                    </div>
                  </div>

                  {/* Title & Submitter Information Card */}
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                      {selected.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px]">
                        {authorName(selected).charAt(0).toUpperCase()}
                      </div>
                      <span>
                        Submitted by <strong className="text-foreground">{authorName(selected)}</strong>
                      </span>
                      {selected.author?.email && (
                        <span className="text-muted-foreground">({selected.author.email})</span>
                      )}
                    </div>
                  </div>

                  {/* Teamzen Escalation Alert Banner */}
                  {selected.escalatedToPlatform && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-purple-600 dark:text-purple-400 block">
                          Forwarded to Teamzen Engineering Support
                        </span>
                        <p className="text-muted-foreground">
                          This issue was escalated by{" "}
                          <strong>
                            {selected.escalatedBy?.firstName
                              ? `${selected.escalatedBy.firstName} ${selected.escalatedBy.lastName || ""}`
                              : "Organization Admin"}
                          </strong>{" "}
                          on {moment(selected.escalatedAt || selected.createdAt).format("MMM D, YYYY")}.
                        </p>
                        {selected.escalationNote && (
                          <div className="mt-2 rounded-lg bg-background border border-purple-500/20 p-2.5 font-mono text-[11px] text-foreground">
                            Note: {selected.escalationNote}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resolution Progress Stepper */}
                  <div className="rounded-2xl bg-muted/30 border border-border/70 p-4 space-y-3">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Resolution Progress
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {/* Step 1: Submitted */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">1. Submitted</span>
                        <span className="text-[10px] text-muted-foreground">
                          {moment(selected.createdAt).format("MMM D")}
                        </span>
                      </div>

                      {/* Step 2: Reviewing */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            selected.status === "in_progress" ||
                              selected.status === "resolved" ||
                              selected.adminReply
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                          )}
                        >
                          {selected.status === "in_progress" ||
                          selected.status === "resolved" ||
                          selected.adminReply ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">2. Reviewing</span>
                        <span className="text-[10px] text-muted-foreground">
                          {selected.adminReply ? "Admin Responded" : "In queue"}
                        </span>
                      </div>

                      {/* Step 3: Resolution */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            selected.status === "resolved" || selected.status === "closed"
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {selected.status === "resolved" || selected.status === "closed" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">3. Resolution</span>
                        <span className="text-[10px] text-muted-foreground">
                          {selected.status === "resolved"
                            ? "Resolved"
                            : selected.status === "closed"
                            ? "Closed"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Description Box */}
                  <div className="rounded-2xl border border-border/80 bg-background/80 p-5 space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Description
                    </span>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">
                      {selected.message}
                    </p>
                  </div>

                  {/* Attachments Section */}
                  {selected.attachments && selected.attachments.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                        Attachments ({selected.attachments.length})
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selected.attachments.map((a) => {
                          const href = mediaHref(a.fileUrl);
                          const isImg = isImageAttachment(a.fileName, a.fileUrl);

                          return (
                            <div
                              key={a.id}
                              className="group rounded-xl border border-border bg-muted/20 hover:bg-muted/40 p-3 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden relative">
                                  {isImg && (href || a.fileUrl) ? (
                                    <Image
                                      src={href || a.fileUrl || ""}
                                      alt={a.fileName || "attachment"}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                      unoptimized
                                    />
                                  ) : isImg ? (
                                    <ImageIcon className="w-5 h-5" />
                                  ) : (
                                    <FileText className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {a.fileName || "Attachment"}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground">
                                    {isImg ? "Image File" : "Document"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isImg ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setPreview({
                                        src: href,
                                        name: a.fileName || "Attachment",
                                      })
                                    }
                                    className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>Preview</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(href, "_blank")}
                                    className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Official Admin Reply Thread */}
                  {selected.adminReply && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] via-card to-transparent p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              Official Admin Response
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                                Verified
                              </span>
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              {selected.repliedBy?.firstName
                                ? `${selected.repliedBy.firstName} ${selected.repliedBy.lastName || ""}`
                                : "Company Administrator"}
                            </p>
                          </div>
                        </div>

                        {selected.repliedAt && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {moment(selected.repliedAt).calendar()}
                          </span>
                        )}
                      </div>

                      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-foreground/95">
                        {selected.adminReply}
                      </p>
                    </div>
                  )}

                  {/* ========================================================
                      ADMIN ACTION CENTER & RESPONSE STUDIO
                     ======================================================== */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-5">
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
                      <div>
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Reply className="w-3.5 h-3.5 text-primary" />
                          Admin Actions &amp; Resolution
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Update ticket status or post an official verified response to the employee.
                        </p>
                      </div>

                      {/* Quick Status Buttons */}
                      <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border">
                        {[
                          { id: "open", label: "Open", color: "hover:text-amber-500" },
                          { id: "in_progress", label: "In Progress", color: "hover:text-sky-500" },
                          { id: "resolved", label: "Resolved", color: "hover:text-emerald-500" },
                          { id: "closed", label: "Closed", color: "hover:text-rose-500" },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => handleStatus(st.id)}
                            disabled={isUpdatingStatus}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                              selected.status === st.id
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : `text-muted-foreground ${st.color} hover:bg-muted`
                            )}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Admin Reply Form */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-foreground">
                        {selected.adminReply ? "Post Updated Reply" : "Compose Official Admin Response"}
                      </label>
                      <Textarea
                        rows={4}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type official reply explaining resolution, troubleshooting steps, or status update..."
                        className="text-xs sm:text-sm bg-background font-sans leading-relaxed"
                      />

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="text-[11px] text-muted-foreground">
                          Sending reply will notify the employee and mark status as In Progress.
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={isReplying || !reply.trim()}
                            onClick={() => handleReply("in_progress")}
                            className="h-8 px-4 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                          >
                            {isReplying ? (
                              <>
                                <Loader className="w-3 h-3 animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                <span>Send Reply</span>
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isReplying || !reply.trim()}
                            onClick={() => handleReply("resolved")}
                            className="h-8 px-3 gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 cursor-pointer"
                          >
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Reply &amp; Resolve</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Escalate / Forward to Teamzen Platform */}
                    {!selected.escalatedToPlatform && !isSuperadmin && (
                      <div className="pt-3 border-t border-border/60">
                        {!showEscalateBox ? (
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">System Bug or Platform Issue?</span>
                              <p className="text-[11px]">
                                Forward this ticket to Teamzen engineering support for platform investigation.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowEscalateBox(true)}
                              className="h-8 gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-500/10 border-purple-500/30 cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5 text-purple-500" />
                              <span>Forward to Teamzen</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                Forward Ticket to Teamzen Platform Team
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowEscalateBox(false)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <Input
                              value={escalateNote}
                              onChange={(e) => setEscalateNote(e.target.value)}
                              placeholder="Add an internal note or steps for Teamzen engineers (optional)..."
                              className="text-xs bg-background"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEscalateBox(false)}
                                className="h-7 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                disabled={isEscalating}
                                onClick={handleEscalate}
                                className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium"
                              >
                                {isEscalating ? "Forwarding..." : "Confirm & Forward"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Preview Overlay */}
      <PhotoOverlay
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        src={preview?.src}
        name={preview?.name}
      />
    </div>
  );
}
