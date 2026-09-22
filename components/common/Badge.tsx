"use client";

interface BadgeProps {
  variant: "success" | "warning" | "danger" | "info" | "default";
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-primary/10 text-primary border-primary/20",
    default: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
