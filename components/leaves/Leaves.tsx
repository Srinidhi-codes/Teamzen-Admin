"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, Settings, BarChart3, Clock, Gift } from 'lucide-react'
import LeaveRequests from './LeaveRequests'
import LeaveBalance from './LeaveBalance'
import LeaveTypes from './LeaveTypes'
import { useStore } from '@/lib/store/useStore'
import { useRouter, useSearchParams } from 'next/navigation'

const LeavesPage = () => {
    const { user } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const tabs = useMemo(() => {
        if (!user) return [];
        const isRestrictedRole = user.role === "manager" || user.role === "hr";
        return [
            !isRestrictedRole && { id: "types", label: "Types", iconElement: <Settings className="w-5 h-5" />, color: "from-indigo-500 to-blue-600" },
            { id: "balance", label: "Balance", iconElement: <BarChart3 className="w-5 h-5" />, color: "from-emerald-500 to-teal-600" },
            { id: "requests", label: "Requests", iconElement: <Clock className="w-5 h-5" />, color: "from-orange-500 to-red-600" },
            !isRestrictedRole && { id: "holidays", label: "Holidays", iconElement: <Gift className="w-5 h-5" />, color: "from-purple-500 to-fuchsia-600" },
        ].filter(Boolean) as any[];
    }, [user]);

    const [activeTab, setActiveTab] = useState(() => {
        const isRestrictedRole = user?.role === "manager" || user?.role === "hr";
        const defaultTab = isRestrictedRole ? "balance" : "types";
        return (tabParam && tabs.find(t => t.id === tabParam)) ? tabParam : defaultTab;
    });

    useEffect(() => {
        const isRestrictedRole = user?.role === "manager" || user?.role === "hr";
        const defaultTab = isRestrictedRole ? "balance" : "types";

        if (tabParam && tabs.find(t => t.id === tabParam)) {
            setActiveTab(tabParam);
        } else if (!tabs.find(t => t.id === activeTab)) {
            setActiveTab(defaultTab);
        }
    }, [tabs, tabParam, user?.role, activeTab]);

    const handleActiveTab = (tab: string) => {
        if (tab) {
            setActiveTab(tab);
            router.push(`/leaves?tab=${tab}`);
        }
    }

    // Prevent rendering until user is loaded to avoid flicker
    if (!user) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Synchronizing Leave Data...</p>
        </div>
    );


    return (
        <div className="space-y-10">
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

            {/* Local Tab Switcher - Sticky */}
            <div className="sticky top-[80px] z-45 -mx-4 px-4 sm:-mx-8 sm:px-8 py-4 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-all duration-300">
                <div className="flex items-center bg-muted/40 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md w-fit ml-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleActiveTab(tab.id)}
                            className={`flex items-center space-x-2.5 px-6 py-2.5 rounded-xl transition-all duration-500 whitespace-nowrap ${activeTab === tab.id
                                ? `bg-primary text-white shadow-lg shadow-primary/20 -translate-y-0.5 font-bold`
                                : 'hover:bg-background/50 text-muted-foreground hover:text-foreground font-medium text-sm'
                                }`}
                        >
                            <span>{tab.iconElement}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

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