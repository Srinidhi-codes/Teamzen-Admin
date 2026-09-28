interface LeaveTabsProps {
  tabs: { id: string; label: string; icon: React.ReactNode; color?: string }[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export function LeaveTabs({ tabs, activeTab, setActiveTab }: LeaveTabsProps) {
  return (
    <div className="relative flex w-full gap-0 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={
              active
                ? "relative inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground"
                : "relative inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            <span className="h-4 w-4 shrink-0">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
