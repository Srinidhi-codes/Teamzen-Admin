import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const AUTH_INPUT_CLASS =
  "h-11 rounded-xl bg-background/80 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-[#38ABB1] dark:focus:border-[#38ABB1] focus:ring-4 focus:ring-[#38ABB1]/15 backdrop-blur-sm shadow-xs transition-all text-sm placeholder:text-muted-foreground/50";

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
        "relative group overflow-hidden inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#38ABB1] hover:bg-[#30969c] active:bg-[#28848a] text-sm font-semibold text-white shadow-md shadow-[#38ABB1]/25 hover:shadow-lg hover:shadow-[#38ABB1]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none",
        className
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

export function AuthDivider({ label = "Or continue with" }: { label?: string }) {
  return (
    <div className="relative flex items-center justify-center py-2 text-xs font-medium text-muted-foreground">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <span className="relative bg-card dark:bg-slate-900 px-3 py-0.5 rounded-full text-[11px] font-medium tracking-wide text-muted-foreground border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {label}
      </span>
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
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link
        href={href}
        className="font-semibold text-[#38ABB1] dark:text-[#4cd1d7] hover:text-[#2d9399] dark:hover:text-[#6ae3e9] transition-colors underline-offset-4 hover:underline"
      >
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
