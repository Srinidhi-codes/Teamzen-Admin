"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { FormSelect } from "@/components/common/FormSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSkeleton, Skeleton } from "@/components/common/Skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  APPROVE_FNF,
  CANCEL_OFFBOARDING,
  COMPLETE_OFFBOARDING_TASK,
  COMPUTE_FNF,
  EMPLOYEE_OFFBOARDING,
  GENERATE_EXIT_LETTER,
  MARK_FNF_PAID,
  RESEND_EXIT_INVITE,
  SKIP_OFFBOARDING_TASK,
} from "@/lib/graphql/offboarding/queries";
import { useLetterTemplates } from "@/lib/graphql/onboarding/onboardingHook";
import { OffboardingTourButton } from "@/components/offboarding/OffboardingTour";

function money(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

type OffboardingTask = {
  id: string;
  title: string;
  assigneeRole?: string | null;
  phase?: string | null;
  status?: string | null;
};

type ExitLetter = {
  id: string;
  letterType?: string | null;
  pdfUrl?: string | null;
  downloadUrl?: string | null;
};

type EmployeeOffboarding = {
  userName: string;
  userEmail?: string | null;
  status?: string | null;
  progressPct: number;
  organizationId?: string | null;
  tasks?: OffboardingTask[] | null;
  settlement?: {
    proRataSalary: number;
    leaveEncashment: number;
    netPayable: number;
    status?: string | null;
  } | null;
  letters?: ExitLetter[] | null;
};

export default function OffboardingDetail() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { data, loading, refetch } = useQuery<
    { employeeOffboarding?: EmployeeOffboarding | null },
    { offboardingId: string }
  >(EMPLOYEE_OFFBOARDING, {
    variables: { offboardingId: id },
    fetchPolicy: "cache-and-network",
  });
  const [bonus, setBonus] = useState("0");
  const [recoveries, setRecoveries] = useState("0");
  const [additions, setAdditions] = useState("0");
  const [deductions, setDeductions] = useState("0");

  const [experienceTemplateId, setExperienceTemplateId] = useState("");
  const [relievingTemplateId, setRelievingTemplateId] = useState("");
  
  const { templates: letterTemplates } = useLetterTemplates(
    data?.employeeOffboarding?.organizationId || undefined
  );

  const [computeFnf] = useMutation(COMPUTE_FNF);
  const [approveFnf] = useMutation(APPROVE_FNF);
  const [markPaid] = useMutation(MARK_FNF_PAID);
  const [genLetter] = useMutation(GENERATE_EXIT_LETTER);
  const [completeTask] = useMutation(COMPLETE_OFFBOARDING_TASK);
  const [skipTask] = useMutation(SKIP_OFFBOARDING_TASK);
  const [resendInvite] = useMutation(RESEND_EXIT_INVITE);
  const [cancelOb] = useMutation(CANCEL_OFFBOARDING);

  const ob = data?.employeeOffboarding;

  if (loading && !ob) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading offboarding">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <FormSkeleton />
          </div>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
      </div>
    );
  }
  if (!ob) {
    return <p className="p-6 text-sm text-muted-foreground">Not found</p>;
  }

  const run = async (fn: () => Promise<any>, ok = "Done") => {
    try {
      const res = await fn();
      const payload = Object.values(res.data || {})[0] as any;
      if (payload && payload.success === false) {
        toast.error(payload.error || "Failed");
        return;
      }
      if (payload?.inviteUrl) {
        toast.success(`Invite: ${payload.inviteUrl}`);
        await navigator.clipboard?.writeText(payload.inviteUrl).catch(() => undefined);
      } else {
        toast.success(ok);
      }
      await refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div id="offboarding-detail-header">
        <PageHeader
          title={ob.userName}
          backHref="/offboarding"
          description={`${ob.userEmail} · ${ob.status?.replace(/_/g, " ")} · ${ob.progressPct}%`}
          actions={
            <div id="offboarding-detail-actions" className="flex flex-wrap gap-2">
              <OffboardingTourButton variant="detail" />
              <Button
                variant="outline"
                onClick={() =>
                  run(() => resendInvite({ variables: { offboardingId: id } }), "Invite sent")
                }
              >
                Resend exit link
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  run(async () => {
                    await cancelOb({ variables: { offboardingId: id } });
                    router.push("/offboarding");
                    return { data: { cancelOffboarding: { success: true } } };
                  }, "Cancelled")
                }
              >
                Cancel offboarding
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card id="offboarding-tasks" className="space-y-3 p-4">
          <h3 className="font-medium">Tasks</h3>
          <Separator />
          <ul className="space-y-2">
            {(ob.tasks || []).map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {t.phase} · {t.assigneeRole} · {t.status}
                  </p>
                </div>
                {t.status !== "completed" && t.status !== "skipped" && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        run(
                          () =>
                            completeTask({
                              variables: { taskId: t.id, notes: "" },
                            }),
                          "Task completed"
                        )
                      }
                    >
                      Mark complete
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card id="offboarding-fnf" className="space-y-3 p-4">
          <h3 className="font-medium">F&F settlement</h3>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Bonus / gratuity</label>
              <Input value={bonus} onChange={(e) => setBonus(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Recoveries</label>
              <Input value={recoveries} onChange={(e) => setRecoveries(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Other additions</label>
              <Input value={additions} onChange={(e) => setAdditions(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Other deductions</label>
              <Input value={deductions} onChange={(e) => setDeductions(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={() =>
              run(
                () =>
                  computeFnf({
                    variables: {
                      input: {
                        offboardingId: id,
                        bonusGratuity: Number(bonus) || 0,
                        recoveries: Number(recoveries) || 0,
                        otherAdditions: Number(additions) || 0,
                        otherDeductions: Number(deductions) || 0,
                      },
                    },
                  }),
                "Settlement computed"
              )
            }
          >
            Compute 
          </Button>
          {ob.settlement && (
            <dl className="grid grid-cols-2 gap-1 text-sm">
              <dt>Pro-rata</dt>
              <dd className="text-right">{money(ob.settlement.proRataSalary)}</dd>
              <dt>Leave encashment</dt>
              <dd className="text-right">{money(ob.settlement.leaveEncashment)}</dd>
              <dt>Net payable</dt>
              <dd className="text-right font-semibold">{money(ob.settlement.netPayable)}</dd>
              <dt>Status</dt>
              <dd className="text-right capitalize">{ob.settlement.status}</dd>
            </dl>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                run(() => approveFnf({ variables: { offboardingId: id } }), "Approved")
              }
            >
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                run(() => markPaid({ variables: { offboardingId: id } }), "Marked paid")
              }
            >
              Mark paid
            </Button>
          </div>
        </Card>

        <Card id="offboarding-letters" className="space-y-3 p-4">
          <h3 className="font-medium">Letters</h3>
          <Separator />
          <div className="flex flex-col gap-3">
            {["experience", "relieving"].map((type) => {
              const options = letterTemplates
                .filter((t) => t.letterType === type)
                .map((t) => ({ value: t.id, label: t.name }));
              
              const val = type === "experience" ? experienceTemplateId : relievingTemplateId;
              const setVal = type === "experience" ? setExperienceTemplateId : setRelievingTemplateId;

              const generatedLetter = ob.letters?.find((l) => l.letterType === type);
              const href = generatedLetter?.downloadUrl || generatedLetter?.pdfUrl;

              return (
                <div key={type} className="flex flex-col gap-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize text-sm">{type} Letter</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {generatedLetter ? "Already issued. You can re-issue with a new template if needed." : "Select a template and issue to the employee."}
                      </p>
                    </div>
                    {href && (
                      <Button asChild variant="default" size="sm">
                        <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Preview
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <FormSelect
                        label=""
                        placeholder={`Default ${type} template`}
                        options={[{ value: "", label: `Default ${type} template` }, ...options]}
                        value={val}
                        onValueChange={setVal}
                      />
                    </div>
                    <Button
                      variant={generatedLetter ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        run(
                          () =>
                            genLetter({
                              variables: { 
                                offboardingId: id, 
                                letterType: type,
                                letterTemplateId: val || null
                              },
                            }),
                          `${type} letter issued`
                        )
                      }
                    >
                      {generatedLetter ? "Re-issue" : "Issue"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
}
