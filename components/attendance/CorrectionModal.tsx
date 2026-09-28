"use client";

import { useState } from "react";
import {
    X,
    Clock,
    Calendar,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Send,
    ShieldAlert
} from "lucide-react";
import moment from "moment";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    loginTime?: string | null;
    logoutTime?: string | null;
    correctionReason?: string | null;
};

type Props = {
    record: AttendanceRow;
    onClose: () => void;
    onSubmit?: (data: CorrectionPayload) => Promise<void> | void;
};

export type CorrectionPayload = {
    attendanceRecordId: string;
    correctedLoginTime: string;
    correctedLogoutTime: string;
    reason: string;
};

export function CorrectionModal({ record, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<CorrectionPayload>({
        attendanceRecordId: record.id,
        correctedLoginTime: record.loginTime ?? "",
        correctedLogoutTime: record.logoutTime ?? "",
        reason: record.correctionReason ?? "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const update = (key: keyof CorrectionPayload, value: string) => {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((e) => ({ ...e, [key]: "" }));
    };

    const validate = () => {
        const e: Record<string, string> = {};

        if (!form.correctedLoginTime) e.correctedLoginTime = "Required";
        if (!form.correctedLogoutTime) e.correctedLogoutTime = "Required";
        if (!form.reason || form.reason.length < 10)
            e.reason = "Justification must be at least 10 characters";

        if (form.correctedLoginTime && form.correctedLogoutTime) {
            const l = moment(`2000-01-01T${form.correctedLoginTime}`);
            const o = moment(`2000-01-01T${form.correctedLogoutTime}`);
            if (o.isSameOrBefore(l)) e.correctedLogoutTime = "Logout must be after login";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit?.(form);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[2.5rem] w-full max-w-xl shadow-3xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Clock className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight leading-none mb-2">Correction Request</h2>
                            <p className="text-muted-foreground text-sm font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                {moment(record.attendanceDate).format("dddd, MMMM DD, YYYY")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>


                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Comparison Banner */}
                    <div className="bg-muted p-4 rounded-2xl border border-border flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <span>Original: {record.loginTime || "--:--"}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                        <span>{record.logoutTime || "--:--"}</span>
                    </div>


                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Proposed Login</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <input
                                    type="time"
                                    step="1"
                                    value={form.correctedLoginTime}
                                    onChange={(e) => update("correctedLoginTime", e.target.value)}
                                    className={`w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-6 text-foreground font-bold focus:ring-2 transition-all ${errors.correctedLoginTime ? "focus:ring-destructive/20 border-destructive/50" : "focus:ring-primary/20 focus:border-primary"
                                        }`}
                                />
                            </div>
                            {errors.correctedLoginTime && (
                                <p className="text-[10px] text-destructive font-bold uppercase tracking-wider ml-2">{errors.correctedLoginTime}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Proposed Logout</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <input
                                    type="time"
                                    step="1"
                                    value={form.correctedLogoutTime}
                                    onChange={(e) => update("correctedLogoutTime", e.target.value)}
                                    className={`w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-6 text-foreground font-bold focus:ring-2 transition-all ${errors.correctedLogoutTime ? "focus:ring-destructive/20 border-destructive/50" : "focus:ring-primary/20 focus:border-primary"
                                        }`}
                                />
                            </div>
                            {errors.correctedLogoutTime && (
                                <p className="text-[10px] text-destructive font-bold uppercase tracking-wider ml-2">{errors.correctedLogoutTime}</p>
                            )}
                        </div>
                    </div>


                    {/* Reason */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            Justification
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <textarea
                                rows={3}
                                value={form.reason}
                                onChange={(e) => update("reason", e.target.value)}
                                className={`w-full bg-background border border-border rounded-3xl py-4 pl-12 pr-6 text-sm font-medium text-foreground focus:ring-2 transition-all outline-none placeholder:text-muted-foreground resize-none ${errors.reason ? "focus:ring-destructive/20 border-destructive/50" : "focus:ring-primary/20 focus:border-primary"
                                    }`}
                                placeholder="State clearly why this correction is required..."
                            />
                        </div>
                        {errors.reason && (
                            <p className="text-[10px] text-destructive font-bold uppercase tracking-wider ml-2">{errors.reason}</p>
                        )}
                    </div>

                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-border flex flex-col sm:flex-row justify-end gap-3 bg-muted/20 backdrop-blur-sm">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        disabled={loading}
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        {loading ? "Processing..." : "Submit Correction"}
                    </button>
                </div>

            </div>
        </div>
    );
}
