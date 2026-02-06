"use client"
import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu } from "lucide-react";
import { useTokenRefresh } from "@/lib/api/hooks";
import { Navbar } from "../common/Navbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  useTokenRefresh();

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      <AdminSidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? "md:ml-24" : "md:ml-72"}`}>
        {/* Mobile Header */}
        <div className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between sticky top-0 z-30 border-b border-sidebar-border">
          <h1 className="text-xl font-bold">HRMS Admin</h1>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <Navbar />
        <main className="flex-1 p-8 overflow-x-hidden bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
