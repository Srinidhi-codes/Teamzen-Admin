"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { HrOnboardingTourButton } from "@/components/onboarding/OnboardingTour";
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
    loading,
  } = useOnboardingMutations();
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

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
                  "Invite resent"
                )
              }
            >
              Resend invite
            </button>
            <button
              type="button"
              disabled={loading}
              className="rounded-lg border border-border px-3 py-2 text-sm"
              onClick={() =>
                run(
                  () => generateOffer({ variables: { onboardingId: id } }),
                  "Offer regenerated"
                )
              }
            >
              Generate offer
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
          {onboarding.offerLetter ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                {onboarding.offerLetter.status}
              </p>
              <p className="font-medium">{onboarding.offerLetter.subject}</p>
              {onboarding.offerLetter.pdfUrl && (
                <a
                  href={onboarding.offerLetter.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Download PDF
                </a>
              )}
              {onboarding.offerLetter.acceptedAt && (
                <p className="text-muted-foreground">
                  Accepted by {onboarding.offerLetter.acceptedName} on{" "}
                  {new Date(onboarding.offerLetter.acceptedAt).toLocaleString()}
                </p>
              )}
              <div
                className="prose prose-sm max-w-none rounded-lg border border-border bg-muted/20 p-3"
                dangerouslySetInnerHTML={{
                  __html: onboarding.offerLetter.bodyHtml,
                }}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No offer letter yet.</p>
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
                              rejectionReason: rejectReason[doc.id] || "Please re-upload",
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
