"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { FEEDBACK_LIST } from "@/lib/graphql/feedback/queries";
import {
  CREATE_FEEDBACK,
  REPLY_TO_FEEDBACK,
  UPDATE_FEEDBACK_STATUS,
} from "@/lib/graphql/feedback/mutations";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { FormTextarea } from "@/components/common/FormTextArea";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import {
  MessageSquarePlus,
  Paperclip,
  Reply,
  Share2,
  Inbox,
  ExternalLink,
  ImageIcon,
  X,
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
  author?: { id: string; firstName?: string; lastName?: string; email?: string };
  repliedBy?: { firstName?: string; lastName?: string } | null;
  attachments?: { id: string; fileName?: string; fileUrl?: string }[];
};

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function authorName(item: FeedbackItem) {
  const a = item.author;
  if (!a) return "Unknown";
  const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
  return name || a.email || "Unknown";
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
  const [tab, setTab] = useState<"inbox" | "compose" | "share">("inbox");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [organizationId, setOrganizationId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("admin_share");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);

  const { data, loading, error, refetch } = useQuery(FEEDBACK_LIST, {
    variables: {
      status: statusFilter || undefined,
      category: undefined,
      organizationId: organizationId || undefined,
    },
    fetchPolicy: "network-only",
    skip: tab === "compose",
  }) as {
    data?: { feedbackList?: FeedbackItem[] };
    loading: boolean;
    error?: Error;
    refetch: () => void;
  };

  const [createFeedback] = useMutation<any>(CREATE_FEEDBACK);
  const [replyToFeedback] = useMutation<any>(REPLY_TO_FEEDBACK);
  const [updateStatus] = useMutation<any>(UPDATE_FEEDBACK_STATUS);

  const items = useMemo(() => {
    const list = data?.feedbackList || [];
    if (tab === "share") {
      return list.filter((i) => i.category === "admin_share" || i.visibility === "org");
    }
    return list.filter((i) => i.category !== "admin_share");
  }, [data, tab]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) || items[0] || null,
    [items, selectedId]
  );

  const resetCompose = () => {
    setTitle("");
    setMessage("");
    setFiles([]);
  };

  const handleCreate = async (asShare: boolean) => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (isSuperadmin && !organizationId) {
      toast.error("Select an organization first");
      return;
    }
    setSaving(true);
    try {
      const { data: res } = await createFeedback({
        variables: {
          input: {
            title: title.trim(),
            message: message.trim(),
            category: asShare ? "admin_share" : category,
            visibility: asShare ? "org" : "private",
            ...(organizationId ? { organizationId } : {}),
          },
        },
      });
      const payload = res?.createFeedback;
      if (!payload?.success) {
        toast.error(payload?.error || "Failed to create");
        return;
      }
      if (files.length && payload.feedback?.id) {
        await uploadAttachments(payload.feedback.id, files);
      }
      toast.success(asShare ? "Shared with organization" : "Feedback created");
      resetCompose();
      setTab(asShare ? "share" : "inbox");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async () => {
    if (!selected) return;
    if (!reply.trim()) {
      toast.error("Write a reply first");
      return;
    }
    setSaving(true);
    try {
      const { data: res } = await replyToFeedback({
        variables: {
          input: { id: selected.id, reply: reply.trim(), status: "in_progress" },
        },
      });
      if (!res?.replyToFeedback?.success) {
        toast.error(res?.replyToFeedback?.error || "Reply failed");
        return;
      }
      toast.success("Reply sent");
      setReply("");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Reply failed");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (status: string) => {
    if (!selected) return;
    try {
      const { data: res } = await updateStatus({
        variables: { input: { id: selected.id, status } },
      });
      if (!res?.updateFeedbackStatus?.success) {
        toast.error(res?.updateFeedbackStatus?.error || "Update failed");
        return;
      }
      toast.success("Status updated");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Feedback"
        description="Review employee feedback, reply with context, and share updates with the organization."
        actions={
          isSuperadmin ? (
            <OrganizationFilterSelect
              value={organizationId}
              onChange={setOrganizationId}
              placeholder="Select organization"
            />
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {[
          { id: "inbox" as const, label: "Inbox", icon: Inbox },
          { id: "compose" as const, label: "New note", icon: MessageSquarePlus },
          { id: "share" as const, label: "Org shares", icon: Share2 },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "compose" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Create feedback / share</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Use “Share with org” for company-wide posts. Attachments up to 10MB each.
            {isSuperadmin && " Superadmins must select an organization above first."}
          </p>
          <div className="mt-5 space-y-4">
            {isSuperadmin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Organization</label>
                <OrganizationFilterSelect
                  value={organizationId}
                  onChange={setOrganizationId}
                  placeholder="Select organization to share with"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short title"
                className="w-full rounded-2xl border border-border bg-background px-5 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <FormTextarea
              label="Message"
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the message…"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Attachments</label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {files.map((f) => (
                    <li key={f.name} className="flex items-center gap-2">
                      <Paperclip className="h-3 w-3" />
                      {f.name}
                      <button
                        type="button"
                        className="text-destructive"
                        onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={saving} onClick={() => handleCreate(true)}>
                {saving ? "Sharing…" : "Share with org"}
              </Button>
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setCategory("general");
                  handleCreate(false);
                }}
              >
                Save as internal note
              </Button>
            </div>
          </div>
        </div>
      )}

      {(tab === "inbox" || tab === "share") && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold">
                  {tab === "share" ? "Organization shares" : "All feedback"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading…" : `${items.length} items`}
                </p>
              </div>
              {tab === "inbox" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="max-h-[70vh] divide-y divide-border overflow-y-auto">
              {error && (
                <p className="px-4 py-6 text-center text-sm text-destructive">
                  Failed to load feedback: {error.message}
                </p>
              )}
              {items.length === 0 && !loading && !error && (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No feedback yet
                </p>
              )}
              {items.map((item) => {
                const active = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      active && "bg-muted/60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.title}
                      </p>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {authorName(item)}
                      {item.organizationName ? ` · ${item.organizationName}` : ""}
                      {" · "}
                      {new Date(item.createdAt).toLocaleDateString()}
                      {(item.attachments?.length || 0) > 0
                        ? ` · ${item.attachments!.length} file(s)`
                        : ""}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {item.message}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            {!selected ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Select an item to view details
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{selected.title}</h3>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {selected.category.replace("_", " ")}
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {selected.visibility}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    From {authorName(selected)} ·{" "}
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {selected.message}
                </p>

                {(selected.attachments?.length || 0) > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Attachments
                    </p>
                    <ul className="space-y-2">
                      {selected.attachments!.map((a) => {
                        const href = mediaHref(a.fileUrl);
                        const image = isImageAttachment(a.fileName, a.fileUrl);
                        if (image) {
                          return (
                            <li key={a.id}>
                              <button
                                type="button"
                                onClick={() =>
                                  setPreview({
                                    src: href,
                                    name: a.fileName || "Attachment",
                                  })
                                }
                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                              >
                                <ImageIcon className="h-3.5 w-3.5" />
                                {a.fileName || "Attachment"}
                              </button>
                            </li>
                          );
                        }
                        return (
                          <li key={a.id}>
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {a.fileName || "Attachment"}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {selected.adminReply && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Admin reply</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{selected.adminReply}</p>
                    {selected.repliedAt && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {selected.repliedBy
                          ? `${selected.repliedBy.firstName || ""} ${selected.repliedBy.lastName || ""}`.trim()
                          : "Admin"}{" "}
                        · {new Date(selected.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {selected.category !== "admin_share" && (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status</span>
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => handleStatus(s.value)}
                          className={cn(
                            "rounded-md border px-2 py-1 text-xs",
                            selected.status === s.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <FormTextarea
                      label="Reply to employee"
                      rows={4}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a helpful reply…"
                    />
                    <Button disabled={saving} onClick={handleReply}>
                      <Reply className="mr-2 h-4 w-4" />
                      {saving ? "Sending…" : "Send reply"}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <PhotoOverlay
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        src={preview?.src}
        name={preview?.name}
      />
    </div>
  );
}
