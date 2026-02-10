"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Organizations", href: "/organizations", icon: Building2 },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Leaves", href: "/leaves", icon: Calendar },
  { name: "Payroll", href: "/payroll", icon: DollarSign },
  { name: "Performance", href: "/performance", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export interface AdminSidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export function AdminSidebar({
  isCollapsed,
  toggleCollapse,
  isMobileOpen,
  closeMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50
    flex flex-col
    bg-sidebar text-sidebar-foreground
    transition-all duration-500 ease-in-out
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    ${isCollapsed ? "md:w-24" : "md:w-72"}
    w-72
    border-r border-sidebar-border
    shadow-2xl md:shadow-none
  `;



  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border/50">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-black text-xs">P</span>
              </div>
              <h1 className="text-lg font-black tracking-tighter text-foreground truncate uppercase">HRMS <span className="text-primary">Admin</span></h1>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all active:scale-90"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobile}
            className="md:hidden p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>



        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobileOpen && closeMobile()} // Close sidebar on mobile nav click
                className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${isActive
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]"
                  : "text-sidebar-foreground/60 hover:bg-primary/5 hover:text-primary"
                  }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                title={isCollapsed && !isMobileOpen ? item.name : ""}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className={`font-black text-[13px] uppercase tracking-wider truncate transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                    {item.name}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>


        {/* Footer */}
        <div className="p-6 border-t border-sidebar-border/50">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="animate-in fade-in duration-700">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">© 2025 HRMS <span className="text-primary/50">Core</span></p>
              <div className="mt-3 flex items-center space-x-2 bg-muted/30 p-2 rounded-xl border border-border/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">System Active</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            </div>
          )}
        </div>


      </aside>
    </>
  );
}
