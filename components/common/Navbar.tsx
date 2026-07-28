"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MY_LOGIN_HISTORY } from "@/lib/graphql/users/queries";
import { SecurityLogResponse } from "@/lib/graphql/users/types";
import { useStore } from "@/lib/store/useStore";
import { ThemeSelector } from "./ThemeSelector";
import client from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";

import { NotificationBell } from "./NotificationBell";
import { Calendar, CircleDollarSign, Clock, LayoutDashboard, LogOut, Menu, Plane, Settings, User, Compass, Globe } from "lucide-react";
import { useOnboardingTour } from "./OnboardingTour";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface NavbarProps {
  onMenuClick?: () => void;
  isSidebarCollapsed?: boolean;
}

const IMPORTANT_ROUTES = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leaves", href: "/leaves", icon: Calendar },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Payroll", href: "/payroll", icon: CircleDollarSign, roles: ["admin", "superadmin"] },
];

function planLabel(plan?: string) {
  const p = (plan || "free").toLowerCase();
  if (p === "pro") return "Pro";
  if (p === "elite") return "Elite";
  return "Free";
}

function planBadgeClass(plan?: string) {
  const p = (plan || "free").toLowerCase();
  if (p === "elite") return "bg-violet-500/15 text-violet-700 dark:text-violet-300";
  if (p === "pro") return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  return "bg-muted text-muted-foreground";
}

export function Navbar({ onMenuClick, isSidebarCollapsed = false }: NavbarProps) {
  const { logoutUser, user: storeUser, setAuthenticatedUser } = useStore();
  const { user: graphqlUser, isLoading: isUserLoading } = useGraphQLUser(); // Sync with DB
  const { data } = useQuery<SecurityLogResponse>(GET_MY_LOGIN_HISTORY, {
    variables: { page: 1, pageSize: 1 },
    fetchPolicy: "cache-first" // Use cache from banner
  });
  const { startTour } = useOnboardingTour();
  const router = useRouter();
  const pathname = usePathname();
  const orgLogo = (graphqlUser || storeUser)?.organization?.logo?.url;

  // Sync GraphQL user to store if store is empty (e.g. after refresh)
  useEffect(() => {
    if (graphqlUser && !storeUser && !isUserLoading) {
      setAuthenticatedUser(graphqlUser as any);
    }
  }, [graphqlUser, storeUser, isUserLoading, setAuthenticatedUser]);

  const user = graphqlUser || storeUser;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear store significantly
      logoutUser();
      localStorage.clear();
      // Use window.location.href to force a full page refresh and clear in-memory state
      window.location.href = "/login";
    }
  };

  // Scroll to top if clicking the currently active route
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
    if (isActive) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Visibility state for smart hiding
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const stopTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine theme/styling (Floating vs Full width)
      setIsScrolled(window.innerWidth >= 768);

      // --- SMART VISIBILITY LOGIC ---
      // 1. Clear previous timeout
      if (stopTimeout.current) clearTimeout(stopTimeout.current);

      // 2. Always show at the top
      if (currentScrollY < 20) {
        setIsVisible(true);
      }
      // 3. Hide if scrolling down, show if scrolling up
      else {
        setIsVisible(currentScrollY < lastScrollY.current);
      }

      // 4. Show when scrolling stops (pattern detection)
      stopTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 150);

      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (stopTimeout.current) clearTimeout(stopTimeout.current);
    };
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-70 pointer-events-none transition-all duration-500 ease-in-out transform",
      isScrolled ? "px-4 sm:px-6 py-4" : "px-0 py-0",
      isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
    )}>
      <div className={cn(
        "flex justify-between items-center pointer-events-auto transition-all duration-500 ease-in-out",
        isScrolled
          ? "gap-4 bg-background px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary/10 border-border/40 max-w-7xl mx-auto w-full"
          : "gap-4 bg-background border-b border-border/30 px-4 sm:px-8 py-4 shadow-xs"
      )}>
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            {/* Mobile Menu Toggle */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 hover:bg-muted/50 rounded-xl transition-all active:scale-95 text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 group shrink-0">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                {orgLogo ? (
                  <Image src={orgLogo} alt="Logo" width={40} height={40} className="object-cover" unoptimized />
                ) : (
                  <span className="text-primary-foreground font-black text-xl">
                    {user?.organization?.name?.charAt(0) || 'P'}
                  </span>
                )}
              </div>
              <div className="flex-col hidden sm:flex">
                <span className="font-black text-sm text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
                  {user?.organization?.name || 'Teamzen'}
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider leading-none",
                      planBadgeClass(user?.organization?.plan)
                    )}
                  >
                    {planLabel(user?.organization?.plan)}
                  </span>
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">
                    {user?.role === 'admin' || user?.role === 'superadmin' ? 'Strategic Intelligence' : 'Workforce Cluster'}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex-1 hidden lg:flex justify-center px-4 overflow-hidden">
            <div className="flex items-center bg-muted/40 p-1 rounded-2xl border border-border/50 backdrop-blur-md max-w-full overflow-x-auto scrollbar-hide animate-slide-up duration-300">
              {IMPORTANT_ROUTES.filter(route => !route.roles || (user && route.roles.includes(user.role))).map((route) => {
                const isActive = route.href === '/dashboard' ? pathname === route.href : pathname.startsWith(route.href);
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    id={`navbar-nav-${route.name.toLowerCase()}`}
                    onClick={(e) => handleNavClick(e, route.href)}
                    className={cn(
                      "flex items-center space-x-2.5 px-4 sm:px-6 py-2 rounded-xl transition-all duration-300 group whitespace-nowrap",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    )}
                  >
                    <route.icon className={cn("w-5 h-5 transition-transform group-hover:scale-125", isActive && "scale-110")} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">
                      {route.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section: User Menu & Tools */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="flex items-center p-1 space-x-1">
              <NotificationBell />
              <ThemeSelector />
            </div>

            {user && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    id="user-menu-trigger"
                    className="flex items-center space-x-3 px-1 sm:px-2 py-2 rounded-2xl transition-all hover:bg-muted/50 text-foreground group focus:outline-none"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-border/50 shadow-sm ${!user.profilePictureUrl ? 'bg-linear-to-br from-primary to-primary/60 text-primary-foreground text-[10px] sm:text-xs font-black' : ''}`}>
                      {user?.profilePictureUrl ? (
                        <Image
                          src={user?.profilePictureUrl as string}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <>
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </>
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-3xl shadow-2xl border-border bg-card/80 backdrop-blur-xl">
                  <DropdownMenuLabel className="px-4 py-3 bg-muted/20 rounded-2xl mb-1">
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-md font-black text-primary uppercase tracking-widest">
                          {user.firstName} {user.lastName}
                        </span>
                        {/* Geo-Status Badge */}
                        {(() => {
                          const isVerified = data?.mySecurityLogs?.results?.[0]?.latitude;
                          return (
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[7px] font-black uppercase tracking-tighter",
                              isVerified
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                            )}>
                              <Globe className="w-2 h-2" />
                              {isVerified ? "Verified" : "Unverified"}
                            </div>
                          );
                        })()}
                      </div>
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                        {user.role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem asChild>
                    <a
                      href={process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000/dashboard"}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-primary cursor-pointer group"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">User Portal</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Personal View</span>
                      </div>
                    </a>
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.role === "superadmin") && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/5 cursor-pointer group"
                      >
                        <span className="text-sm font-bold">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive cursor-pointer group focus:bg-destructive/10 focus:text-destructive"
                  >
                    <span className="text-sm font-bold">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
