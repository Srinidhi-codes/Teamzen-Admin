"use client";

import { Fragment } from "react";
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
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  MessageSquare,
  ClipboardList,
  UserMinus,
  Bell,
  Mail,
  X,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import { hasPlanFeature } from "@/lib/plans";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  roles?: string[];
  /** Plan feature required to see this nav item */
  feature?: "advanced_analytics" | "policies";
}

const navItems: NavItem[] = [
  // ── 1. Overview ────────────────────────────────
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Overview" },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    section: "Overview",
    roles: ["superadmin", "admin", "hr"],
    feature: "advanced_analytics",
  },

  // ── 2. People & Workforce ──────────────────────
  { name: "Employees", href: "/employees", icon: Users, section: "Workforce" },
  {
    name: "Onboarding",
    href: "/onboarding",
    icon: UserPlus,
    section: "Workforce",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    name: "Offboarding",
    href: "/offboarding",
    icon: UserMinus,
    section: "Workforce",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileSpreadsheet,
    section: "Workforce",
    roles: ["superadmin", "admin", "hr"],
  },

  // ── 3. Time & Attendance ───────────────────────
  { name: "Attendance", href: "/attendance", icon: Clock, section: "Time & Work" },
  { name: "Leaves", href: "/leaves", icon: Calendar, section: "Time & Work" },

  // ── 4. Compensation & Payroll ──────────────────
  { name: "Payroll", href: "/payroll", icon: DollarSign, section: "Finance", roles: ["admin", "superadmin"] },

  // ── 5. Talent & Workspace ──────────────────────
  {
    name: "Performance",
    href: "/performance",
    icon: TrendingUp,
    section: "Talent & Culture",
    roles: ["superadmin", "admin", "hr", "manager"],
    feature: "advanced_analytics",
  },
  {
    name: "Policies",
    href: "/policies",
    icon: FileText,
    section: "Talent & Culture",
    roles: ["admin", "superadmin"],
    feature: "policies",
  },
  { name: "Feedback", href: "/feedback", icon: MessageSquare, section: "Talent & Culture" },

  // ── 6. System & Administration ─────────────────
  { name: "Organizations", href: "/organizations", icon: Building2, section: "Administration", roles: ["admin", "superadmin"] },
  { name: "Access Control", href: "/access-control", icon: ShieldCheck, section: "Administration", roles: ["admin", "superadmin"] },
  { name: "Email Templates", href: "/settings/email-templates", icon: Mail, section: "Administration", roles: ["admin", "superadmin"] },
  { name: "Moderation", href: "/moderation", icon: ShieldCheck, section: "Administration", roles: ["admin", "superadmin"] },
  { name: "Notifications", href: "/notifications", icon: Bell, section: "Administration" },
  { name: "Security", href: "/settings/security", icon: ShieldCheck, section: "Administration", roles: ["admin", "superadmin"] },
  { name: "Settings", href: "/settings", icon: Settings, section: "Administration", roles: ["admin", "superadmin"] },
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
  const { user } = useStore();

  const filteredNavItems = navItems.filter((item) => {
    if (!user) return false;
    if (item.roles && !item.roles.includes(user.role)) return false;
    // Superadmin is not plan-gated for nav visibility
    if (user.role === "superadmin") return true;
    if (
      item.feature &&
      !hasPlanFeature(user.organization?.plan, user.organization?.planExpiresAt, item.feature)
    ) {
      return false;
    }
    return true;
  });

  const isRailMode = isCollapsed && !isMobileOpen;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-90 bg-foreground/20 backdrop-blur-xs md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-100 flex flex-col overflow-x-hidden border-r border-border dark:border-slate-800/80 bg-card dark:bg-[#07111a] text-foreground dark:text-slate-200 transition-[width,transform] duration-200 ease-out shadow-xs dark:shadow-xl dark:shadow-black/20",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          isRailMode ? "md:w-[84px]" : "md:w-64",
          "w-64"
        )}
      >
        {/* ========================================================
            HEADER / BRAND LOGO
           ======================================================== */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border dark:border-white/10 px-3",
            isRailMode ? "justify-center" : "justify-between"
          )}
        >
          {isRailMode ? (
            <button
              type="button"
              onClick={toggleCollapse}
              className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/40 hover:bg-muted dark:bg-white/[0.04] dark:hover:bg-white/[0.08] p-2 border border-border/80 dark:border-white/10 shadow-xs hover:border-primary/50 dark:hover:border-[#38ABB1]/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Expand sidebar"
              aria-label="Toggle sidebar"
            >
              <Image
                src="/images/teamzen_zoomed.webp"
                alt="Teamzen"
                width={28}
                height={28}
                className="h-7 w-7 object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => (isMobileOpen ? closeMobile() : toggleCollapse())}
                className="flex min-w-0 items-center gap-3 px-1 text-left cursor-pointer group"
                title="Collapse sidebar"
                aria-label="Toggle sidebar"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 dark:bg-white/10 p-1.5 border border-primary/20 dark:border-white/10 group-hover:border-primary/50 dark:group-hover:border-[#38ABB1]/50 transition-colors">
                  <Image
                    src="/images/teamzen_zoomed.webp"
                    alt="Teamzen"
                    width={28}
                    height={28}
                    className="h-6 w-6 object-contain group-hover:scale-105 transition-transform"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground dark:text-white tracking-tight group-hover:text-primary dark:group-hover:text-[#38ABB1] transition-colors">
                    Teamzen
                  </p>
                  <p className="truncate text-[11px] text-primary dark:text-[#38ABB1] font-medium">
                    {user?.role === "superadmin" ? "Super Admin Portal" : "Admin Console"}
                  </p>
                </div>
              </button>

              <button
                onClick={toggleCollapse}
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors md:flex cursor-pointer"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={closeMobile}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors md:hidden cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* ========================================================
            NAVIGATION ITEMS
           ======================================================== */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-3",
            isRailMode ? "px-2 flex flex-col gap-1.5" : "px-3 space-y-1"
          )}
        >
          {filteredNavItems.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href + "/") &&
                !filteredNavItems.some(
                  (other) =>
                    other.href !== item.href &&
                    pathname.startsWith(other.href) &&
                    other.href.length > item.href.length
                ));
            const Icon = item.icon;
            const prevItem = index > 0 ? filteredNavItems[index - 1] : null;
            const isNewSection = !prevItem || prevItem.section !== item.section;

            if (isRailMode) {
              return (
                <Fragment key={item.href}>
                  {isNewSection && index > 0 && (
                    <div className="my-2 flex items-center justify-center w-full px-3.5" aria-hidden="true">
                      <div className="h-px w-full rounded-full bg-border dark:bg-white/20 shadow-xs" />
                    </div>
                  )}
                  <Link
                    href={item.href}
                    id={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    title={item.name}
                    className={cn(
                      "group relative flex flex-col items-center justify-center w-full min-h-[58px] py-2 px-1 rounded-2xl transition-all duration-200 select-none",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-[#38ABB1]/20 dark:text-[#4cd1d7] border border-primary/25 dark:border-[#38ABB1]/30 shadow-xs shadow-primary/10"
                        : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white hover:bg-muted/60 dark:hover:bg-white/[0.06] border border-transparent"
                    )}
                  >
                    {/* Glowing Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary dark:bg-[#38ABB1] shadow-[0_0_12px_rgba(56,171,177,0.5)]" />
                    )}

                    {/* Nav Icon */}
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive
                          ? "text-primary dark:text-[#4cd1d7] drop-shadow-[0_0_6px_rgba(56,171,177,0.5)]"
                          : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-slate-100"
                      )}
                    />

                    {/* Label below Icon */}
                    <span
                      className={cn(
                        "text-[10px] tracking-tight mt-1 truncate max-w-full text-center leading-tight transition-colors",
                        isActive
                          ? "font-bold text-primary dark:text-[#4cd1d7]"
                          : "font-medium text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-slate-100"
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                </Fragment>
              );
            }

            // Expanded Mode (Row Layout)
            return (
              <Fragment key={item.href}>
                {isNewSection && item.section && (
                  <div className={cn("px-2.5 pb-1 select-none", index > 0 ? "pt-4" : "pt-1")}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {item.section}
                    </p>
                  </div>
                )}
                <Link
                  href={item.href}
                  id={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => isMobileOpen && closeMobile()}
                  className={cn(
                    "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-[#38ABB1]/20 dark:text-[#4cd1d7] font-semibold border border-primary/25 dark:border-[#38ABB1]/25 shadow-xs"
                      : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white hover:bg-muted/60 dark:hover:bg-white/[0.06] border border-transparent"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-primary dark:bg-[#38ABB1] shadow-[0_0_10px_rgba(56,171,177,0.5)]" />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      isActive
                        ? "text-primary dark:text-[#4cd1d7]"
                        : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-white"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              </Fragment>
            );
          })}
        </nav>

        {/* ========================================================
            BOTTOM DOCKED ACTIONS: SETTINGS & CONTROLS
           ======================================================== */}
        <div className="border-t border-border/80 dark:border-slate-800 p-2 shrink-0">
          {isRailMode ? (
            <div className="flex flex-col items-center">
              <Link
                href="/settings"
                id="nav-admin-settings"
                title="System Settings"
                className={cn(
                  "group relative flex flex-col items-center justify-center w-full min-h-[54px] py-1.5 px-1 rounded-2xl transition-all duration-200 select-none",
                  pathname.startsWith("/settings")
                    ? "bg-primary/10 text-primary dark:bg-[#38ABB1]/20 dark:text-[#4cd1d7] border border-primary/25 dark:border-[#38ABB1]/30 shadow-xs"
                    : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white hover:bg-muted/60 dark:hover:bg-white/[0.06] border border-transparent"
                )}
              >
                {pathname.startsWith("/settings") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-primary dark:bg-[#38ABB1] shadow-[0_0_10px_rgba(56,171,177,0.5)]" />
                )}
                <Settings
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-45",
                    pathname.startsWith("/settings")
                      ? "text-primary dark:text-[#38ABB1]"
                      : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-white"
                  )}
                />
                <span className="text-[10px] font-medium tracking-tight mt-1">Settings</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/settings"
                id="nav-admin-settings-expanded"
                onClick={() => isMobileOpen && closeMobile()}
                className={cn(
                  "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname.startsWith("/settings")
                    ? "bg-primary/10 text-primary dark:bg-[#38ABB1]/20 dark:text-[#4cd1d7] font-semibold border border-primary/25 dark:border-[#38ABB1]/25"
                    : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white hover:bg-muted/60 dark:hover:bg-white/[0.06]"
                )}
              >
                {pathname.startsWith("/settings") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-primary dark:bg-[#38ABB1] shadow-[0_0_10px_rgba(56,171,177,0.5)]" />
                )}
                <Settings
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform group-hover:rotate-45 duration-300",
                    pathname.startsWith("/settings")
                      ? "text-primary dark:text-[#38ABB1]"
                      : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-white"
                  )}
                />
                <span className="truncate">Settings &amp; Configuration</span>
              </Link>

              <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-muted-foreground/70 dark:text-slate-400/60 border-t border-border/50 dark:border-white/5">
                <span>© {new Date().getFullYear()} Teamzen</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
