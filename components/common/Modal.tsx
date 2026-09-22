"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 text-sm text-foreground/80 leading-relaxed">
          {children}
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                confirmText
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
