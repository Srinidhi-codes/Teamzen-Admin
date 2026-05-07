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
import { Sparkles, MinusCircle, PlusCircle } from "lucide-react";

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
            <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-none rounded-[2rem] shadow-3xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                
                <DialogHeader className="p-8 pb-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-2xl font-black italic tracking-tight">Manual Adjustment</DialogTitle>
                        <p className="text-muted-foreground text-sm font-medium mt-1">Applying one-time factor for {user?.firstName} {user?.lastName}</p>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
                    <div className="flex gap-2 p-1 bg-muted rounded-2xl border border-border/50">
                        <button
                            type="button"
                            onClick={() => setType("earning")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                type === "earning" ? "bg-card shadow-sm text-emerald-600" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <PlusCircle className="w-3.5 h-3.5" /> Bonus/Add
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("deduction")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                type === "deduction" ? "bg-card shadow-sm text-rose-600" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <MinusCircle className="w-3.5 h-3.5" /> Fine/Deduct
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount (₹)</label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 500"
                                className="h-12 rounded-xl bg-muted/50 border-border focus:ring-primary/20 font-black text-lg tabular-nums"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reason / Factor</label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Performance Bonus or Asset Damage"
                                className="h-12 rounded-xl bg-muted/50 border-border focus:ring-primary/20 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 h-auto rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
                                type === "earning" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                            }`}
                        >
                            {loading ? "Processing..." : `Confirm ${type === "earning" ? "Addition" : "Deduction"}`}
                        </Button>
                        <Button type="button" variant="ghost" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
