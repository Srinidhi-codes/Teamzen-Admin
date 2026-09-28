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
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
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
