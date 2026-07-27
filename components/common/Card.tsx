"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ title, children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 sm:p-6",
        hover && "transition-colors hover:bg-muted/30",
        className
      )}
    >
      {title && (
        <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      )}
      <div className="text-sm text-foreground/80 leading-relaxed">{children}</div>
    </div>
  );
}
