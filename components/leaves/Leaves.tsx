"use client"
import React, { useState } from 'react'
import { LeaveTabs } from './LeaveTabs'
import LeaveRequests from './LeaveRequests'
import LeaveBalance from './LeaveBalance'
import LeaveTypes from './LeaveTypes'

const LeavesPage = () => {
    const [activeTab, setActiveTab] = useState("types");

    const tabs = [
        { id: "types", label: "Types", icon: "⚙️" },
        { id: "balance", label: "Balance", icon: "📊" },
        { id: "requests", label: "Requests", icon: "📅" },
        { id: "holidays", label: "Holidays", icon: "🎉" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
                <p className="text-gray-600 mt-1">Review and manage employee leave requests, balances, and holidays.</p>
            </div>

            <div className="flex justify-between items-center">
                <LeaveTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>

            <div className="animate-fade-in">
                {activeTab === "types" && <LeaveTypes />}
                {activeTab === "balance" && <LeaveBalance />}
                {activeTab === "requests" && <LeaveRequests />}
                {activeTab === "holidays" && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="text-4xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-gray-900">Holiday Calendar</h3>
                        <p className="text-gray-600 mt-2">Manage company-wide holidays and optional leaves.</p>
                        <p className="text-sm text-gray-400 mt-1">(Coming soon)</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeavesPage