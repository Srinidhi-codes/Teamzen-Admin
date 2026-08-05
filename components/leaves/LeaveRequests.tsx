"use client"
import { useState } from "react";
import { Check, X, Calendar, Clock, FileText, User, ArrowRight, MessageSquare, XCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { LeaveRequest } from "@/lib/graphql/leaves/types";
import { DataTable, Column } from "../common/DataTable";
import { useGraphQLLeaveRequests, useGraphQLLeaveRequestProcess } from "@/lib/graphql/leaves/leavesHook";
import moment from "moment";
import { Textarea } from "../ui/textarea";
import { Stat } from "../common/Stats";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SearchInput } from "../common/SearchInput";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";


export default function LeaveRequests() {
    const [searchTerm, setSearchTerm] = useState("");
    const [organizationId, setOrganizationId] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { leaveRequestData, isLoading, error, refetch } = useGraphQLLeaveRequests(
        true,
        debouncedSearch,
        organizationId || undefined
    );
    const { leaveRequestProcess } = useGraphQLLeaveRequestProcess();
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [comments, setComments] = useState("");

    // Socket-based Real-time Refresh
    useNotifications((msg) => {
        if (msg.target_type === "Leave Request" && msg.level === "admin") {
            refetch();
        }
    }, { silent: true });

    if (isLoading) return (
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-3 h-4 w-24 animate-pulse rounded-md bg-muted" />
                        <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
                    </div>
                ))}
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-card p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                ))}
            </div>
        </div>
    );


    if (error) return (
        <div className="mx-auto max-w-md rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
            <p className="text-sm text-destructive">{error.message}</p>
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
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-foreground text-sm">{name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{moment(request.createdAt).fromNow()}</div>
                    </div>
                </div>
            )
        },


        {
            key: "leaveTypeName",
            label: "Leave Type",
            render: (val: any) => (
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                    {val}
                </span>
            ),
        },

        {
            key: "fromDate",
            label: "Duration",
            render: (_: any, request: any) => (
                <div className="flex items-center gap-2 text-sm text-foreground">
                    <div className="flex flex-col bg-muted/50 px-3 py-1.5 rounded-xl border border-border">
                        <div className="font-medium flex items-center gap-2">
                            {moment(request.fromDate).format("DD MMM")} <ArrowRight className="w-3 h-3 text-muted-foreground" /> {moment(request.toDate).format("DD MMM")}
                        </div>
                        <div className="text-xs text-muted-foreground">{request.durationDays} days</div>
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
                    className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize ${status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : status === "rejected"
                            ? "bg-destructive/10 text-destructive"
                            : status === "pending"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
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
                        className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Review
                    </button>

                ) : (
                    <span className="text-xs text-muted-foreground">Processed</span>
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
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Pending', count: pendingCount, icon: Clock, color: 'text-amber-500', gradient: 'bg-amber-500/10' },
                    { label: 'Approved', count: approvedCount, icon: Check, color: 'text-emerald-500', gradient: 'bg-emerald-500/10' },
                    { label: 'Rejected', count: rejectedCount, icon: X, color: 'text-destructive', gradient: 'bg-destructive/10' },
                    { label: 'Total', count: leaveRequestData.length, icon: FileText, color: 'text-primary', gradient: 'bg-primary/10' },
                ].map((stat, i) => (
                    <Stat
                        key={i}
                        icon={stat.icon}
                        label={stat.label}
                        value={stat.count}
                        color={stat.color}
                        gradient={stat.gradient}
                    />
                ))}
            </div>

            {/* Header / Table */}
            <div className="flex flex-col lg:flex-row justify-end items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Refresh"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <SearchInput
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        containerClassName="flex-1 lg:w-64 min-w-[200px]"
                        className="h-9"
                    />
                    <OrganizationFilterSelect
                        value={organizationId}
                        onChange={setOrganizationId}
                    />
                    {pendingCount > 0 && (
                        <div className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            {pendingCount} pending
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <DataTable
                    data={flattenedData}
                    columns={columns}
                    onRowClick={(request: any) => request.status === "pending" && setSelectedRequest(request)}
                />
            </div>


            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl w-full max-w-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">Review leave request</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">#{selectedRequest.id.slice(-8)}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setComments("");
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" /> Employee
                                    </label>
                                    <p className="text-sm font-medium text-foreground">
                                        {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" /> Leave type
                                    </label>
                                    <p className="text-sm font-medium text-foreground">
                                        {selectedRequest.leaveType.name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> Duration
                                    </label>
                                    <p className="text-sm font-medium text-foreground tabular-nums">
                                        {selectedRequest.durationDays} days
                                    </p>
                                </div>
                                <div className="space-y-1 col-span-full bg-muted/30 p-4 rounded-xl border border-border">
                                    <label className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
                                        <Calendar className="w-3.5 h-3.5" /> Date range
                                    </label>
                                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                        {moment(selectedRequest.fromDate).format("MMMM DD")}
                                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                        {moment(selectedRequest.toDate).format("MMMM DD, YYYY")}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Reason
                                </label>
                                <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary pl-3 py-1">
                                    {selectedRequest.reason || "No reason provided"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" /> Feedback
                                </label>
                                <Textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={4}
                                    className="rounded-xl border-border focus:ring-2 focus:ring-primary/10 transition-all resize-none text-sm"
                                    placeholder="Add feedback for this request…"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 border-t border-border px-6 py-4">
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setComments("");
                                }}
                                className="btn-ghost"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleReject(selectedRequest.id)}
                                className="btn-destructive"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleApprove(selectedRequest.id)}
                                className="btn-primary bg-emerald-600 hover:bg-emerald-700"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}