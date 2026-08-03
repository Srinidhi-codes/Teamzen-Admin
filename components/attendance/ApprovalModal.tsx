"use client";

import { useState } from "react";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
import moment from "moment";
import { Button } from "../ui/button";
import {
    X,
    CheckCircle2,
    XCircle,
    MessageSquare,
    ArrowRight,
    User,
    ScanFace
} from "lucide-react";
import { FormTextarea } from "../common/FormTextArea";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const AttendanceMap = dynamic(() => import("./AttendanceMap"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[220px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground sm:h-[300px]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading map…
        </div>
    )
});


type Props = {
    correction: AttendanceCorrection;
    onClose: () => void;
    onSubmit: (status: "approved" | "rejected", comments: string) => Promise<void> | void;
};

export function ApprovalModal({ correction, onClose, onSubmit }: Props) {
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);
    const [mapTab, setMapTab] = useState<"checkin" | "checkout">("checkin");

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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 p-0 sm:items-center sm:p-4">
            <div className="flex max-h-[calc(100dvh-0.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-lg sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl">
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:gap-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
                            {correction.requestedBy?.firstName?.charAt(0) || <User className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-foreground">
                                Review correction
                            </h2>
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                {correction.requestedBy?.firstName} {correction.requestedBy?.lastName}
                                {correction.requestedBy?.designation?.name && (
                                    <span className="text-muted-foreground/70"> · {correction.requestedBy.designation.name}</span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(correction.attendanceRecord.attendanceDate)}
                            </p>
                        </div>
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
                <div className="grow space-y-6 overflow-y-auto px-6 py-5">
                    {/* Comparison */}
                    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="hidden md:flex absolute left-1/2 top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                            <ArrowRight className="h-4 w-4" />
                        </div>

                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <h3 className="mb-3 text-sm font-medium text-foreground">Original records</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Check in</span>
                                    <span className="font-medium text-foreground">{formatTime(correction.attendanceRecord.loginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Check out</span>
                                    <span className="font-medium text-foreground">{formatTime(correction.attendanceRecord.logoutTime)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <h3 className="mb-3 text-sm font-medium text-foreground">Proposed correction</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Check in</span>
                                    <span className="font-medium text-foreground">{formatTime(correction.correctedLoginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Check out</span>
                                    <span className="font-medium text-foreground">{formatTime(correction.correctedLogoutTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(correction.attendanceRecord.faceVerified ||
                        correction.attendanceRecord.checkInSelfieUrl ||
                        correction.attendanceRecord.checkOutSelfieUrl) && (
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <ScanFace className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-medium text-foreground">Face verification</h3>
                                {correction.attendanceRecord.faceVerified && (
                                    <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                        Verified
                                        {correction.attendanceRecord.faceMatchScore != null &&
                                            ` · ${Number(correction.attendanceRecord.faceMatchScore).toFixed(2)}`}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {correction.attendanceRecord.checkInSelfieUrl && (
                                    <a
                                        href={correction.attendanceRecord.checkInSelfieUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block overflow-hidden rounded-md border border-border"
                                    >
                                        <img
                                            src={correction.attendanceRecord.checkInSelfieUrl}
                                            alt="Check-in selfie"
                                            className="h-16 w-16 object-cover"
                                        />
                                        <span className="block bg-muted px-1.5 py-0.5 text-center text-[10px] text-muted-foreground">
                                            In
                                        </span>
                                    </a>
                                )}
                                {correction.attendanceRecord.checkOutSelfieUrl && (
                                    <a
                                        href={correction.attendanceRecord.checkOutSelfieUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block overflow-hidden rounded-md border border-border"
                                    >
                                        <img
                                            src={correction.attendanceRecord.checkOutSelfieUrl}
                                            alt="Check-out selfie"
                                            className="h-16 w-16 object-cover"
                                        />
                                        <span className="block bg-muted px-1.5 py-0.5 text-center text-[10px] text-muted-foreground">
                                            Out
                                        </span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Geolocation Verification Map */}
                    {(() => {
                        const record = correction.attendanceRecord;
                        const hasCheckInGeo = !!(record?.loginLatitude && record?.loginLongitude && record?.officeLocation?.latitude && record?.officeLocation?.longitude);
                        const hasCheckOutGeo = !!(record?.logoutLatitude && record?.logoutLongitude && record?.officeLocation?.latitude && record?.officeLocation?.longitude);
                        const hasGeoData = hasCheckInGeo || hasCheckOutGeo;

                        if (!hasGeoData) return null;

                        const activeTab = mapTab === "checkin" && hasCheckInGeo ? "checkin" : (hasCheckOutGeo ? "checkout" : "checkin");
                        const activeLat = activeTab === "checkin" ? record.loginLatitude : record.logoutLatitude;
                        const activeLng = activeTab === "checkin" ? record.loginLongitude : record.logoutLongitude;
                        const activeDistance = activeTab === "checkin" ? record.loginDistance : record.logoutDistance;
                        const radius = record.officeLocation?.geoRadiusMeters || 200;
                        const isWithin = activeDistance !== null && activeDistance !== undefined ? activeDistance <= radius : false;

                        return (
                            <div className="space-y-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    {hasCheckInGeo && hasCheckOutGeo && (
                                        <div className="flex rounded-md border border-border bg-muted/50 p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setMapTab("checkin")}
                                                className={cn(
                                                    "rounded px-3 py-1 text-sm font-medium transition-colors",
                                                    mapTab === "checkin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                Check in
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMapTab("checkout")}
                                                className={cn(
                                                    "rounded px-3 py-1 text-sm font-medium transition-colors",
                                                    mapTab === "checkout" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                Check out
                                            </button>
                                        </div>
                                    )}

                                    {activeDistance !== null && activeDistance !== undefined && (
                                        <span className={cn(
                                            "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                                            isWithin
                                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                                : "border-rose-500/30 bg-rose-500/10 text-rose-700"
                                        )}>
                                            {(Number(activeDistance) / 1000).toFixed(2)} km — {isWithin ? "Within geofence" : "Outside geofence"}
                                        </span>
                                    )}
                                </div>

                                <AttendanceMap
                                    employeeLat={Number(activeLat)}
                                    employeeLng={Number(activeLng)}
                                    officeLat={Number(record.officeLocation?.latitude)}
                                    officeLng={Number(record.officeLocation?.longitude)}
                                    radiusMeters={Number(radius)}
                                    employeeName={`${correction.requestedBy?.firstName} ${correction.requestedBy?.lastName}`}
                                    officeName={record.officeLocation?.name || "Office"}
                                />
                            </div>
                        );
                    })()}

                    {/* Reason Section */}
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">Employee reason</p>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {correction.reason || "No reason provided."}
                        </p>
                    </div>

                    {/* Decision Comments */}
                    <div className="space-y-2">
                        <FormTextarea
                            label="Feedback"
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add feedback for your decision (optional)…"
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <div className="flex w-full gap-2 sm:w-auto">
                        <Button
                            variant="destructive"
                            className="flex-1 sm:flex-none"
                            onClick={() => handleSubmit("rejected")}
                            disabled={loading}
                        >
                            <XCircle className="h-4 w-4" />
                            Reject
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none"
                            onClick={() => handleSubmit("approved")}
                            disabled={loading}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
