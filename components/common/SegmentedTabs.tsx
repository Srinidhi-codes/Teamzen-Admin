"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type SegmentedTab = {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  /** Small status chip (e.g. Pro) */
  badge?: string;
  domId?: string;
  /** Destructive underline/count when tab has validation errors */
  tone?: "default" | "destructive";
};

interface SegmentedTabsProps {
  tabs: SegmentedTab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SegmentedTabs({ tabs, value, onChange, className }: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "relative flex w-full flex-wrap gap-0 border-b border-border",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = value === tab.id;
        const destructive = tab.tone === "destructive";
        return (
          <button
            key={tab.id}
            id={tab.domId}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
              active
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
              destructive && "text-destructive"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && tab.count > 0 && (
              <span
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                  destructive
                    ? "bg-destructive text-destructive-foreground"
                    : active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
            {tab.badge ? (
              <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                {tab.badge}
              </span>
            ) : null}
            {active && (
              <span
                className={cn(
                  "absolute inset-x-2 -bottom-px h-0.5 rounded-full",
                  destructive ? "bg-destructive" : "bg-primary"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
