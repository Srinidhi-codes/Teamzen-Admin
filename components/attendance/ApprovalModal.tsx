"use client";

import { useState } from "react";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
import moment from "moment";
import { Button } from "../ui/button";
import {
    X,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    MessageSquare,
    ArrowRight,
    Search,
    ShieldAlert,
    Calendar,
    User
} from "lucide-react";
import { FormTextarea } from "../common/FormTextArea";


type Props = {
    correction: AttendanceCorrection;
    onClose: () => void;
    onSubmit: (status: "approved" | "rejected", comments: string) => Promise<void> | void;
};

export function ApprovalModal({ correction, onClose, onSubmit }: Props) {
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (status: "approved" | "rejected") => {
        setLoading(true);
        try {
            await onSubmit(status, comments);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => moment(dateStr).format("dddd, MMMM DD, YYYY");
    const formatTime = (timeStr?: string | null) => timeStr ? moment(timeStr, "HH:mm:ss").format("hh:mm A") : "--:--";

    return (
        <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[2.5rem] w-full max-w-2xl shadow-3xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-linear-to-br from-primary/20 via-primary/5 to-background p-8 text-primary-foreground relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Calendar className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center text-primary shadow-inner border border-primary backdrop-blur-sm">
                            <span className="text-2xl font-black">
                                {correction.requestedBy?.firstName?.charAt(0) || <User className="w-8 h-8" />}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-3xl font-black text-primary tracking-tight leading-none">
                                    {correction.requestedBy?.firstName} {correction.requestedBy?.lastName}
                                </h2>
                                <span className="px-2.5 py-1 bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/10 backdrop-blur-md">
                                    {correction.requestedBy?.designation?.name || "Member"}
                                </span>
                            </div>
                            <p className="text-gray-500/70 text-xs font-bold flex items-center gap-2 tracking-wide">
                                Reviewing correction for {formatDate(correction.attendanceRecord.attendanceDate)}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-black hover:text-red-500 transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>


                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Comparison Engine */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* Connecting Arrow */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-sm items-center justify-center z-10 text-muted-foreground/60">
                            <ArrowRight className="w-5 h-5" />
                        </div>

                        <div className="bg-red-300/5 p-6 rounded-4xl border border-red-500/30 shadow-sm group hover:scale-105 transition-all duration-300">

                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 ml-1">Original Records</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-red-500 uppercase">Check In</span>
                                    <span className="text-sm font-black text-red-500">{formatTime(correction.attendanceRecord.loginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-red-500 uppercase">Check Out</span>
                                    <span className="text-sm font-black text-red-500">{formatTime(correction.attendanceRecord.logoutTime)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-300/5 p-6 rounded-4xl border border-green-500/30 group shadow-sm hover:scale-105 transition-all duration-300">

                            <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4 ml-1">Proposed Correction</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-green-500/60 uppercase">Check In</span>
                                    <span className="text-sm font-black text-green-500">{formatTime(correction.correctedLoginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-green-500/60 uppercase">Check Out</span>
                                    <span className="text-sm font-black text-green-500">{formatTime(correction.correctedLogoutTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Reason Section */}
                    <div className="bg-muted/50 p-6 rounded-3xl border border-border relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldAlert className="w-20 h-20 text-foreground" />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            <p className="text-[10px] font-black text-foreground tracking-tight uppercase">Employee Justification</p>
                        </div>
                        <p className="text-foreground/70 font-medium italic leading-relaxed text-sm">
                            "{correction.reason || "No formal justification provided for this request."}"
                        </p>
                    </div>

                    {/* Decision Comments */}
                    <div className="space-y-3">
                        <FormTextarea
                            label="Feedback"
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Provide constructive feedback for your decision..."
                        />

                    </div>

                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-border flex flex-col sm:flex-row justify-end gap-4 bg-muted/20 backdrop-blur-sm">
                    <button
                        onClick={onClose}
                        className="btn-ghost"
                        disabled={loading}
                    >
                        Dismiss
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSubmit("rejected")}
                            disabled={loading}
                            className="btn-destructive px-10 gap-3"
                        >
                            <XCircle className="w-5 h-5" />
                            Reject
                        </button>
                        <button
                            onClick={() => handleSubmit("approved")}
                            disabled={loading}
                            className="btn-primary px-12 gap-3"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Approve
                        </button>
                    </div>
                </div>


            </div>
        </div>
    );
}
