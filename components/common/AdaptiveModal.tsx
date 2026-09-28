"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface AdaptiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Custom class name for the DialogContent wrapper to override width (default is sm:max-w-xl) */
  className?: string;
}

/**
 * A highly adaptive, responsive modal wrapper for the project.
 * It strictly separates the header and the scrollable body, ensuring that
 * internal forms can utilize a sticky footer if needed.
 */
export function AdaptiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: AdaptiveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex max-h-[90vh] w-[95vw] flex-col gap-0 overflow-hidden p-0 sm:w-full ${
          className || "sm:max-w-xl"
        }`}
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left bg-card z-10">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        {/* The body of the modal. This is where forms and scrolling content live. */}
        <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col min-h-0 bg-background relative">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
