"use client";

import { useState } from "react";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
import moment from "moment";
import { Button } from "../ui/button";

type Props = {
    correction: AttendanceCorrection;
    onClose: () => void;
    onSubmit: (status: "approved" | "rejected", comments: string) => Promise<void> | void;
};

export function ApprovalModal({ correction, onClose, onSubmit }: Props) {
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (status: "approved" | "rejected") => {
        setLoading(true);
        try {
            await onSubmit(status, comments);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => moment(dateStr).format("MMM DD, YYYY");
    const formatTime = (timeStr?: string | null) => timeStr ? moment(timeStr, "HH:mm:ss").format("hh:mm A") : "--";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-xl shadow-xl animate-scale-in text-black">
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Review Correction Request</h2>
                        <p className="text-sm text-gray-500">
                            {formatDate(correction.attendanceRecord.attendanceDate)}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-2">Original</h3>
                            <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">Login:</span> {formatTime(correction.attendanceRecord.loginTime)}</p>
                                <p><span className="text-gray-500">Logout:</span> {formatTime(correction.attendanceRecord.logoutTime)}</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-indigo-700 mb-2">Requested Change</h3>
                            <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">Login:</span> {formatTime(correction.correctedLoginTime)}</p>
                                <p><span className="text-gray-500">Logout:</span> {formatTime(correction.correctedLogoutTime)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Reason</p>
                        <p className="text-sm mt-1">{correction.reason}</p>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Approval/Rejection Comments</label>
                        <textarea
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="w-full mt-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Add a comment..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t flex justify-end gap-3">
                    <Button
                        variant={"outline"}
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant={"destructive"}
                            onClick={() => handleSubmit("rejected")}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            Reject
                        </Button>
                        <Button
                            variant={"default"}
                            onClick={() => handleSubmit("approved")}
                            disabled={loading}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Approve
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
