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
    bg-indigo-900 text-white
    transition-all duration-300
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    ${isCollapsed ? "md:w-20" : "md:w-64"}
    w-64
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
        <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-800">
          {(!isCollapsed || isMobileOpen) && (
            <h1 className="text-xl font-bold truncate">HRMS Admin</h1>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-2 hover:bg-indigo-800 rounded-lg transition"
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
            className="md:hidden p-2 hover:bg-indigo-800 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobileOpen && closeMobile()} // Close sidebar on mobile nav click
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition ${isActive
                  ? "bg-indigo-700 text-white"
                  : "text-indigo-100 hover:bg-indigo-800"
                  }`}
                title={isCollapsed && !isMobileOpen ? item.name : ""}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="font-medium truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 border-t border-indigo-800 text-xs text-indigo-200">
            <p>© 2025 HRMS System</p>
            <p className="mt-1">Admin Panel v1.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
