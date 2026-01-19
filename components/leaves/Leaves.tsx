"use client"
import { useState } from "react";
import { Check, X, Calendar } from "lucide-react";
import { LeaveRequest } from "@/types/admin";
import { Column, DataTable } from "../admin/DataTable";

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
            render: (request) => (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {request.leave_type_name}
                </span>
            ),
        },
        {
            key: "from_date",
            label: "Duration",
            render: (request) => (
                <div className="text-sm">
                    <div>{request.from_date}</div>
                    <div className="text-gray-500">to {request.to_date}</div>
                    <div className="text-xs text-gray-400 mt-1">{request.days} days</div>
                </div>
            ),
        },
        {
            key: "reason",
            label: "Reason",
            render: (request) => (
                <div className="text-sm text-gray-600 max-w-xs truncate">
                    {request.reason}
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (request) => (
                <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${request.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (request) =>
                request.status === "pending" ? (
                    <div className="flex space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequest(request);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                            Review
                        </button>
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm">-</span>
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
                <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
                <p className="text-gray-600 mt-1">Review and approve employee leave requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-600">Pending</div>
                            <div className="mt-2 text-3xl font-bold text-yellow-600">{pendingCount}</div>
                        </div>
                        <Calendar className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-600">Approved</div>
                            <div className="mt-2 text-3xl font-bold text-green-600">{approvedCount}</div>
                        </div>
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-600">Rejected</div>
                            <div className="mt-2 text-3xl font-bold text-red-600">{rejectedCount}</div>
                        </div>
                        <X className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-sm font-medium text-gray-600">Total Requests</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{leaveRequests.length}</div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={leaveRequests}
                columns={columns}
                searchPlaceholder="Search by employee name or leave type..."
                onRowClick={(request) => request.status === "pending" && setSelectedRequest(request)}
            />

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Leave Request</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Employee</label>
                                    <p className="text-gray-900">{selectedRequest.user_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Leave Type</label>
                                    <p className="text-gray-900">{selectedRequest.leave_type_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">From Date</label>
                                    <p className="text-gray-900">{selectedRequest.from_date}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">To Date</label>
                                    <p className="text-gray-900">{selectedRequest.to_date}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Duration</label>
                                    <p className="text-gray-900">{selectedRequest.days} days</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Applied On</label>
                                    <p className="text-gray-900">{selectedRequest.applied_date}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Reason</label>
                                <p className="text-gray-900 mt-1">{selectedRequest.reason}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comments
                                </label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Add your comments..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setComments("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(selectedRequest.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedRequest.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}