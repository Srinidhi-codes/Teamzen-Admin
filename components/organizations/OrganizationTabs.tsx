"use client"
import React from 'react'

interface OrganizationTabsProps {
    tabs: { id: string; label: string; icon: React.ReactNode; color: string }[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export function OrganizationTabs({ tabs, activeTab, setActiveTab }: OrganizationTabsProps) {
    return (
        <div className="p-2 rounded-2xl shadow-xl inline-flex space-x-2 overflow-x-auto bg-white/60 backdrop-blur-md border border-white/40">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 whitespace-nowrap ${activeTab === tab.id
                        ? `bg-linear-to-r ${tab.color} text-white shadow-lg shadow-black/10 scale-105`
                        : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
                        }`}
                >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="hidden sm:inline tracking-tight">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
