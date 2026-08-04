"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSkeleton, Skeleton } from "@/components/common/Skeleton";
import { HrOnboardingTourButton } from "@/components/onboarding/OnboardingTour";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  useOnboardingDetail,
  useOnboardingMutations,
} from "@/lib/graphql/onboarding/onboardingHook";

function formatJoinDate(value?: string | null) {
  if (!value) return "—";
  const m = moment(value);
  return m.isValid() ? m.format("DD MMM YYYY") : value;
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const m = moment(value);
  return m.isValid() ? m.format("DD MMM YYYY, hh:mm A") : value;
}
export default function OnboardingDetailPage({ id }: { id: string }) {
  const { onboarding, isLoading, error, refetch } = useOnboardingDetail(id);
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
  const [uploading, setUploading] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
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
        description={`${onboarding.userEmail} · ${onboarding.status.replace("_", " ")} · ${onboarding.progressPct}%`}
        actions={
          <div id="onboarding-detail-actions" className="flex flex-wrap gap-2">
            <HrOnboardingTourButton variant="detail" />
            <Link
              href="/onboarding"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              Back
            </Link>
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
                  className="cursor-pointer"
                  type="button"
                  disabled={activateLoading || headerBusy}
                  onClick={() =>
                    run(
                      () => activate({ variables: { onboardingId: id } }),
                      "Employee activated"
                    )
                  }
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
                  "Cancel"
                )}
              </Button>
            )}
          </div>
        }
      />

      {message && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-1">
          <h3 className="mb-3 font-semibold">Summary</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Department</dt>
              <dd>{onboarding.departmentName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Designation</dt>
              <dd>{onboarding.designationName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Join date</dt>
              <dd>{formatJoinDate(onboarding.joinDate)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Template</dt>
              <dd>{onboarding.templateName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Activated</dt>
              <dd>
                {onboarding.activatedAt
                  ? formatDateTime(onboarding.activatedAt)
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Offer letter</h3>

          <div className="mb-4 space-y-3 rounded-lg border border-border bg-muted/20 p-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeCtc}
                onChange={(e) => setIncludeCtc(e.target.checked)}
              />
              Include CTC annexure in generated PDF
            </label>
            {includeCtc && (
              <div>
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
                  Uses employee salary structure when available; otherwise a standard
                  Basic / HRA / Special Allowance split.
                </p>
              </div>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendAfterGenerate}
                onChange={(e) => setSendAfterGenerate(e.target.checked)}
              />
              Email offer PDF to candidate (also shows on their preboarding portal)
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="default"
                disabled={generateOfferLoading || uploading}
                onClick={() => handleGenerateOffer()}
              >
                {generateOfferLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate branded PDF"
                )}
              </Button>
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
                variant="outline"
                disabled={generateOfferLoading || uploading}
                onClick={() => offerFileRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  "Upload offer PDF"
                )}
              </Button>
              {onboarding.offerLetter?.pdfUrl && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={sendOfferEmailLoading}
                  onClick={() =>
                    run(
                      () => sendOfferEmail({ variables: { onboardingId: id } }),
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
                    "Email current PDF"
                  )}
                </Button>
              )}
            </div>
          </div>

          {onboarding.offerLetter ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                {onboarding.offerLetter.status}
                {onboarding.offerLetter.source
                  ? ` · ${onboarding.offerLetter.source}`
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
                  className="inline-flex text-primary underline"
                >
                  Download offer PDF
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
                <p className="text-muted-foreground">
                  Accepted by {onboarding.offerLetter.acceptedName} on{" "}
                  {formatDateTime(onboarding.offerLetter.acceptedAt)}
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
                <p className="font-medium">
                  {doc.category} · {doc.fileName || doc.title}
                </p>
                <p className="text-xs text-muted-foreground">
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
                    className="text-xs text-primary underline"
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
                <p className="text-xs text-muted-foreground">
                  {task.phase} · {task.assigneeRole}
                  {task.assigneeName ? ` · ${task.assigneeName}` : ""} · {task.status}
                  {task.dueAt ? ` · due ${formatJoinDate(task.dueAt)}` : ""}
                </p>
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
    </div>
  );
}
