"use client";

import { AdminSidebar } from "./AdminSidebar";
import { useTokenRefresh } from "@/lib/api/hooks";
import { Navbar } from "../common/Navbar";
import AssistantWidget from "../ai";
import { OnboardingTour } from "../common/OnboardingTour";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const {
    sidebarCollapsed: isCollapsed,
    setSidebarCollapsed: setIsCollapsed,
    sidebarMobileOpen: isMobileOpen,
    setSidebarMobileOpen: setIsMobileOpen,
  } = useStore();
  useTokenRefresh();

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ scrollbarGutter: "stable" }}>
      <AdminSidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-200 ease-out",
          isCollapsed ? "md:ml-16" : "md:ml-60"
        )}
      >
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <AssistantWidget />
      <OnboardingTour />
    </div>
  );
}
