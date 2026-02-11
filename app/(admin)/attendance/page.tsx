"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { useCancelAttendanceCorrection, useApproveOrRejectAttendanceCorrection, useGraphQLAttendanceCorrection } from "@/lib/graphql/attendance/attendanceHooks";
import { ApprovalModal } from "@/components/attendance/ApprovalModal";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
import { DataTable, Column } from "@/components/common/DataTable";
import moment from "moment";
import {
    Calendar,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    NotebookPen,
    ArrowRight,
    User,
    FilePenLine
} from "lucide-react";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Stat } from "@/components/common/Stats";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SearchInput } from "@/components/ui/search";
import { Button } from "@/components/ui/button";


export default function AttendancePage() {
    const [startDate, setStartDate] = useState(moment().startOf("month").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selected, setSelected] = useState<AttendanceCorrection | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const { cancelAttendanceCorrection } = useCancelAttendanceCorrection();
    const { attendanceCorrections, total, isLoading, refetchAttendanceCorrections } = useGraphQLAttendanceCorrection({
        page: currentPage,
        pageSize: pageSize,
        filters: {
            search: debouncedSearchTerm
        }
    });

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
    }, [startDate, endDate]);

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
            value: total || 0,
            icon: Calendar,
            color: "text-blue-500",
            gradient: "bg-blue-500/10",
            index: "01"
        },
        // Note: Filtering these stats client-side based on `attendanceCorrections` (page results) 
        // is inaccurate if there are multiple pages. Ideally, backend shoud provide stats.
        // For now, keeping as is but logic operates on current page only.
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

    const columns: Column<AttendanceCorrection>[] = [
        {
            key: "requestedBy",
            label: "Employee",
            render: (_: any, row: AttendanceCorrection) => (
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-inner">
                        {row.requestedBy?.firstName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-foreground tracking-tight">
                            {row.requestedBy?.firstName} {row.requestedBy?.lastName}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                            {row.requestedBy?.designation?.name || "Member"}
                        </span>
                    </div>
                </div>
            ),
        },

        {
            key: "attendanceRecord.attendanceDate",
            label: "Date",
            render: (_: any, row: AttendanceCorrection) => (
                <div className="flex flex-col">
                    <span className="text-premium-data">
                        {moment(row.attendanceRecord?.attendanceDate).format("DD MMM, YYYY")}
                    </span>
                    <span className="text-premium-label opacity-60">
                        {moment(row.attendanceRecord?.attendanceDate).format("dddd")}
                    </span>
                </div>
            ),

        },
        {
            key: "correctionRequest",
            label: "Check-In / Out",
            render: (_: any, row: AttendanceCorrection) => (
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 text-primary font-black text-sm bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 shadow-sm shadow-primary/5">
                        <Clock className="w-3.5 h-3.5" />
                        {row.attendanceRecord?.loginTime ? moment(row.attendanceRecord.loginTime, "HH:mm:ss").format("hh:mm A") : "--:--"}
                        <ArrowRight className="w-3 h-3 text-primary/30" />
                        {row.attendanceRecord?.logoutTime ? moment(row.attendanceRecord.logoutTime, "HH:mm:ss").format("hh:mm A") : "--:--"}
                    </div>
                </div>

            ),
        },
        {
            key: "loginInfo",
            label: "Requested Time",
            render: (_: any, row: AttendanceCorrection) => (
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-black text-sm ring-1 ring-border px-3 py-1.5 rounded-lg bg-muted/50">
                            <Clock className="w-3.5 h-3.5" />
                            {row.correctedLoginTime ? moment(row.correctedLoginTime, "HH:mm:ss").format("hh:mm A") : "No Change"}
                            <ArrowRight className="w-3 h-3 mx-1" />
                            {row.correctedLogoutTime ? moment(row.correctedLogoutTime, "HH:mm:ss").format("hh:mm A") : "No Change"}
                        </div>
                    </div>

                </div>
            ),
        },
        {
            key: "reason",
            label: "Reason",
            render: (value: string, row: AttendanceCorrection) => (
                <div className="group relative flex items-start gap-2 max-w-[200px]">
                    <p className="text-sm font-medium text-foreground/70 line-clamp-2 leading-relaxed italic">
                        "{row.reason || "No reason provided"}"
                    </p>
                </div>

            ),
        },
        {
            key: "status",
            label: "Verdict",
            render: (value: string, row: AttendanceCorrection) => {
                return (
                    <span
                        className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all duration-300 ${row.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5"
                            : row.status === "rejected"
                                ? "bg-destructive/10 text-destructive border border-destructive/20 shadow-destructive/5"
                                : row.status === "pending"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-amber-500/5"
                                    : "bg-muted text-muted-foreground border border-border"
                            }`}
                    >
                        {row.status}
                    </span>
                );
            },

        },

        {
            key: "correctionActions",
            label: "Actions",
            render: (_: unknown, row: AttendanceCorrection) => {
                const status = row.status;
                return (
                    <div className="flex items-center gap-2">
                        {status === "pending" && (
                            <>
                                <button
                                    onClick={() => setSelected(row)}
                                    className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95 hover:-translate-y-0.5 transition-all active:scale-90 group relative"
                                    title="Review Correction"
                                >
                                    <FilePenLine className="w-4 h-4" />
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                        Review Correction
                                    </span>
                                </button>
                            </>
                        )
                        }
                        {status !== 'pending' && (
                            <div className="flex items-center gap-2 px-4 py-2 border border-border bg-muted/30 rounded-xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Processed</span>
                            </div>
                        )}

                    </div>
                );
            },
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
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Attendance Correction Records</h1>
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
                <div className="premium-card flex flex-col gap-y-5">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                            <DatePickerSimple
                                label="Start Date"
                                value={startDate}
                                onChange={(date) => setStartDate(moment(date).format("YYYY-MM-DD"))}
                            />
                            <DatePickerSimple
                                label="End Date"
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
                    <div className="relative w-full md:max-w-lg group">
                        <SearchInput
                            placeholder="Scan for identifiers, names or connectivity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onSearch={() => { }}
                        />
                    </div>
                </div>



                {/* Table Card */}
                <div className="p-2">
                    <DataTable
                        data={attendanceCorrections}
                        columns={columns}
                        isLoading={isLoading}
                        total={total}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        paginationLabel="corrections"
                    />
                </div>
            </div>

            {/* Correction Modal */}
            {
                selected && (
                    <ApprovalModal
                        correction={selected}
                        onClose={() => setSelected(null)}
                        onSubmit={handleSubmit}
                    />
                )
            }
        </div >
    );
}

