"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@apollo/client/react";
import { UPDATE_ORGANIZATION_PLAN } from "@/lib/graphql/organization/mutations";
import { GET_ME } from "@/lib/graphql/users/queries";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import {
  BILLING_CYCLES,
  PLAN_CATALOG,
  daysUntilExpiry,
  formatPlanPrice,
  normalizePlan,
  planBadgeClass,
  planLabel,
  type PlanId,
} from "@/lib/plans";
import { cn } from "@/lib/utils";

export function PlanBillingSection({ highlight = false }: { highlight?: boolean }) {
  const { user: storeUser, updateUser } = useStore();
  const { user: graphqlUser, refetch } = useGraphQLUser();
  const user = graphqlUser || storeUser;
  const currentPlan = normalizePlan(user?.organization?.plan);
  const expiresAt =
    (user?.organization as { planExpiresAt?: string | null } | undefined)
      ?.planExpiresAt ?? null;
  const daysLeft = daysUntilExpiry(expiresAt);

  const [cycle, setCycle] = useState<(typeof BILLING_CYCLES)[number]["id"]>("yearly");
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);

  const [updatePlan, { loading }] = useMutation(UPDATE_ORGANIZATION_PLAN, {
    refetchQueries: [{ query: GET_ME }],
  });

  const durationDays = useMemo(
    () => BILLING_CYCLES.find((c) => c.id === cycle)?.days ?? 365,
    [cycle]
  );

  const canManage =
    user?.role === "admin" || user?.role === "superadmin";

  /** Same-plan renew only on expiry day or after (not while still active). */
  const canRenewCurrentPlan =
    currentPlan === "free" || daysLeft === null || daysLeft <= 0;

  const handleSelect = async (plan: PlanId) => {
    if (!user?.organization?.id || !canManage) return;
    if (plan === currentPlan && plan === "free") {
      toast.message("You are already on Free");
      return;
    }
    if (plan === currentPlan && plan !== "free" && !canRenewCurrentPlan) {
      toast.message(
        daysLeft != null && daysLeft > 0
          ? `Plan is active. You can renew on the expiry date (${expiresAt ? new Date(expiresAt).toLocaleDateString() : "—"}).`
          : "Plan is still active. Renew on the expiry date."
      );
      return;
    }

    setPendingPlan(plan);
    try {
      const { data } = await updatePlan({
        variables: {
          organizationId: user.organization.id,
          plan,
          durationDays: plan === "free" ? null : durationDays,
        },
      });
      const updated = (data as any)?.updateOrganizationPlan;
      if (updated && user.organization) {
        updateUser({
          organization: {
            ...user.organization,
            plan: updated.plan,
            planExpiresAt: updated.planExpiresAt,
          } as any,
        });
      }
      await refetch?.();
      toast.success(
        plan === "free"
          ? "Switched to Free plan"
          : plan === currentPlan
            ? `${planLabel(plan)} plan renewed`
            : `${planLabel(plan)} plan activated`
      );
    } catch (e: any) {
      toast.error(e?.message || "Could not update plan");
    } finally {
      setPendingPlan(null);
    }
  };

  if (!user?.organization) return null;

  return (
    <section
      id="plan-billing"
      className={cn(
        "rounded-xl border border-border bg-card p-5",
        highlight && "ring-2 ring-primary/30"
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Plan & billing</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Change or renew your Teamzen plan. Same-plan renewal is available on the
            expiry date (or after). You can still upgrade to a higher plan anytime.
          </p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              planBadgeClass(currentPlan)
            )}
          >
            {planLabel(currentPlan)}
          </span>
          {currentPlan !== "free" && expiresAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {daysLeft !== null && daysLeft < 0
                ? `Expired ${Math.abs(daysLeft)}d ago`
                : daysLeft === 0
                  ? "Expires today"
                  : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
              {" · "}
              {new Date(expiresAt).toLocaleDateString()}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">No expiry on Free</p>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {BILLING_CYCLES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCycle(c.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              cycle === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {PLAN_CATALOG.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isUpgrade =
            PLAN_CATALOG.findIndex((p) => p.id === plan.id) >
            PLAN_CATALOG.findIndex((p) => p.id === currentPlan);
          const busy = loading && pendingPlan === plan.id;
          const price = formatPlanPrice(plan, cycle);
          const renewBlocked = isCurrent && plan.id !== "free" && !canRenewCurrentPlan;
          const buttonDisabled =
            !canManage ||
            busy ||
            (isCurrent && plan.id === "free") ||
            renewBlocked;

          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-lg border p-4",
                isCurrent ? "border-primary bg-primary/5" : "border-border bg-background"
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {price.primary}
                  </p>
                  {price.secondary ? (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{price.secondary}</p>
                  ) : null}
                </div>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{plan.blurb}</p>
              <ul className="mb-4 flex-1 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={buttonDisabled}
                onClick={() => handleSelect(plan.id)}
                className={cn(
                  "inline-flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-medium disabled:opacity-50",
                  renewBlocked || (isCurrent && plan.id === "free")
                    ? "border border-border bg-muted text-muted-foreground"
                    : isCurrent
                      ? "border border-border bg-background hover:bg-muted"
                      : isUpgrade || !isCurrent
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-muted text-muted-foreground"
                )}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrent && plan.id === "free" ? (
                  "Current plan"
                ) : renewBlocked ? (
                  "Active — renew on expiry"
                ) : isCurrent ? (
                  daysLeft !== null && daysLeft < 0 ? "Renew (expired)" : "Renew"
                ) : isUpgrade ? (
                  `Upgrade to ${plan.name}`
                ) : (
                  `Switch to ${plan.name}`
                )}
              </button>
              {renewBlocked && expiresAt ? (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Renew available on {new Date(expiresAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {!canManage && (
        <p className="mt-3 text-xs text-muted-foreground">
          Only organization admins can change the plan.
        </p>
      )}
    </section>
  );
}
