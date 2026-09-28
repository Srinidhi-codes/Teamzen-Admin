"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_PAYROLL_ADJUSTMENT } from "@/lib/graphql/payroll/mutations";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MinusCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    month: number;
    year: number;
    onSuccess: () => void;
}

export function PayrollAdjustmentModal({ isOpen, onClose, user, month, year, onSuccess }: AdjustmentModalProps) {
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [type, setType] = useState<"earning" | "deduction">("deduction");

    const [createAdjustment, { loading }] = useMutation(CREATE_PAYROLL_ADJUSTMENT);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !reason) return;

        try {
            await createAdjustment({
                variables: {
                    userId: user.id,
                    month,
                    year,
                    amount: parseFloat(amount),
                    reason,
                    adjustmentType: type
                }
            });
            toast.success(`Adjustment added for ${user.firstName}`);
            setAmount("");
            setReason("");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg">
                <DialogHeader className="border-b border-border px-6 py-4">
                    <DialogTitle className="text-base font-semibold">Add adjustment</DialogTitle>
                    <p className="text-sm font-normal text-muted-foreground">
                        One-time adjustment for {user?.firstName} {user?.lastName}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
                    <div className="flex gap-1 rounded-md border border-border bg-muted/50 p-0.5">
                        <button
                            type="button"
                            onClick={() => setType("earning")}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                                type === "earning"
                                    ? "bg-card text-emerald-700 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <PlusCircle className="h-4 w-4" /> Bonus / add
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("deduction")}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                                type === "deduction"
                                    ? "bg-card text-rose-700 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <MinusCircle className="h-4 w-4" /> Fine / deduct
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Amount (₹)</label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 500"
                                className="h-9 tabular-nums"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Reason</label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Performance bonus or asset damage"
                                className="h-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-border pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                type === "earning"
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-rose-600 hover:bg-rose-700"
                            )}
                        >
                            {loading ? "Saving…" : type === "earning" ? "Add earning" : "Add deduction"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
