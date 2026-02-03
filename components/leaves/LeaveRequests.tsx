"use client"
import { useState } from "react";
import { Check, X, Calendar, Clock, AlertCircle, FileText, User, ArrowRight } from "lucide-react";
import { LeaveRequest } from "@/lib/graphql/leaves/types";
import { DataTable, Column } from "../common/DataTable";
import { useGraphQLLeaveRequests, useGraphQLLeaveRequestProcess } from "@/lib/graphql/leaves/leavesHook";
import moment from "moment";
import { Textarea } from "../ui/textarea";

export default function LeaveRequests() {
    const { leaveRequestData, isLoading, error, refetch } = useGraphQLLeaveRequests();
    const { leaveRequestProcess } = useGraphQLLeaveRequestProcess();
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [comments, setComments] = useState("");

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse font-medium">Loading leave requests...</p>
        </div>
    );
    if (error) return (
        <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100 mx-auto max-w-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-bold text-lg mb-1">Error Loading Data</p>
            <p className="text-red-500 text-sm">{error.message}</p>
        </div>
    );

    const handleApprove = async (id: string) => {
        try {
            await leaveRequestProcess({
                requestId: id,
                status: "approved",
                comments: comments
            });
            refetch();
            setSelectedRequest(null);
            setComments("");
        } catch (err) {
            console.error("Error approving leave:", err);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await leaveRequestProcess({
                requestId: id,
                status: "rejected",
                comments: comments
            });
            refetch();
            setSelectedRequest(null);
            setComments("");
        } catch (err) {
            console.error("Error rejecting leave:", err);
        }
    };

    const columns: Column<any>[] = [
        {
            key: "employeeName",
            label: "Employee",
            render: (name: string, request: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        {name[0]}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Applied {moment(request.createdAt).fromNow()}</div>
                    </div>
                </div>
            )
        },
        {
            key: "leaveTypeName",
            label: "Leave Type",
            render: (val: any) => (
                <span className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                    {val}
                </span>
            ),
        },
        {
            key: "fromDate",
            label: "Duration",
            render: (_: any, request: any) => (
                <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            {moment(request.fromDate).format("MMM D")} <ArrowRight className="w-3 h-3 text-slate-300" /> {moment(request.toDate).format("MMM D")}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase">{request.durationDays} FULL DAYS</div>
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (status: string) => (
                <span
                    className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-sm border ${status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : status === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-slate-50 text-slate-700 border-slate-100"
                        }`}
                >
                    {status}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (_: any, request: any) =>
                request.status === "pending" ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 font-bold text-xs"
                    >
                        Review Request
                    </button>
                ) : (
                    <div className="text-[10px] font-black text-slate-300 uppercase italic">PROCESSED</div>
                ),
        },
    ];

    const pendingCount = leaveRequestData.filter((r: LeaveRequest) => r.status === "pending").length;
    const approvedCount = leaveRequestData.filter((r: LeaveRequest) => r.status === "approved").length;
    const rejectedCount = leaveRequestData.filter((r: LeaveRequest) => r.status === "rejected").length;

    const flattenedData = leaveRequestData.map((r) => ({
        ...r,
        employeeName: `${r.user.firstName} ${r.user.lastName}`,
        leaveTypeName: r.leaveType.name
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Pending', count: pendingCount, color: 'amber', icon: Clock },
                    { label: 'Approved', count: approvedCount, color: 'emerald', icon: Check },
                    { label: 'Rejected', count: rejectedCount, color: 'rose', icon: X },
                    { label: 'Total Requests', count: leaveRequestData.length, color: 'indigo', icon: FileText },
                ].map((stat, i) => (
                    <div key={i} className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl overflow-hidden hover:scale-105 transition-all duration-500">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-500 opacity-60`} />
                            </div>
                            <h3 className={`text-4xl font-black text-${stat.color}-600 tracking-tighter`}>{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Header / Table */}
            <div className="bg-white/50 p-6 rounded-3xl backdrop-blur-sm border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Time-Off Requests</h2>
                    <p className="text-gray-500 mt-1">Review and process employee leave applications</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {pendingCount} Actions Needed
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden p-2">
                <DataTable
                    data={flattenedData}
                    columns={columns}
                    onRowClick={(request: any) => request.status === "pending" && setSelectedRequest(request)}
                />
            </div>

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-linear-to-br from-white via-indigo-50/20 to-purple-50/20 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border-2 border-white/50 overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-8 pb-6 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                            <div>
                                <h2 className="text-3xl font-black bg-linear-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                                    Review Request
                                </h2>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Reference ID: #{selectedRequest.id.slice(-8)}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setComments("");
                                }}
                                className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 transition-all duration-300 flex items-center justify-center group"
                            >
                                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                            {/* Detailed Info Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" /> Employee
                                    </label>
                                    <p className="text-lg font-extrabold text-slate-900 leading-tight">
                                        {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" /> Leave Type
                                    </label>
                                    <p className="text-lg font-extrabold text-indigo-600 leading-tight">
                                        {selectedRequest.leaveType.name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> Duration
                                    </label>
                                    <p className="text-lg font-extrabold text-slate-900 leading-tight">
                                        {selectedRequest.durationDays} Full Days
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Period
                                    </label>
                                    <p className="text-sm font-bold text-slate-700">
                                        {moment(selectedRequest.fromDate).format("ll")} – {moment(selectedRequest.toDate).format("ll")}
                                    </p>
                                </div>
                            </div>

                            {/* Reason Card */}
                            <div className="bg-white/60 p-6 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <FileText className="w-16 h-16" rotate={-10} />
                                </div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Reason for leave</label>
                                <p className="text-slate-700 font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-4 py-2">
                                    "{selectedRequest.reason}"
                                </p>
                            </div>

                            {/* Admin Action Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Review Comments
                                </label>
                                <Textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={3}
                                    className="bg-white rounded-2xl border-slate-200 focus:ring-indigo-500 resize-none font-medium"
                                    placeholder="Add feedback or reason for approval/rejection..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-200/50 bg-white/80 backdrop-blur-sm flex justify-between items-center gap-4">
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setComments("");
                                }}
                                className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReject(selectedRequest.id)}
                                    className="px-8 py-3 bg-rose-50 text-rose-700 border-2 border-rose-100 rounded-2xl font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-rose-100"
                                >
                                    <X className="w-5 h-5" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedRequest.id)}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    <Check className="w-5 h-5" />
                                    Approve Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}