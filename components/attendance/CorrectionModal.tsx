"use client";

import { useState } from "react";
import {
    X,
    Clock,
    Calendar,
    MessageSquare,
    ArrowRight,
    Send,
} from "lucide-react";
import moment from "moment";
import { Button } from "../ui/button";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4">
            <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Request correction</h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {moment(record.attendanceDate).format("dddd, MMMM DD, YYYY")}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-6 px-6 py-5">
                    {/* Comparison Banner */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        <span>Original: {record.loginTime || "--:--"}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                        <span>{record.logoutTime || "--:--"}</span>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Corrected check in</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <input
                                    type="time"
                                    step="1"
                                    value={form.correctedLoginTime}
                                    onChange={(e) => update("correctedLoginTime", e.target.value)}
                                    className={`h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 ${
                                        errors.correctedLoginTime
                                            ? "border-destructive/50 focus:ring-destructive/20"
                                            : "border-border focus:ring-primary/20 focus:border-primary"
                                    }`}
                                />
                            </div>
                            {errors.correctedLoginTime && (
                                <p className="text-xs text-destructive">{errors.correctedLoginTime}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Corrected check out</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <input
                                    type="time"
                                    step="1"
                                    value={form.correctedLogoutTime}
                                    onChange={(e) => update("correctedLogoutTime", e.target.value)}
                                    className={`h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 ${
                                        errors.correctedLogoutTime
                                            ? "border-destructive/50 focus:ring-destructive/20"
                                            : "border-border focus:ring-primary/20 focus:border-primary"
                                    }`}
                                />
                            </div>
                            {errors.correctedLogoutTime && (
                                <p className="text-xs text-destructive">{errors.correctedLogoutTime}</p>
                            )}
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Reason</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-3 text-muted-foreground">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            <textarea
                                rows={3}
                                value={form.reason}
                                onChange={(e) => update("reason", e.target.value)}
                                className={`w-full resize-none rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 ${
                                    errors.reason
                                        ? "border-destructive/50 focus:ring-destructive/20"
                                        : "border-border focus:ring-primary/20 focus:border-primary"
                                }`}
                                placeholder="Explain why this correction is needed…"
                            />
                        </div>
                        {errors.reason && (
                            <p className="text-xs text-destructive">{errors.reason}</p>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3 sm:flex-row">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={loading}>
                        {loading ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        {loading ? "Submitting…" : "Submit correction"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
