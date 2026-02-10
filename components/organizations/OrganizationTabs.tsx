"use client"
import React from 'react'

interface OrganizationTabsProps {
    tabs: { id: string; label: string; icon: React.ReactNode; color: string }[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export function OrganizationTabs({ tabs, activeTab, setActiveTab }: OrganizationTabsProps) {
    return (
        <div className="p-2 rounded-[1.5rem] border border-border inline-flex space-x-1 overflow-x-auto bg-muted/40 backdrop-blur-md">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-3.5 rounded-2xl text-premium-label transition-all duration-500 flex items-center space-x-3 whitespace-nowrap active:scale-95 ${activeTab === tab.id
                        ? `bg-linear-to-r ${tab.color} text-white shadow-2xl shadow-black/10 -translate-y-1`
                        : "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-lg hover:shadow-primary/5"
                        }`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
                    <span className="hidden sm:inline tracking-widest uppercase">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
