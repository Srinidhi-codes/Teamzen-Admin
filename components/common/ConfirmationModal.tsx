"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "destructive" | "warning" | "success";
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
}: ConfirmationModalProps) => {
  const variantConfig = {
    primary: {
      icon: Info,
      iconClass: "bg-primary/10 text-primary",
      buttonVariant: "default" as const,
    },
    destructive: {
      icon: XCircle,
      iconClass: "bg-destructive/10 text-destructive",
      buttonVariant: "destructive" as const,
    },
    warning: {
      icon: AlertTriangle,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      buttonVariant: "default" as const,
    },
    success: {
      icon: CheckCircle2,
      iconClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      buttonVariant: "default" as const,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                config.iconClass
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            className={
              variant === "warning"
                ? "bg-amber-600 text-white hover:bg-amber-600/90"
                : variant === "success"
                  ? "bg-emerald-600 text-white hover:bg-emerald-600/90"
                  : undefined
            }
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
