"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const COMPANY_ACCENTS = [
  { name: "teal", color: "#0F766E", label: "Teal" },
  { name: "slate", color: "#475569", label: "Slate" },
  { name: "blue", color: "#2563EB", label: "Blue" },
  { name: "green", color: "#16A34A", label: "Green" },
  { name: "indigo", color: "#4F46E5", label: "Indigo" },
  { name: "orange", color: "#EA580C", label: "Orange" },
  { name: "red", color: "#DC2626", label: "Red" },
  { name: "purple", color: "#7C3AED", label: "Purple" },
] as const;

export type CompanyAccent = (typeof COMPANY_ACCENTS)[number]["name"];

type AccentPickerProps = {
  value: string;
  onChange: (accent: CompanyAccent) => void;
  className?: string;
};

export function AccentPicker({ value, onChange, className }: AccentPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground">Company color theme</p>
      <p className="text-xs text-muted-foreground">
        Applied to the employee portal for this organization. Default is Teal.
      </p>
      <div className="flex flex-wrap gap-2.5 pt-1">
        {COMPANY_ACCENTS.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onChange(item.name)}
            title={item.label}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-shadow",
              value === item.name &&
                "ring-2 ring-foreground/25 ring-offset-2 ring-offset-background"
            )}
            style={{ backgroundColor: item.color }}
            aria-label={item.label}
          >
            {value === item.name && <Check className="h-3.5 w-3.5 text-white" />}
          </button>
        ))}
      </div>
    </div>
  );
}
