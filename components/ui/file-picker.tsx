"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

type FilePickerProps = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  emptyLabel?: string;
  files?: File[];
  onChange?: (files: File[]) => void;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function FilePicker({
  accept,
  multiple = false,
  disabled = false,
  label = "Choose file",
  emptyLabel = "No file chosen",
  files,
  onChange,
  className,
  variant = "outline",
  size = "default",
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = files ?? [];
  const summary =
    selected.length === 0
      ? emptyLabel
      : selected.length === 1
        ? selected[0].name
        : `${selected.length} files selected`;

  const setFiles = (next: File[]) => {
    onChange?.(next);
    if (next.length === 0 && inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {label}
      </Button>
      <span
        className="min-w-0 flex-1 truncate text-sm text-muted-foreground"
        title={summary}
      >
        {summary}
      </span>
      {selected.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={disabled}
          aria-label="Clear files"
          onClick={() => setFiles([])}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
