"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { useCancelAttendanceCorrection, useApproveOrRejectAttendanceCorrection, useGraphQLAttendanceCorrection } from "@/lib/graphql/attendance/attendanceHooks";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { ApprovalModal } from "@/components/attendance/ApprovalModal";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
import moment from "moment";
import {
    Calendar,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    NotebookPen
} from "lucide-react";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Stat } from "@/components/common/Stats";


export default function AttendancePage() {
    const [startDate, setStartDate] = useState(moment().startOf("month").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selected, setSelected] = useState<AttendanceCorrection | null>(null);

    const { cancelAttendanceCorrection } = useCancelAttendanceCorrection();
    const { attendanceCorrections, isLoading, refetchAttendanceCorrections } = useGraphQLAttendanceCorrection();

    /** Fetch attendance */
    const loadAttendance = async (startDate: string, endDate: string) => {
        if (!startDate || !endDate) return;
        await refetchAttendanceCorrections({ startDate, endDate });
    };

    const handleCancelCorrection = async (correctionId: string) => {
        try {
            await cancelAttendanceCorrection(correctionId);
            await refetchAttendanceCorrections({ startDate, endDate });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadAttendance(startDate, endDate);
    }, []);

    const { approveOrRejectAttendanceCorrection } = useApproveOrRejectAttendanceCorrection();

    const handleSubmit = async (status: "approved" | "rejected", comments: string) => {
        if (!selected) return;
        try {
            await approveOrRejectAttendanceCorrection(
                selected.id!,
                status,
                comments
            );
            setSelected(null);
            refetchAttendanceCorrections({ startDate, endDate });
        } catch (err: any) {
            console.error(err);
        }
    };

    // Derived Stats
    const statsList = [
        {
            label: "Total Requests",
            value: attendanceCorrections.length,
            icon: Calendar,
            color: "text-blue-500",
            gradient: "bg-blue-500/10",
            index: "01"
        },
        {
            label: "Pending Review",
            value: attendanceCorrections.filter(c => c.status === "pending").length,
            icon: Clock,
            color: "text-amber-500",
            gradient: "bg-amber-500/10",
            index: "02"
        },
        {
            label: "Approved",
            value: attendanceCorrections.filter(c => c.status === "approved").length,
            icon: CheckCircle2,
            color: "text-emerald-500",
            gradient: "bg-emerald-500/10",
            index: "03"
        },
        {
            label: "Rejected",
            value: attendanceCorrections.filter(c => c.status === "rejected").length,
            icon: XCircle,
            color: "text-rose-500",
            gradient: "bg-rose-500/10",
            index: "04"
        },
    ];



    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Temporal Records</h1>
                    </div>
                    <p className="text-muted-foreground font-medium pl-13 flex items-center gap-2">
                        Audit and synchronize global attendance precision.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-muted/30 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-sm">
                    <div className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">
                        Snapshot
                    </div>
                    <div className="px-4 py-2 text-foreground text-xs font-bold uppercase tracking-widest">
                        {moment(startDate).format("MMM DD")} — {moment(endDate).format("MMM DD, YYYY")}
                    </div>
                </div>
            </div>


            {/* Smart Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsList.map((stat, i) => (
                    <Stat
                        key={i}
                        icon={stat.icon}
                        label={stat.label}
                        value={stat.value}
                        color={stat.color}
                        gradient={stat.gradient}
                        index={stat.index}
                    />
                ))}

            </div>




            {/* Content Section */}
            <div className="grid grid-cols-1 gap-8">
                {/* Filters */}
                <div className="premium-card">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                            <DatePickerSimple
                                label="Historical Start"
                                value={startDate}
                                onChange={(date) => setStartDate(moment(date).format("YYYY-MM-DD"))}
                            />
                            <DatePickerSimple
                                label="Temporal End"
                                value={endDate}
                                onChange={(date) => setEndDate(moment(date).format("YYYY-MM-DD"))}
                            />
                        </div>
                        <button
                            onClick={() => loadAttendance(startDate, endDate)}
                            className="btn-primary w-full md:w-auto"
                        >
                            <Search className="w-5 h-5 mr-3" />
                            Synchronize
                        </button>
                    </div>
                </div>



                {/* Table Card */}
                <div className="bg-card rounded-4xl border border-border shadow-2xl shadow-primary/5 overflow-hidden">
                    <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <NotebookPen className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-foreground tracking-tight">Temporal Ledger</h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Immutable correction logs</p>
                            </div>
                        </div>
                    </div>


                    <div className="p-2">
                        <AttendanceTable
                            data={attendanceCorrections}
                            isLoading={isLoading}
                            onApproveCorrection={setSelected}
                            onCancelCorrection={handleCancelCorrection}
                        />
                    </div>
                </div>
            </div>

            {/* Correction Modal */}
            {selected && (
                <ApprovalModal
                    correction={selected}
                    onClose={() => setSelected(null)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
