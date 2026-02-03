import { DataTable } from "@/components/common/DataTable";
import moment from "moment";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";



const STATUS_MAP: Record<string, { label: string; className: string }> = {
    late_login: { label: "Late Login", className: "badge-warning" },
    early_logout: { label: "Early Logout", className: "badge-warning" },
    absent: { label: "Absent", className: "badge-danger" },
    present: { label: "Present", className: "badge-success" },
    approved: { label: "Approved", className: "badge-success" },
    rejected: { label: "Rejected", className: "badge-danger" },
    pending: { label: "Pending", className: "badge-warning" },
};

export function AttendanceTable({
    data,
    isLoading,
    onApproveCorrection,
    onCancelCorrection,
    // Pagination Props
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
            key: "attendanceRecord.attendanceDate",
            label: "Date",
            render: (value: string) =>
                new Date(value).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                }),
        },
        {
            key: "attendanceRecord.loginTime",
            label: "Actual Login Time",
            render: (value: string) => (
                <span className="font-md">
                    {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "--:--:--"}
                </span>
            ),
        },
        {
            key: "attendanceRecord.logoutTime",
            label: "Actual Logout Time",
            render: (value: string) => (
                <span className="font-md">
                    {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "--:--:--"}
                </span>
            ),
        },
        {
            key: "correctedLoginTime",
            label: "Correction Login Time",
            render: (value: string) => (
                <span className="font-md">
                    {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "--:--:--"}
                </span>
            ),
        },
        {
            key: "correctedLogoutTime",
            label: "Correction Logout Time",
            render: (value: string) => (
                <span className="font-md">
                    {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "--:--:--"}
                </span>
            ),
        },
        {
            key: "attendanceRecord.workedHours",
            label: "Worked Hours",
            render: (value: string) => (
                <span
                    className={`capitalize ${Number(value) >= 8 ? "text-black" : "text-red-600"
                        }`}
                >
                    {value ? `${Number(value).toFixed(0)} hrs` : "--:--"}
                </span>

            ),
        },
        {
            key: "reason",
            label: "Reason",
            render: (value: string) => (
                <span className="font-md text-wrap">{value || "--:--:--"}</span>
            ),
        },
        {
            key: "approvalComments",
            label: "Approval Comment",
            render: (value: string) => (
                <span className="font-md text-wrap">{value || "--:--:--"}</span>
            ),
        },
        {
            key: "status",
            label: "Approval Status",
            render: (value: string) => {
                const s = STATUS_MAP[value];
                return (
                    <span className={`badge capitalize ${s?.className ?? "badge-info"}`}> {value || "--:--:--"}</span >
                )
            },
        },
        {
            key: "correctionActions",
            label: "Correction",
            render: (_: unknown, row: AttendanceCorrection) => {
                const status = row.status;
                return (
                    <div className="flex flex-col items-center gap-2">
                        {/* REQUEST rules */}
                        {(status === "pending") && (
                            <button
                                onClick={() => onApproveCorrection(row)}
                                className="text-indigo-600 text-sm cursor-pointer"
                            >
                                Approve/Reject
                            </button>
                        )}

                        {/* CANCEL only for 'pending' */}
                        {status === "pending" && row.id && (
                            <button
                                onClick={() => onCancelCorrection(row.id!)}
                                className="text-red-600 text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
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
