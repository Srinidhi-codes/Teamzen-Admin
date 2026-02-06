"use client"
import { useState } from "react";
import { Check, X, Calendar, Clock, AlertCircle, FileText, User, ArrowRight, MessageSquare } from "lucide-react";
import { LeaveRequest } from "@/lib/graphql/leaves/types";
import { DataTable, Column } from "../common/DataTable";
import { useGraphQLLeaveRequests, useGraphQLLeaveRequestProcess } from "@/lib/graphql/leaves/leavesHook";
import moment from "moment";
import { Textarea } from "../ui/textarea";
import { Stat } from "../common/Stats";


export default function LeaveRequests() {
    const { leaveRequestData, isLoading, error, refetch } = useGraphQLLeaveRequests();
    const { leaveRequestProcess } = useGraphQLLeaveRequestProcess();
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [comments, setComments] = useState("");

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Applications...</p>
        </div>
    );


    if (error) return (
        <div className="p-12 text-center bg-destructive/10 rounded-4xl border border-destructive/20 mx-auto max-w-2xl animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight mb-2">Protocol Breach</h3>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">{error.message}</p>
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
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-inner">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-black text-foreground tracking-tight">{name}</div>
                        <div className="text-[9px] text-muted-foreground font-black tracking-widest mt-0.5 opacity-60">{moment(request.createdAt).fromNow()}</div>
                    </div>
                </div>
            )
        },


        {
            key: "leaveTypeName",
            label: "Leave Type",
            render: (val: any) => (
                <span className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
                    {val}
                </span>
            ),
        },

        {
            key: "fromDate",
            label: "Duration",
            render: (_: any, request: any) => (
                <div className="flex items-center gap-4 text-foreground">
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground border-border font-black text-sm bg-muted px-3 py-1.5 rounded-xl border shadow-sm shadow-muted/5">
                        <div className="text-[11px] font-black tracking-tight flex items-center gap-2">
                            {moment(request.fromDate).format("DD MMM")} <ArrowRight className="w-3 h-3 text-muted-foreground/40" /> {moment(request.toDate).format("DD MMM")}
                        </div>
                        <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">{request.durationDays} Full Cycle(s)</div>
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
            label: "Status",
            render: (status: string) => (
                <span
                    className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all duration-300 ${status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5"
                        : status === "rejected"
                            ? "bg-destructive/10 text-destructive border border-destructive/20 shadow-destructive/5"
                            : status === "pending"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-amber-500/5"
                                : "bg-muted text-muted-foreground border border-border"
                        }`}
                >
                    {status}
                </span>
            ),
        },

        {
            key: "actions",
            label: "Action",
            render: (_: any, request: any) =>
                request.status === "pending" ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                        }}
                        className="btn-primary"
                    >
                        Review Logic
                    </button>

                ) : (
                    <div className="flex items-center gap-2 px-2 py-2 border border-border bg-muted/30 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Processed</span>
                    </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Pending Review', count: pendingCount, icon: Clock, color: 'text-amber-500', gradient: 'bg-amber-500/10', index: '01' },
                    { label: 'Authorized', count: approvedCount, icon: Check, color: 'text-emerald-500', gradient: 'bg-emerald-500/10', index: '02' },
                    { label: 'Deprioritized', count: rejectedCount, icon: X, color: 'text-destructive', gradient: 'bg-destructive/10', index: '03' },
                    { label: 'Global Total', count: leaveRequestData.length, icon: FileText, color: 'text-primary', gradient: 'bg-primary/10', index: '04' },
                ].map((stat, i) => (
                    <Stat
                        key={i}
                        icon={stat.icon}
                        label={stat.label}
                        value={stat.count}
                        color={stat.color}
                        gradient={stat.gradient}
                        index={stat.index}
                    />
                ))}
            </div>






            {/* Header / Table */}
            <div className="premium-card flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full shadow-sm shadow-primary/20" />
                    <h2 className="text-premium-h2 leading-none">Leave Requests</h2>
                    <p className="text-premium-label mt-2 opacity-60">Audit and resolve employee leave requests.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-premium-label flex items-center gap-3 shadow-xl shadow-primary/20">
                        {pendingCount} Pending Requests
                    </div>
                </div>
            </div>




            <div className="bg-card rounded-4xl border border-border shadow-xl overflow-hidden p-2">
                <DataTable
                    data={flattenedData}
                    columns={columns}
                    onRowClick={(request: any) => request.status === "pending" && setSelectedRequest(request)}
                />
            </div>


            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-card rounded-[3rem] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                        {/* Header */}
                        <div className="relative p-10 pb-8 bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <FileText className="w-32 h-32 rotate-12" />
                            </div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight leading-none mb-3">
                                        Logic Review
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                                            #{selectedRequest.id.slice(-8)}
                                        </span>
                                        <p className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Temporal Protocol</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setComments("");
                                    }}
                                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 flex items-center justify-center active:scale-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>


                        {/* Content */}
                        <div className="p-10 space-y-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            {/* Detailed Info Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <User className="w-3 h-3 text-primary" /> Human Asset
                                    </label>
                                    <p className="text-lg font-black text-foreground tracking-tight leading-tight">
                                        {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileText className="w-3 h-3 text-primary" /> Entitlement
                                    </label>
                                    <p className="text-lg font-black text-primary tracking-tight leading-tight">
                                        {selectedRequest.leaveType.name}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary" /> Quota Impact
                                    </label>
                                    <p className="text-lg font-black text-foreground tracking-tight leading-tight tabular-nums">
                                        {selectedRequest.durationDays} Cycle(s)
                                    </p>
                                </div>
                                <div className="space-y-2 col-span-full bg-muted/30 p-4 rounded-2xl border border-border/50">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                                        <Calendar className="w-3 h-3 text-primary" /> Temporal Boundary
                                    </label>
                                    <p className="text-sm font-black text-foreground tracking-widest uppercase flex items-center gap-3">
                                        {moment(selectedRequest.fromDate).format("MMMM DD")}
                                        <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
                                        {moment(selectedRequest.toDate).format("MMMM DD, YYYY")}
                                    </p>
                                </div>
                            </div>

                            {/* Reason Card */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-primary" /> Asset Justification
                                </label>
                                <div className="bg-card p-6 rounded-3xl border border-border shadow-inner relative overflow-hidden group">
                                    <p className="text-foreground/80 font-medium leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                                        "{selectedRequest.reason}"
                                    </p>
                                </div>
                            </div>

                            {/* Admin Action Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Check className="w-3 h-3 text-primary" /> Administrative Log
                                </label>
                                <Textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={4}
                                    className="bg-muted/30 rounded-3xl border-border/50 focus:ring-4 focus:ring-primary/10 focus:bg-background transition-all resize-none p-6 font-medium text-sm"
                                    placeholder="Enter decision rationale or feedback for the asset synchronization..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-10 border-t border-border bg-muted/10 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-4">
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setComments("");
                                }}
                                className="px-10 py-5 text-muted-foreground hover:text-foreground text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted rounded-2xl active:scale-95"
                            >
                                Defer
                            </button>
                            <div className="flex gap-4 flex-1 sm:flex-initial">
                                <button
                                    onClick={() => handleReject(selectedRequest.id)}
                                    className="flex-1 sm:flex-none px-10 py-5 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-destructive hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-destructive/5"
                                >
                                    <X className="w-5 h-5" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedRequest.id)}
                                    className="flex-1 sm:flex-none px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary/20"
                                >
                                    <Check className="w-5 h-5" />
                                    Authorize
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}