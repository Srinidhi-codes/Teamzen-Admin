"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useState } from "react";
import { ThemeSelector } from "./ThemeSelector";


export function Navbar() {
  const { user, isLoading: isUserLoading, error: userError } = useGraphQLUser();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="text-primary-foreground font-black text-xl">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
                Payroll
              </span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1">
                Admin Panel
              </span>
            </div>
          </Link>


          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-muted/30 p-1.5 rounded-2xl border border-border/50">
              <ThemeSelector />
            </div>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center space-x-3 px-2 py-2 rounded-2xl transition-all ${dropdownOpen ? 'bg-primary/5 text-primary' : 'hover:bg-muted/50 text-foreground'}`}
                >
                  <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center text-primary-foreground text-sm font-black shadow-lg shadow-primary/10">

                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </div>
                  <div className="flex-col items-start hidden sm:flex">

                    <span className="text-sm font-black tracking-tight leading-none group-hover:text-primary">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      Administrator
                    </span>
                  </div>
                </button>



                {/* Dropdown */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-3xl shadow-2xl py-3 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-border/50 bg-muted/20 mb-2">
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-primary/5 text-sm font-bold text-foreground transition-colors group"
                      >
                        <span className="group-hover:scale-110 transition-transform">👤</span>
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-primary/5 text-sm font-bold text-foreground transition-colors group"
                      >
                        <span className="group-hover:scale-110 transition-transform">⚙️</span>
                        <span>Settings</span>
                      </Link>

                      <hr className="my-2 border-border/50" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-destructive/10 text-sm font-bold text-destructive transition-colors group"
                      >
                        <span className="group-hover:scale-110 transition-transform">🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
