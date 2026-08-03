"use client";

import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useStore } from "@/lib/store/useStore";
import {
  daysUntilExpiry,
  planLabel,
  shouldShowPlanExpiryBanner,
} from "@/lib/plans";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "teamzen_plan_banner_dismissed";

export function PlanExpiryBanner() {
  const { user: storeUser } = useStore();
  const { user: graphqlUser } = useGraphQLUser();
  const user = graphqlUser || storeUser;
  const [dismissed, setDismissed] = useState(true);

  const plan = user?.organization?.plan;
  const expiresAt =
    (user?.organization as { planExpiresAt?: string | null } | undefined)
      ?.planExpiresAt ?? null;
  const days = daysUntilExpiry(expiresAt);
  const visible = shouldShowPlanExpiryBanner(plan, expiresAt);

  useEffect(() => {
    if (!visible || days === null) {
      setDismissed(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(DISMISS_KEY);
      if (!raw) {
        setDismissed(false);
        return;
      }
      const parsed = JSON.parse(raw) as { dayKey?: string };
      const dayKey = `${expiresAt}:${days}`;
      setDismissed(parsed.dayKey === dayKey);
    } catch {
      setDismissed(false);
    }
  }, [visible, days, expiresAt]);

  if (!user || user.role === "superadmin" || !visible || dismissed || days === null) return null;

  const expired = days < 0;
  const dayText = expired
    ? `expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`
    : days === 0
      ? "expires today"
      : `${days} day${days === 1 ? "" : "s"} left`;

  const dismiss = () => {
    try {
      sessionStorage.setItem(
        DISMISS_KEY,
        JSON.stringify({ dayKey: `${expiresAt}:${days}` })
      );
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 border-b px-3 py-1.5 text-xs sm:text-sm",
        expired
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : days <= 7
            ? "border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200"
            : "border-sky-500/20 bg-sky-500/10 text-sky-900 dark:text-sky-200"
      )}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <p className="min-w-0 text-center leading-snug">
        <span className="font-medium">{planLabel(plan)} plan</span>
        {" · "}
        {dayText}
        {expiresAt ? (
          <span className="hidden sm:inline">
            {" "}
            (until {new Date(expiresAt).toLocaleDateString()})
          </span>
        ) : null}
      </p>
      <Link
        href="/settings?section=plan"
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-semibold text-foreground hover:bg-background"
      >
        Renew / upgrade
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
        aria-label="Dismiss plan banner for today"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
