"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Leaves", href: "/leaves", icon: "📅" },
  { name: "Attendance", href: "/attendance", icon: "📍" },
  { name: "Payroll", href: "/payroll", icon: "💰" },
  { name: "Employees", href: "/employees", icon: "👥" },
  { name: "Analytics", href: "/analytics", icon: "📈" },
  { name: "Admin", href: "/admin", icon: "⚙️", roles: ["admin", "hr"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading: isUserLoading, error: userError } = useGraphQLUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"
        } bg-sidebar text-sidebar-foreground h-[calc(100vh-64px)] overflow-y-auto sticky top-16 transition-all duration-300 flex flex-col border-r border-border`}
    >

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition text-xl"
      >

        {isCollapsed ? "→" : "←"}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}

              title={isCollapsed ? item.name : ""}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border text-[10px] text-sidebar-foreground/50">
          <p>© 2025 Payroll System</p>
          <p>v1.0.0</p>
        </div>
      )}

    </aside>
  );
}
