"use client";

import { cn } from "@/lib/utils";

interface StatProps {
  icon: any;
  label: string;
  value: string | number;
  index?: string | number;
  color?: string;
  gradient?: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function Stat({
  icon: Icon,
  label,
  value,
  color = "text-primary",
  gradient = "bg-primary/10",
  className,
  onClick,
  isActive,
}: StatProps) {
  const isComponent =
    typeof Icon === "function" ||
    (typeof Icon === "object" && Icon !== null && (Icon.$$typeof || Icon.render));

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-all",
        onClick && "cursor-pointer select-none hover:border-primary/50 hover:shadow-xs",
        isActive && "border-primary ring-2 ring-primary/30 bg-primary/[0.03]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            gradient,
            color
          )}
        >
          {isComponent ? <Icon className="h-4 w-4" /> : <div className="h-4 w-4">{Icon}</div>}
        </div>
      </div>
    </div>
  );
}
