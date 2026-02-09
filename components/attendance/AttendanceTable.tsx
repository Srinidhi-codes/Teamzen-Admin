import { DataTable } from "@/components/common/DataTable";
import moment from "moment";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
import {
    Clock,
    Calendar,
    MessageSquare,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowRight,
    User,
    Undo2,
    FilePenLine
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; icon: any; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
    approved: { label: "Approved", icon: CheckCircle2, variant: "success" },
    rejected: { label: "Rejected", icon: XCircle, variant: "danger" },
    pending: { label: "Pending Review", icon: Clock, variant: "warning" },
};


export function AttendanceTable({
    data,
    isLoading,
    onApproveCorrection,
    onCancelCorrection,
    total,
    currentPage,
    pageSize,
    onPageChange
}: {
    data: AttendanceCorrection[];
    isLoading: boolean;
    onApproveCorrection: (row: AttendanceCorrection) => void;
    onCancelCorrection: (correctionId: string) => void;
    total?: number;
    currentPage?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
}) {
    const columns = [
        {
            key: "requestedBy",
            label: "Employee",
            render: (user: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-inner">
                        {user.firstName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-foreground tracking-tight">
                            {user.firstName} {user.lastName}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                            {user.designation?.name || "Member"}
                        </span>
                    </div>
                </div>
            ),
        },

        {
            key: "attendanceRecord.attendanceDate",
            label: "Date",
            render: (value: string) => (
                <div className="flex flex-col">
                    <span className="text-premium-data">
                        {moment(value).format("DD MMM, YYYY")}
                    </span>
                    <span className="text-premium-label opacity-60">
                        {moment(value).format("dddd")}
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
                        {row.attendanceRecord.loginTime ? moment(row.attendanceRecord.loginTime, "HH:mm:ss").format("hh:mm A") : "--:--"}
                        <ArrowRight className="w-3 h-3 text-primary/30" />
                        {row.attendanceRecord.logoutTime ? moment(row.attendanceRecord.logoutTime, "HH:mm:ss").format("hh:mm A") : "--:--"}
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
            render: (value: string) => (
                <div className="group relative flex items-start gap-2 max-w-[200px]">
                    <p className="text-sm font-medium text-foreground/70 line-clamp-2 leading-relaxed italic">
                        "{value || "No reason provided"}"
                    </p>
                </div>

            ),
        },
        {
            key: "status",
            label: "Verdict",
            render: (value: string) => {
                return (
                    <span
                        className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all duration-300 ${value === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5"
                            : value === "rejected"
                                ? "bg-destructive/10 text-destructive border border-destructive/20 shadow-destructive/5"
                                : value === "pending"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-amber-500/5"
                                    : "bg-muted text-muted-foreground border border-border"
                            }`}
                    >
                        {value}
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
                                    onClick={() => onApproveCorrection(row)}
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
        <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
            paginationLabel="corrections"
        />
    );
}
