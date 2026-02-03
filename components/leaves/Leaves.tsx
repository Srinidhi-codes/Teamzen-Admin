"use client"
import React, { useState } from 'react'
import { LeaveTabs } from './LeaveTabs'
import LeaveRequests from './LeaveRequests'
import LeaveBalance from './LeaveBalance'
import LeaveTypes from './LeaveTypes'
import { Settings, BarChart3, CalendarDays, PartyPopper, Clock, ShieldCheck, Zap, History } from "lucide-react"

const LeavesPage = () => {
    const [activeTab, setActiveTab] = useState("types");

    const tabs = [
        { id: "types", label: "Types", icon: <Settings className="w-5 h-5" />, color: "from-indigo-500 to-blue-600" },
        { id: "balance", label: "Balance", icon: <BarChart3 className="w-5 h-5" />, color: "from-emerald-500 to-teal-600" },
        { id: "requests", label: "Requests", icon: <CalendarDays className="w-5 h-5" />, color: "from-amber-500 to-orange-600" },
        { id: "holidays", label: "Holidays", icon: <PartyPopper className="w-5 h-5" />, color: "from-rose-500 to-fuchsia-600" },
    ];

    const stats = [
        { label: "Active Requests", count: "12", color: "amber", icon: Clock },
        { label: "Compliance Rate", count: "98%", color: "emerald", icon: ShieldCheck },
        { label: "Policy Coverage", count: "100%", color: "indigo", icon: Zap },
        { label: "Audit Logs", count: "450", color: "purple", icon: History },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-32">
            {/* Executive Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Time Governance</h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">Architect and oversee the temporal landscape of your workforce.</p>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 hover:scale-105 transition-all duration-500 overflow-hidden relative">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-50 rounded-full group-hover:scale-110 transition-transform`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-500 opacity-60`} />
                            </div>
                            <h3 className={`text-4xl font-black text-${stat.color}-600 tracking-tighter`}>{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Smart Navigation */}
            <div className="flex justify-between items-center">
                <LeaveTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>

            {/* Dynamic Content Repository */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                {activeTab === "types" && <LeaveTypes />}
                {activeTab === "balance" && <LeaveBalance />}
                {activeTab === "requests" && <LeaveRequests />}
                {activeTab === "holidays" && (
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-24 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-rose-50/20 via-transparent to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <PartyPopper className="w-12 h-12 text-rose-500" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Chronos Interface Pending</h3>
                            <p className="text-gray-500 max-w-sm mt-3 font-medium text-lg leading-relaxed">
                                The event synchronization engine is currently undergoing calibration. Operational status expected in the next cycle.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeavesPage