"use client"
import { useState } from "react";
import { Check, X, Calendar } from "lucide-react";
import { LeaveRequest } from "@/types/admin";
import { Column, DataTable } from "../common/DataTable";

const mockLeaveRequests: LeaveRequest[] = [
    {
        id: 1,
        user_id: 1,
        user_name: "John Doe",
        leave_type_name: "Sick Leave",
        from_date: "2025-01-20",
        to_date: "2025-01-22",
        days: 3,
        reason: "Medical appointment and recovery",
        status: "pending",
        applied_date: "2025-01-15",
    },
    {
        id: 2,
        user_id: 3,
        user_name: "Mike Johnson",
        leave_type_name: "Casual Leave",
        from_date: "2025-01-25",
        to_date: "2025-01-26",
        days: 2,
        reason: "Personal work",
        status: "pending",
        applied_date: "2025-01-14",
    },
    {
        id: 3,
        user_id: 5,
        user_name: "Sarah Williams",
        leave_type_name: "Earned Leave",
        from_date: "2025-02-01",
        to_date: "2025-02-05",
        days: 5,
        reason: "Family vacation",
        status: "approved",
        applied_date: "2025-01-10",
        approver_comments: "Approved for vacation",
    },
];

export default function LeavesPage() {
    const [leaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [comments, setComments] = useState("");

    const handleApprove = (id: number) => {
        console.log("Approving leave:", id, comments);
        setSelectedRequest(null);
        setComments("");
    };

    const handleReject = (id: number) => {
        console.log("Rejecting leave:", id, comments);
        setSelectedRequest(null);
        setComments("");
    };

    const columns: Column<LeaveRequest>[] = [
        {
            key: "user_name",
            label: "Employee",
            sortable: true,
        },
        {
            key: "leave_type_name",
            label: "Leave Type",
            sortable: true,
            render: (val: any) => (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {val}
                </span>
            ),
        },
        {
            key: "from_date",
            label: "Duration",
            render: (val: any, request: LeaveRequest) => (
                <div className="text-sm">
                    <div className="font-bold text-slate-900">{val}</div>
                    <div className="text-slate-400 font-medium italic text-xs">to {request.to_date}</div>
                    <div className="text-[10px] text-indigo-500 font-black mt-1 uppercase tracking-tighter bg-indigo-50 w-fit px-1.5 rounded-sm">{request.days} days</div>
                </div>
            ),
        },
        {
            key: "reason",
            label: "Reason",
            render: (val: any) => (
                <div className="text-xs text-slate-500 font-medium max-w-[200px] whitespace-normal line-clamp-2">
                    {val}
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (val: string) => (
                <span
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${val === "approved"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : val === "rejected"
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                >
                    {val}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (_: any, request: LeaveRequest) =>
                request.status === "pending" ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                        }}
                        className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        Review
                    </button>
                ) : (
                    <span className="text-slate-300 font-bold text-[10px] uppercase tracking-widest">Completed</span>
                ),
        },
    ];

    const pendingCount = leaveRequests.filter((r) => r.status === "pending").length;
    const approvedCount = leaveRequests.filter((r) => r.status === "approved").length;
    const rejectedCount = leaveRequests.filter((r) => r.status === "rejected").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 font-black tracking-tight">Leave Management</h1>
                <p className="text-gray-600 mt-1 font-medium">Review and approve employee leave requests within the ecosystem.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex items-center justify-between group hover:border-amber-100 transition-all">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</div>
                        <div className="mt-1 text-3xl font-black text-amber-600 tracking-tighter">{pendingCount}</div>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex items-center justify-between group hover:border-emerald-100 transition-all">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</div>
                        <div className="mt-1 text-3xl font-black text-emerald-600 tracking-tighter">{approvedCount}</div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <Check className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex items-center justify-between group hover:border-rose-100 transition-all">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejected</div>
                        <div className="mt-1 text-3xl font-black text-rose-600 tracking-tighter">{rejectedCount}</div>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                        <X className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex items-center justify-between group hover:border-indigo-100 transition-all">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Force</div>
                        <div className="mt-1 text-3xl font-black text-slate-900 tracking-tighter">{leaveRequests.length}</div>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={leaveRequests}
                columns={columns}
                onRowClick={(request) => request.status === "pending" && setSelectedRequest(request)}
            />

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-0 max-w-2xl w-full shadow-2xl overflow-hidden border border-white">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <h2 className="text-3xl font-black tracking-tighter">Review Request</h2>
                            <p className="text-slate-400 font-medium">Analyzing the necessity of this workspace absence.</p>
                            <Calendar className="absolute top-1/2 right-8 -translate-y-1/2 w-16 h-16 text-white/5" />
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</label>
                                    <p className="text-slate-900 font-bold">{selectedRequest.user_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric</label>
                                    <p className="text-indigo-600 font-bold">{selectedRequest.leave_type_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absence Window</label>
                                    <p className="text-slate-900 font-bold">{selectedRequest.days} Days</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subjective Reason</label>
                                <p className="text-slate-600 font-medium text-sm leading-relaxed">{selectedRequest.reason}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Executive Comments</label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all font-medium text-sm"
                                    placeholder="Provide justification or directives..."
                                />
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setComments("");
                                    }}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => handleReject(selectedRequest.id)}
                                    className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    Reject Request
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedRequest.id)}
                                    className="flex-[1.5] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all"
                                >
                                    Grant Permission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}