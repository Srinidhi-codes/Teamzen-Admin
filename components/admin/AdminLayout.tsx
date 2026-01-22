"use client"
import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        {/* Mobile Header */}
        <div className="md:hidden bg-indigo-900 text-white p-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-xl font-bold">HRMS Admin</h1>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 hover:bg-indigo-800 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
