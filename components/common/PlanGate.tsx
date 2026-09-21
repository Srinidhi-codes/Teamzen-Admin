"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { planLabel, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface PlanGateProps {
  allowed: boolean;
  requiredPlan: PlanId;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** When true, hide children entirely instead of overlaying. */
  hideWhenLocked?: boolean;
}

export function PlanGate({
  allowed,
  requiredPlan,
  title,
  description,
  children,
  className,
  hideWhenLocked = false,
}: PlanGateProps) {
  if (allowed) return <>{children}</>;

  if (hideWhenLocked) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center",
          className
        )}
      >
        <Lock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
        <Link
          href="/settings?section=plan"
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Upgrade to {planLabel(requiredPlan)}
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none opacity-40 blur-[0.5px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/70 p-4 backdrop-blur-[1px]">
        <div className="max-w-sm rounded-xl border border-border bg-card p-5 text-center shadow-sm">
          <Lock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
          <Link
            href="/settings?section=plan"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Upgrade to {planLabel(requiredPlan)}
          </Link>
        </div>
      </div>
    </div>
  );
}
