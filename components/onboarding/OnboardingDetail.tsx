"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { CheckCircle2Icon, CheckCircleIcon, CheckIcon, Loader2, TicketCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { FormSkeleton, Skeleton } from "@/components/common/Skeleton";
import { HrOnboardingTourButton } from "@/components/onboarding/OnboardingTour";
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

function formatJoinDate(value?: string | Date | null) {
  if (value == null || value === "") return "—";
  // GraphQL Date scalars arrive as YYYY-MM-DD — parse as calendar date (no TZ shift)
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
    description: `${parts.join(". ")}. You can still activate remaining work continues after day 1.`,
  };
}

type NextHrAction = {
  title: string;
  message: string;
  cta: string;
  scrollId?: string;
  askQuery?: string;
  primary?: "activate" | "invite";
};

function getNextHrActions(
  onboarding: {
    status: string;
    progressPct: number;
    offerLetter?: OfferLetter | null;
    documents: EmployeeDocument[];
    tasks: OnboardingTask[];
    userName: string;
  }
): NextHrAction[] {
  if (onboarding.status === "cancelled" || onboarding.status === "completed") {
    return [];
  }

  const actions: NextHrAction[] = [];
  const pendingDocs = onboarding.documents.filter(
    (d) => d.verificationStatus === "pending"
  );
  const rejectedDocs = onboarding.documents.filter(
    (d) => d.verificationStatus === "rejected"
  );
  const openTasks = onboarding.tasks.filter(
    (t) => t.status !== "completed" && t.status !== "skipped"
  );
  const openHrTasks = openTasks.filter((t) =>
    ["hr", "admin", "superadmin"].includes((t.assigneeRole || "").toLowerCase())
  );

  if (pendingDocs.length > 0) {
    actions.push({
      title: "Verify uploaded documents",
      message: `${pendingDocs.length} document(s) awaiting review for ${onboarding.userName}.`,
      cta: "Review documents",
      scrollId: "onboarding-detail-docs",
      askQuery:
        "What documents are still pending verification for this hire and what should HR check?",
    });
  } else if (rejectedDocs.length > 0) {
    actions.push({
      title: "Follow up on rejected docs",
      message: `${rejectedDocs.length} document(s) were rejected — confirm the candidate re-uploads.`,
      cta: "View documents",
      scrollId: "onboarding-detail-docs",
      askQuery: "Which documents were rejected and how should we follow up?",
    });
  }

  if (!onboarding.offerLetter) {
    actions.push({
      title: "Create offer letter",
      message: "No offer PDF yet. Generate a branded letter or upload one.",
      cta: "Open offer section",
      scrollId: "onboarding-detail-offer",
      askQuery: "Help me draft an offer letter for this hire.",
    });
  }

  if (
    onboarding.status !== "in_progress" &&
    onboarding.status !== "completed"
  ) {
    actions.push({
      title: "Ready to activate?",
      message:
        onboarding.progressPct >= 80
          ? "Preboarding looks far along — activate when you're ready for day 1."
          : "Activate when preboarding is ready; remaining tasks can continue after day 1.",
      cta: "Activate employee",
      primary: "activate",
      askQuery: "Is this hire ready to activate? Summarize open blockers.",
    });
  }

  if (openHrTasks.length > 0) {
    const next = [...openHrTasks].sort(
      (a, b) => a.sortOrder - b.sortOrder
    )[0];
    actions.push({
      title: "HR checklist item",
      message: `Next: ${next.title}`,
      cta: "Open tasks",
      scrollId: "onboarding-detail-tasks",
      askQuery: `Explain the onboarding task "${next.title}" and how HR should complete it.`,
    });
  }

  if (onboarding.status === "invited") {
    actions.unshift({
      title: "Resend invite",
      message: "Candidate is still invited — resend if they haven't joined yet.",
      cta: "Resend invite",
      primary: "invite",
      askQuery: "What's the invite status for this hire?",
    });
  }

  return actions.slice(0, 2);
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
  const [message, setMessage] = useState("");
  const [includeCtc, setIncludeCtc] = useState(false);
  const [annualCtc, setAnnualCtc] = useState("");
  const [sendAfterGenerate, setSendAfterGenerate] = useState(true);
  const [offerMode, setOfferMode] = useState<"generate" | "upload">("generate");
  const [uploading, setUploading] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const offerFileRef = useRef<HTMLInputElement>(null);
  const headerBusy =
    activateLoading || cancelLoading || sendInviteLoading;

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading onboarding">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <FormSkeleton />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
        </div>
      </div>
    );
  }
  if (error || !onboarding) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-destructive">
          {(error as Error)?.message || "Onboarding not found"}
        </p>
        <Link href="/onboarding" className="text-primary underline">
          Back
        </Link>
      </div>
    );
  }

  async function run(action: () => Promise<unknown>, okMsg: string) {
    setMessage("");
    try {
      await action();
      setMessage(okMsg);
      refetch();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed");
    }
  }

  const activateWarning = getActivateWarning(
    onboarding.userName,
    onboarding.tasks,
    onboarding.documents
  );
  const nextHrActions = getNextHrActions(onboarding);

  async function handleGenerateOffer() {
    const ctcValue = annualCtc.trim() ? Number(annualCtc) : undefined;
    if (includeCtc && (ctcValue === undefined || Number.isNaN(ctcValue) || ctcValue <= 0)) {
      setMessage("Enter a valid annual CTC to include the annexure.");
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
        ? "Offer PDF generated and emailed"
        : "Offer PDF generated"
    );
  }

  async function handleUploadOffer(file: File) {
    setUploading(true);
    setMessage("");
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
      setMessage(
        sendAfterGenerate
          ? "Offer PDF uploaded — visible on the hire's preboarding portal and emailed."
          : res.data?.warning ||
              "Offer PDF uploaded — visible on the hire's preboarding portal."
      );
      await refetch();
    } catch (e: any) {
      setMessage(e?.response?.data?.error || e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (offerFileRef.current) offerFileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={onboarding.userName}
        backHref="/onboarding"
        description={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{onboarding.userEmail}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="capitalize">{onboarding.status.replace("_", " ")}</span>
            <span className="text-muted-foreground/50">·</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-primary/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-in-out" 
                  style={{ width: `${onboarding.progressPct}%` }}
                />
              </div>
              <span className="font-semibold">{onboarding.progressPct}%</span>
            </div>
          </div>
        }
        actions={
          <div id="onboarding-detail-actions" className="flex flex-wrap gap-2">
            <HrOnboardingTourButton variant="detail" />
            <Button
            className="cursor-pointer"
              type="button"
              variant="outline"
              disabled={sendInviteLoading || headerBusy}
              onClick={() =>
                run(
                  () => sendInvite({ variables: { onboardingId: id } }),
                  "Invite resent (offer PDF attached if available)"
                )
              }
            >
              {sendInviteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Resend invite"
              )}
            </Button>
            {onboarding.status !== "in_progress" &&
              onboarding.status !== "completed" &&
              onboarding.status !== "cancelled" && (
                <Button
                  className="cursor-pointer bg-green-500 hover:bg-green-600"
                  type="button"
                  disabled={activateLoading || headerBusy}
                  onClick={() => setActivateModalOpen(true)}
                >
                  {activateLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Activating…
                    </>
                  ) : (
                    "Activate employee"
                  )}
                </Button>
              )}
            {onboarding.status !== "cancelled" && (
              <Button
                className="cursor-pointer"
                type="button"
                variant="destructive"
                disabled={cancelLoading || headerBusy}
                onClick={() =>
                  run(
                    () => cancel({ variables: { onboardingId: id } }),
                    "Onboarding cancelled"
                  )
                }
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  "Close Hire"
                )}
              </Button>
            )}
          </div>
        }
      />

      {nextHrActions.length > 0 && (
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Next HR action
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {nextHrActions.map((action) => (
              <div
                key={action.title}
                className="rounded-lg border border-border p-4 bg-gray-800"
              >
                <p className="text-sm font-semibold text-foreground">
                  {action.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {action.message}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => {
                      if (action.primary === "activate") {
                        setActivateModalOpen(true);
                        return;
                      }
                      if (action.primary === "invite") {
                        run(
                          () =>
                            sendInvite({ variables: { onboardingId: id } }),
                          "Invite resent (offer PDF attached if available)"
                        );
                        return;
                      }
                      if (action.scrollId) {
                        document
                          .getElementById(action.scrollId)
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }
                    }}
                  >
                    {action.cta}
                  </button>
                  {action.askQuery ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setAssistantQuery(action.askQuery!);
                        setAssistantOpen(true);
                      }}
                    >
                      Ask assistant
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {message && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-1">
          <h3 className="mb-3 font-semibold">Summary</h3>
          <hr className="mb-3 border-border" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="font-medium">Department</dt>
              <dd className="text-muted-foreground">{onboarding.departmentName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="font-medium">Designation</dt>
              <dd className="text-muted-foreground">{onboarding.designationName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="font-medium">Join date</dt>
              <dd className="text-muted-foreground">{formatJoinDate(onboarding.joinDate)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="font-medium">Template</dt>
              <dd className="text-muted-foreground">{onboarding.templateName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="font-medium">Activated</dt>
              <dd className="text-muted-foreground">
                {onboarding.activatedAt
                  ? formatDateTime(onboarding.activatedAt)
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div
          id="onboarding-detail-offer"
          className="rounded-xl border border-border bg-card p-4 lg:col-span-2"
        >
          <h3 className="mb-3 font-semibold">Offer letter</h3>
          <hr className="mb-3 border-border" />

          {onboarding.offerLetter?.status !== "accepted" && !onboarding.offerLetter?.acceptedAt && (
            <div className="mb-4 rounded-lg border border-border bg-muted/20 text-sm overflow-hidden">
              <div className="flex border-b border-border text-center">
                <button
                  type="button"
                  className={`flex-1 py-2 font-medium transition-colors ${
                    offerMode === "generate"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                  onClick={() => setOfferMode("generate")}
                >
                  Generate PDF
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 font-medium border-l border-border transition-colors ${
                    offerMode === "upload"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                  onClick={() => setOfferMode("upload")}
                >
                  Upload PDF
                </button>
              </div>

              <div className="p-4 space-y-4">
                {offerMode === "generate" && (
                  <>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeCtc}
                        onChange={(e) => setIncludeCtc(e.target.checked)}
                      />
                      Include CTC annexure in generated PDF
                    </label>
                    {includeCtc && (
                      <div className="pl-6">
                        <label className="mb-1 block text-xs text-muted-foreground">
                          Annual CTC (INR)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="w-full max-w-xs"
                          placeholder="e.g. 1200000"
                          value={annualCtc}
                          onChange={(e) => setAnnualCtc(e.target.value)}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Uses employee salary structure when available; otherwise a
                          standard Basic / HRA / Special Allowance split.
                        </p>
                      </div>
                    )}
                  </>
                )}

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendAfterGenerate}
                    onChange={(e) => setSendAfterGenerate(e.target.checked)}
                  />
                  Email offer PDF to candidate
                </label>

                <div className="flex flex-wrap gap-2 pt-2">
                  {offerMode === "generate" ? (
                    <Button
                      type="button"
                      variant="default"
                      disabled={generateOfferLoading || uploading || onboarding.offerLetter?.source === "generated"}
                      onClick={() => handleGenerateOffer()}
                    >
                      {generateOfferLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating…
                        </>
                      ) : onboarding.offerLetter?.source === "generated" ? (
                        "Already generated"
                      ) : (
                        "Generate branded PDF"
                      )}
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
                        variant="default"
                        disabled={generateOfferLoading || uploading}
                        onClick={() => offerFileRef.current?.click()}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          "Select & Upload PDF"
                        )}
                      </Button>
                    </>
                  )}

                  {onboarding.offerLetter?.pdfUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sendOfferEmailLoading}
                      onClick={() =>
                        run(
                          () =>
                            sendOfferEmail({ variables: { onboardingId: id } }),
                          "Offer letter emailed"
                        )
                      }
                    >
                      {sendOfferEmailLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Emailing…
                        </>
                      ) : (
                        "Resend email"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {onboarding.offerLetter ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className="capitalize">{onboarding.offerLetter.status}</span>
                {onboarding.offerLetter.source === "generated"
                  ? " (Generated from template)"
                  : onboarding.offerLetter.source === "uploaded"
                  ? " (Uploaded manually)"
                  : ""}
              </p>
              <p className="font-medium">{onboarding.offerLetter.subject}</p>
              {onboarding.offerLetter.includeCtcAnnexure && (
                <p className="text-muted-foreground">
                  CTC annexure included
                  {onboarding.offerLetter.annualCtc
                    ? ` · Annual CTC INR ${Number(
                        onboarding.offerLetter.annualCtc
                      ).toLocaleString()}`
                    : ""}
                </p>
              )}
              {onboarding.offerLetter.pdfUrl && (
                <a
                  href={onboarding.offerLetter.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-primary font-semibold"
                >
                  Preview offer PDF
                </a>
              )}
              {onboarding.offerLetter.signedPdfUrl && (
                <a
                  href={onboarding.offerLetter.signedPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 inline-flex text-emerald-700 underline"
                >
                  Download signed PDF
                </a>
              )}
              {onboarding.offerLetter.signedUploadedAt && (
                <p className="text-muted-foreground">
                  Signed copy uploaded{" "}
                  {formatDateTime(onboarding.offerLetter.signedUploadedAt)}
                </p>
              )}
              {onboarding.offerLetter.acceptedAt && (
                <p className="text-muted-foreground flex gap-2 items-center">
                  Accepted by {onboarding.offerLetter.acceptedName} on{" "}
                  {formatDateTime(onboarding.offerLetter.acceptedAt)} <CheckCircle2Icon className="h-4 w-4 text-green-500"/>
                </p>
              )}
              {onboarding.offerLetter.source !== "uploaded" && (
                <div
                  className="prose prose-sm max-w-none rounded-lg border border-border bg-muted/20 p-3"
                  dangerouslySetInnerHTML={{
                    __html: onboarding.offerLetter.bodyHtml,
                  }}
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No offer letter yet. Generate a branded PDF or upload your own.
            </p>
          )}
        </div>
      </div>

      <div id="onboarding-detail-docs" className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-semibold">Documents</h3>
        <div className="space-y-3">
          {onboarding.documents.length === 0 && (
            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
          )}
          {onboarding.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium capitalize">
                  {doc.category} · {doc.fileName || doc.title}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {doc.verificationStatus}
                  {doc.aiSuggestedCategory
                    ? ` · AI suggest: ${doc.aiSuggestedCategory}`
                    : ""}
                </p>
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary font-semibold"
                  >
                    View file
                  </a>
                )}
              </div>
              {doc.verificationStatus === "pending" && (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Reject reason"
                    className="h-8 text-xs"
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
                    size="xs"
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
                  >
                    {verifyDocLoading ? "…" : "Approve"}
                  </Button>
                  <Button
                    type="button"
                    size="xs"
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
                                rejectReason[doc.id] || "Please re-upload",
                            },
                          }),
                        "Document rejected"
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div id="onboarding-detail-tasks" className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-semibold">Tasks</h3>
        <div className="space-y-2">
          {onboarding.tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    {task.phase}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {task.assigneeRole}
                    {task.assigneeName ? ` (${task.assigneeName})` : ""}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                      task.status === "completed"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : task.status === "skipped"
                        ? "bg-muted text-muted-foreground"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.dueAt && (
                    <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      due {formatJoinDate(task.dueAt)}
                    </span>
                  )}
                  {task.completedAt && (
                    <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      completed {formatDateTime(task.completedAt)}
                    </span>
                  )}
                </div>
              </div>
              {task.status !== "completed" && task.status !== "skipped" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
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
                >
                  {completingTaskId === task.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Mark complete"
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

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
    </div>
  );
}
