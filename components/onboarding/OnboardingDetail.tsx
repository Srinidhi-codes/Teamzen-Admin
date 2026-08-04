"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import axios from "axios";
import { PageHeader } from "@/components/common/PageHeader";
import { HrOnboardingTourButton } from "@/components/onboarding/OnboardingTour";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  useOnboardingDetail,
  useOnboardingMutations,
} from "@/lib/graphql/onboarding/onboardingHook";

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
    loading,
  } = useOnboardingMutations();
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [includeCtc, setIncludeCtc] = useState(false);
  const [annualCtc, setAnnualCtc] = useState("");
  const [sendAfterGenerate, setSendAfterGenerate] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingSigned, setUploadingSigned] = useState(false);
  const offerFileRef = useRef<HTMLInputElement>(null);
  const signedFileRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading onboarding…</div>;
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
          ? "Offer PDF uploaded and emailed"
          : res.data?.warning || "Offer PDF uploaded"
      );
      refetch();
    } catch (e: any) {
      setMessage(e?.response?.data?.error || e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (offerFileRef.current) offerFileRef.current.value = "";
    }
  }

  async function handleUploadSigned(file: File) {
    setUploadingSigned(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("onboarding_id", id);
      form.append("mark_accepted", "true");
      const res = await axios.post(
        `/api${API_ENDPOINTS.ONBOARDING_SIGNED_OFFER_UPLOAD}`,
        form,
        { withCredentials: true }
      );
      if (!res.data?.success) {
        throw new Error(res.data?.error || "Signed upload failed");
      }
      setMessage("Signed offer letter uploaded");
      refetch();
    } catch (e: any) {
      setMessage(e?.response?.data?.error || e?.message || "Signed upload failed");
    } finally {
      setUploadingSigned(false);
      if (signedFileRef.current) signedFileRef.current.value = "";
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
            <button
              type="button"
              disabled={loading}
              className="rounded-lg border border-border px-3 py-2 text-sm"
              onClick={() =>
                run(
                  () => sendInvite({ variables: { onboardingId: id } }),
                  "Invite resent (offer PDF attached if available)"
                )
              }
            >
              Resend invite
            </button>
            {onboarding.status !== "in_progress" &&
              onboarding.status !== "completed" &&
              onboarding.status !== "cancelled" && (
                <button
                  type="button"
                  disabled={loading}
                  className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                  onClick={() =>
                    run(
                      () => activate({ variables: { onboardingId: id } }),
                      "Employee activated"
                    )
                  }
                >
                  Activate employee
                </button>
              )}
            {onboarding.status !== "cancelled" && (
              <button
                type="button"
                disabled={loading}
                className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700"
                onClick={() =>
                  run(
                    () => cancel({ variables: { onboardingId: id } }),
                    "Onboarding cancelled"
                  )
                }
              >
                Cancel
              </button>
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
              <dd>{onboarding.joinDate || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Template</dt>
              <dd>{onboarding.templateName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Activated</dt>
              <dd>
                {onboarding.activatedAt
                  ? new Date(onboarding.activatedAt).toLocaleString()
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
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
              Email PDF to candidate after generate / upload
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading || uploading}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
                onClick={() => handleGenerateOffer()}
              >
                {loading ? "Working…" : "Generate branded PDF"}
              </button>
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
              <button
                type="button"
                disabled={loading || uploading}
                className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
                onClick={() => offerFileRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload offer PDF"}
              </button>
              <input
                ref={signedFileRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadSigned(f);
                }}
              />
              <button
                type="button"
                disabled={loading || uploadingSigned}
                className="rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-900 disabled:opacity-50"
                onClick={() => signedFileRef.current?.click()}
              >
                {uploadingSigned ? "Uploading…" : "Upload signed offer"}
              </button>
              {onboarding.offerLetter?.pdfUrl && (
                <button
                  type="button"
                  disabled={loading}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 disabled:opacity-50"
                  onClick={() =>
                    run(
                      () => sendOfferEmail({ variables: { onboardingId: id } }),
                      "Offer letter emailed"
                    )
                  }
                >
                  Email current PDF
                </button>
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
                  {new Date(onboarding.offerLetter.signedUploadedAt).toLocaleString()}
                </p>
              )}
              {onboarding.offerLetter.acceptedAt && (
                <p className="text-muted-foreground">
                  Accepted by {onboarding.offerLetter.acceptedName} on{" "}
                  {new Date(onboarding.offerLetter.acceptedAt).toLocaleString()}
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
                  <input
                    placeholder="Reject reason"
                    className="rounded border border-border px-2 py-1 text-xs"
                    value={rejectReason[doc.id] || ""}
                    onChange={(e) =>
                      setRejectReason({
                        ...rejectReason,
                        [doc.id]: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
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
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded bg-rose-600 px-2 py-1 text-xs text-white"
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
                  </button>
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
                  {task.dueAt ? ` · due ${task.dueAt}` : ""}
                </p>
              </div>
              {task.status !== "completed" && task.status !== "skipped" && (
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs"
                  onClick={() =>
                    run(
                      () => completeTask({ variables: { taskId: task.id } }),
                      "Task completed"
                    )
                  }
                >
                  Mark complete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
