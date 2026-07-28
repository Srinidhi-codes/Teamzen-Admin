"use client";

import { AdminSidebar } from "./AdminSidebar";
import { Navbar } from "../common/Navbar";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

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
