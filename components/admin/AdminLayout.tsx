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
    <div className="flex min-h-screen bg-background text-foreground" style={{ scrollbarGutter: 'stable' }}>

      <AdminSidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${isCollapsed ? "md:ml-24" : "md:ml-72"}`}>
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
