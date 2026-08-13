"use client";

import { AdminSidebar } from "./AdminSidebar";
import { Navbar } from "../common/Navbar";
import { LocationSyncBanner } from "../common/LocationSyncBanner";
import { PlanExpiryBanner } from "../common/PlanExpiryBanner";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useOrgPlan } from "@/lib/hooks/useOrgPlan";

const AssistantWidget = dynamic(() => import("../ai"), {
  ssr: false,
  loading: () => null,
});
const OnboardingTour = dynamic(
  () => import("../common/OnboardingTour").then((mod) => mod.OnboardingTour),
  { ssr: false, loading: () => null }
);

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
  const { can } = useOrgPlan();

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
        <PlanExpiryBanner />
        <LocationSyncBanner />
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {can("ai_assistant") && <AssistantWidget />}
      <OnboardingTour />
    </div>
  );
}
