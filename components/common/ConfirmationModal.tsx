"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react'

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
    variant = "primary"
}: ConfirmationModalProps) => {

    const variantConfig = {
        primary: {
            icon: Info,
            iconClass: "bg-primary/10 text-primary",
            btnClass: "btn-primary",
            shadeClass: "from-primary/20",
        },
        destructive: {
            icon: XCircle,
            iconClass: "bg-destructive/10 text-destructive",
            btnClass: "btn-destructive",
            shadeClass: "from-destructive/20",
        },
        warning: {
            icon: AlertTriangle,
            iconClass: "bg-amber-500/10 text-amber-500",
            btnClass: "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20",
            shadeClass: "from-amber-500/20",
        },
        success: {
            icon: CheckCircle2,
            iconClass: "bg-emerald-500/10 text-emerald-500",
            btnClass: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20",
            shadeClass: "from-emerald-500/20",
        }
    }

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-4xl p-0 overflow-hidden border-none shadow-3xl">
                <div className={`bg-linear-to-br border-b ${config.shadeClass} via-background to-background p-8 relative`}>
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Icon className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl ${config.iconClass} flex items-center justify-center shadow-inner`}>
                            <Icon className="w-7 h-7" />
                        </div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Verification Protocol</div>
                    </div>

                    <DialogHeader className="relative z-10 text-left">
                        <DialogTitle className="text-2xl font-black text-foreground tracking-tight mb-2">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 bg-muted/10 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted rounded-xl active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`inline-flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-95 px-8 py-4 shadow-xl hover:opacity-95 hover:-translate-y-0.5 ${config.btnClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmationModal
