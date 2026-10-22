import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  eyebrow?: string;
  backHref?: string;
}

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function getDefaultEyebrow(title: React.ReactNode): string {
  if (typeof title !== "string") return "EXECUTIVE CONSOLE";
  const t = title.toLowerCase();
  if (t.includes("dashboard")) return "SYSTEM OVERVIEW";
  if (t.includes("employee")) return "WORKFORCE MANAGEMENT";
  if (t.includes("onboarding")) return "TALENT ACQUISITION & ONBOARDING";
  if (t.includes("offboarding")) return "SEPARATION & OFFBOARDING";
  if (t.includes("document")) return "DOCUMENT MANAGEMENT";
  if (t.includes("attendance")) return "ATTENDANCE & TIME TRACKING";
  if (t.includes("leave")) return "TIME OFF & LEAVES";
  if (t.includes("payroll")) return "COMPENSATION & PAYROLL";
  if (t.includes("organization")) return "TENANT & CLIENT MANAGEMENT";
  if (t.includes("performance")) return "PERFORMANCE & TALENT";
  if (t.includes("report")) return "ANALYTICS & INTELLIGENCE";
  if (t.includes("polic")) return "GOVERNANCE & POLICIES";
  if (t.includes("feedback") || t.includes("support")) return "HELP & SUPPORT";
  if (t.includes("email") || t.includes("template")) return "COMMUNICATIONS & AUTOMATIONS";
  if (t.includes("access") || t.includes("permission") || t.includes("role")) return "SECURITY & ACCESS GOVERNANCE";
  if (t.includes("security")) return "SYSTEM SECURITY & AUDIT";
  if (t.includes("setting")) return "CONFIGURATION & PREFERENCES";
  if (t.includes("notification") || t.includes("alert")) return "COMMUNICATIONS & ALERTS";
  if (t.includes("moderation")) return "CONTENT & PLATFORM MODERATION";
  if (t.includes("form 16") || t.includes("tax")) return "TAX & STATUTORY COMPLIANCE";
  return "EXECUTIVE CONSOLE";
}

/**
 * Shared page title — light, unboxed strip used across all admin routes.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  eyebrow,
  backHref,
}: PageHeaderProps) {
  const activeEyebrow = eyebrow || getDefaultEyebrow(title);

  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <div className="min-w-0 space-y-1.5">
          {activeEyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary dark:text-[#38ABB1]">
              {activeEyebrow}
            </p>
          )}
          <h1 className="text-[1.65rem] font-semibold leading-none tracking-tight text-foreground sm:text-[1.85rem]">
            {title}
          </h1>
          {description && (
            <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-0.5">
          {actions}
        </div>
      )}
    </header>
  );
}
