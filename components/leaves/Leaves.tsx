"use client"
import React, { useState } from 'react'
import { Calendar } from 'lucide-react'

import { LeaveTabs } from './LeaveTabs'
import LeaveRequests from './LeaveRequests'
import LeaveBalance from './LeaveBalance'
import LeaveTypes from './LeaveTypes'
import { useStore } from '@/lib/store/useStore'

const LeavesPage = () => {
    const { user } = useStore();
    const [activeTab, setActiveTab] = useState("balance");

    const tabs = [
        user?.role !== "manager" && { id: "types", label: "Types", icon: "⚙️" },
        { id: "balance", label: "Balance", icon: "📊" },
        { id: "requests", label: "Requests", icon: "📅" },
        user?.role !== "manager" && { id: "holidays", label: "Holidays", icon: "🎉" },
    ].filter(Boolean) as { id: string; label: string; icon: string }[];

    React.useEffect(() => {
        if (user?.role !== "manager") {
            setActiveTab("types");
        } else {
            setActiveTab("balance");
        }
    }, [user?.role]);


    return (
        <div className="space-y-10 animate-fade-in pb-32">
            {/* Executive Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Time-Off Ecosystem</h1>
                </div>
                <p className="text-muted-foreground font-medium pl-13">Regulate and synchronize the organizational flow of absence.</p>
            </div>


            < div className="flex justify-between items-center" >
                <LeaveTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div >

            {/* Dynamic Content Repository */}
            < div className="animate-in fade-in slide-in-from-bottom-6 duration-700" >
                {activeTab === "types" && <LeaveTypes />}
                {activeTab === "balance" && <LeaveBalance />}
                {activeTab === "requests" && <LeaveRequests />}
                {
                    activeTab === "holidays" && (
                        <div className="bg-card rounded-4xl border border-border p-20 text-center shadow-2xl shadow-primary/5 animate-in zoom-in-95 duration-700">
                            <div className="text-7xl mb-6 animate-bounce-slow">✨</div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Global Festivals</h3>
                            <p className="text-muted-foreground font-medium max-w-sm mx-auto">Architecting the future of corporate festivities and observances.</p>
                            <div className="mt-8">
                                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Phase: In Development</span>
                            </div>
                        </div>
                    )}

            </div>
        </div>
    )
}

export default LeavesPage