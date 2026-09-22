import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const AUTH_INPUT_CLASS = "h-11 rounded-lg";

export function AuthSubmitButton({
  children,
  loading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function AuthDivider({ label = "Or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-8 text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link href={href} className="font-medium text-primary hover:underline">
        {label}
      </Link>
    </p>
  );
}

export function PasswordChecklist({
  criteria,
}: {
  criteria: { length: boolean; number: boolean; special: boolean; uppercase: boolean };
}) {
  const items = [
    { key: "length" as const, label: "8+ characters" },
    { key: "number" as const, label: "A number" },
    { key: "special" as const, label: "A special character" },
    { key: "uppercase" as const, label: "An uppercase letter" },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm font-medium text-foreground">Password requirements</p>
      <div className="grid grid-cols-2 gap-2.5 text-sm">
        {items.map((item) => {
          const ok = criteria[item.key];
          return (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-2 transition-colors",
                ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  ok ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-background"
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={cn("h-3 w-3", ok ? "opacity-100" : "opacity-0")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
