"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options?: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
  /** Used to scroll/focus the control after validation fails */
  name?: string;
}

export function FormSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  required,
  children,
  className,
  name,
}: FormSelectProps) {
  return (
    <div data-field={name || undefined}>
      <label className="text-sm font-medium text-foreground mb-1.5 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <Select
        // Radix Select treats "" as invalid and blanks the trigger — use undefined instead
        value={value || undefined}
        onValueChange={onValueChange}
      >
        <SelectTrigger className={cn("h-auto px-5 py-4 w-full bg-background border rounded-2xl text-sm font-medium text-foreground transition-all duration-300 focus:ring-4 focus:ring-primary/10",
          error ? "border-destructive/50" : "border-border focus:border-primary/50",
          className
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent position="popper" className="rounded-xl border-border" sideOffset={4}>
          {options
            ? options
                .filter((option) => option.value !== "")
                .map((option) => (
              <SelectItem key={option.value} value={option.value} className="rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                {option.label}
              </SelectItem>
            ))
            : children}
        </SelectContent>
      </Select>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>

  );
}
