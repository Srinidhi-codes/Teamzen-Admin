import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
}

function Input({
  className,
  type,
  label,
  error,
  hint,
  suffix,
  icon,
  id,
  ...props
}: CustomInputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {props.required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          data-slot="input"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            suffix && "pr-12",
            error
              ? "border-destructive/50 focus:ring-destructive/20"
              : "hover:border-border",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export { Input };
