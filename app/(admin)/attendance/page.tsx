"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { useGraphQlAttendance, useAttendanceMutations, useCancelAttendanceCorrection, useApproveOrRejectAttendanceCorrection, useGraphQLAttendanceCorrection } from "@/lib/graphql/attendance/attendanceHooks";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { ApprovalModal } from "@/components/attendance/ApprovalModal";
import { AttendanceCorrection } from "@/lib/graphql/attendance/types";
import moment from "moment";

export default function AttendancePage() {
    const [startDate, setStartDate] = useState(moment().startOf("month").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selected, setSelected] = useState<AttendanceCorrection | null>(null);

    const { cancelAttendanceCorrection, cancelAttendanceCorrectionLoading } = useCancelAttendanceCorrection();
    const { attendanceCorrections, isLoading, refetchAttendanceCorrections } = useGraphQLAttendanceCorrection();

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
            alert("Failed to cancel correction");
        }
    };


    useEffect(() => {
        const startDate = moment().startOf("month").format("YYYY-MM-DD");
        const endDate = moment().format("YYYY-MM-DD");

        loadAttendance(startDate, endDate);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            loadAttendance(startDate, endDate);
        }
    }, [startDate, endDate]);



    const { approveOrRejectAttendanceCorrection, approveOrRejectAttendanceCorrectionLoading } = useApproveOrRejectAttendanceCorrection();

    const handleSubmit = async (status: "approved" | "rejected", comments: string) => {
        if (!selected) return;
        try {
            await approveOrRejectAttendanceCorrection(
                selected.id,
                status,
                comments
            );
            setSelected(null);
            refetchAttendanceCorrections({ startDate, endDate });
        } catch (err: any) {
            console.error(err);
            alert("Failed to submit correction");
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-black text-3xl font-bold">Attendance Correction</h1>
                <p className="text-gray-600">Request corrections for attendance records</p>
            </header>

            {/* Filters */}
            <Card title="Filter Attendance">
                <div className="grid md:grid-cols-3 gap-4 text-black">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />  {/*TODO: DatePicker */}
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <button
                        className="btn-primary"
                        onClick={() => loadAttendance(startDate, endDate)}
                    >
                        Search
                    </button>
                </div>
            </Card>

            {/* Table */}
            <Card title="Attendance Records">
                <AttendanceTable
                    data={attendanceCorrections}
                    isLoading={isLoading}
                    onApproveCorrection={setSelected}
                    onCancelCorrection={handleCancelCorrection}
                />
            </Card>

            {/* Correction Modal */}
            {selected && (
                <ApprovalModal
                    correction={selected}
                    onClose={() => setSelected(null)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
