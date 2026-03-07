"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useStore } from "@/lib/store/useStore";
import { ThemeSelector } from "./ThemeSelector";
import client from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { NotificationBell } from "./NotificationBell";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, isLoading: isUserLoading, error: userError } = useGraphQLUser();
  const { logoutUser, organizations } = useStore();
  const router = useRouter();

  const orgLogo = organizations?.[0]?.logo?.url;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      logoutUser();
      router.push("/login");
    }
  };

  return (
    <nav className="bg-linear-to-br from-primary/20 via-background/10 to-background/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 hover:bg-muted/50 rounded-xl transition-all active:scale-95 text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 group shrink-0">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                {orgLogo ? (
                  <Image src={orgLogo} alt="Logo" width={40} height={40} className="object-cover" />
                ) : (
                  <span className="text-primary-foreground font-black text-xl">P</span>
                )}
              </div>
              <div className="flex-col hidden sm:flex">
                <span className="font-black text-lg text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
                  {organizations?.[0]?.name || "Payroll"}
                </span>
              </div>
            </Link>
          </div>


          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="flex items-center bg-muted/30 p-1.5 rounded-2xl border border-border/50 space-x-1">
              <NotificationBell />
              <ThemeSelector />
            </div>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 px-2 py-2 rounded-2xl transition-all hover:bg-muted/50 text-foreground group focus:outline-hidden">
                    {user.profilePictureUrl ? <Image src={user.profilePictureUrl || ""} alt="Avatar" width={40} height={40} className="object-cover rounded-xl w-10 h-10" /> : <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center text-primary-foreground text-sm font-black shadow-lg shadow-primary/10">
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </div>}
                    <div className="flex-col items-start hidden sm:flex">
                      <span className="text-sm font-black tracking-tight leading-none group-hover:text-primary transition-colors">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {user.role}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-3xl shadow-2xl border-border">
                  <DropdownMenuLabel className="px-4 py-3 bg-muted/20 rounded-2xl mb-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/5 cursor-pointer group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">👤</span>
                      <span className="text-sm font-bold">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000/dashboard"}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-primary cursor-pointer group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">🏠</span>
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
                        <span className="text-lg group-hover:scale-110 transition-transform">⚙️</span>
                        <span className="text-sm font-bold">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive cursor-pointer group focus:bg-destructive/10 focus:text-destructive"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
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
