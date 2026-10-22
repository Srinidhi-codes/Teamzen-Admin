"use client";

import React, { useState, useMemo } from "react";
import { Clock, Check, X, FileText } from "lucide-react";
import { useGraphQLLeaveRequests, useGraphQLLeaveRequestProcess } from "@/lib/graphql/leaves/leavesHook";
import { Stat } from "../common/Stats";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { LeaveRequestMasterDetail } from "./LeaveRequestMasterDetail";

export default function LeaveRequests() {
    const [organizationId, setOrganizationId] = useState("");

    const { leaveRequestData, isLoading, error, refetch } = useGraphQLLeaveRequests(
        true,
        undefined,
        organizationId || undefined
    );
    const { leaveRequestProcess, leaveRequestProcessLoading } = useGraphQLLeaveRequestProcess();

    // Socket-based Real-time Refresh
    useNotifications((msg) => {
        if (msg.target_type === "Leave Request" && msg.level === "admin") {
            refetch();
        }
    }, { silent: true });

    const requests = useMemo(() => leaveRequestData || [], [leaveRequestData]);

    const pendingCount = useMemo(
        () => requests.filter((r: any) => r.status?.toLowerCase() === "pending").length,
        [requests]
    );
    const approvedCount = useMemo(
        () => requests.filter((r: any) => r.status?.toLowerCase() === "approved").length,
        [requests]
    );
    const rejectedCount = useMemo(
        () => requests.filter((r: any) => r.status?.toLowerCase() === "rejected").length,
        [requests]
    );

    const handleApprove = async (id: string, comments: string) => {
        await leaveRequestProcess({
            requestId: id,
            status: "approved",
            comments: comments || "",
        });
        refetch();
    };

    const handleReject = async (id: string, comments: string) => {
        await leaveRequestProcess({
            requestId: id,
            status: "rejected",
            comments: comments || "",
        });
        refetch();
    };

    if (error) {
        return (
            <div className="mx-auto max-w-md rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
                <p className="text-sm text-destructive">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat
                    icon={Clock}
                    label="Pending Requests"
                    value={pendingCount}
                    color="text-amber-500"
                    gradient="bg-amber-500/10"
                />
                <Stat
                    icon={Check}
                    label="Approved Leaves"
                    value={approvedCount}
                    color="text-emerald-500"
                    gradient="bg-emerald-500/10"
                />
                <Stat
                    icon={X}
                    label="Rejected Leaves"
                    value={rejectedCount}
                    color="text-destructive"
                    gradient="bg-destructive/10"
                />
                <Stat
                    icon={FileText}
                    label="Total Applications"
                    value={requests.length}
                    color="text-primary"
                    gradient="bg-primary/10"
                />
            </div>

            {/* Master-Detail Leave Requests Workspace */}
            <LeaveRequestMasterDetail
                requests={requests as any}
                isLoading={isLoading}
                onRefresh={refetch}
                mode="admin"
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={leaveRequestProcessLoading}
                organizationId={organizationId}
                onOrganizationChange={setOrganizationId}
                showOrgFilter={true}
                title="Leave Applications & Review Center"
                subtitle="Review pending employee leave requests, inspect schedule timelines, and finalize approval decisions."
            />
        </div>
    );
}