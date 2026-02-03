interface LeaveTabsProps {
    tabs: { id: string; label: string; icon: string }[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export function LeaveTabs({ tabs, activeTab, setActiveTab }: LeaveTabsProps) {
    return (
        <div className="p-2 rounded-2xl shadow-lg inline-flex space-x-2 overflow-x-auto bg-white/60 backdrop-blur-sm">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id
                        ? "bg-linear-to-r from-gray-200/60 to-gray-200/60 text-black shadow-lg"
                        : "text-gray-600 hover:bg-white/50"
                        }`}
                >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
