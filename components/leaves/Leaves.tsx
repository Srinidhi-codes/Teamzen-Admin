"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, Settings, BarChart3, Clock, Gift } from 'lucide-react'
import LeaveRequests from './LeaveRequests'
import LeaveBalance from './LeaveBalance'
import LeaveTypes from './LeaveTypes'
import CompanyHolidays from './CompanyHolidays'
import { useStore } from '@/lib/store/useStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGraphQLUser } from '@/lib/api/graphqlHooks'

const LeavesPage = () => {
    const { user: storeUser } = useStore();
    const { user: graphqlUser, isLoading: isUserLoading } = useGraphQLUser();
    const user = storeUser || graphqlUser;
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
    if (!user && isUserLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Synchronizing Leave Data...</p>
        </div>
    );


    return (
        <div className="space-y-10">
            {/* Executive Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-10 pl-5 pb-10 border-b-2">
                <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full shadow-sm shadow-primary/20" />
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Leave Management</h1>
                    <p className="text-premium-label mt-2 opacity-60">Regulate and synchronize the organizational flow of absence.</p>
                </div>

                <div className="p-2 rounded-[1.5rem] border border-border inline-flex space-x-1 overflow-x-auto bg-muted/40 backdrop-blur-md">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleActiveTab(tab.id)}
                            className={`px-8 py-3.5 rounded-2xl text-premium-label transition-all duration-500 flex items-center space-x-3 whitespace-nowrap active:scale-95 ${activeTab === tab.id
                                ? `bg-primary text-white shadow-2xl shadow-primary/20 -translate-y-1 font-bold`
                                : "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-lg hover:shadow-primary/5"
                                }`}
                        >
                            <span className="group-hover:scale-110 transition-transform">{tab.iconElement}</span>
                            <span className="hidden sm:inline tracking-widest uppercase">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Content Repository */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700" >
                {activeTab === "types" && <LeaveTypes />}
                {activeTab === "balance" && <LeaveBalance />}
                {activeTab === "requests" && <LeaveRequests />}
                {
                    activeTab === "holidays" && <CompanyHolidays />
                }

            </div>
        </div>
    )
}

export default LeavesPage