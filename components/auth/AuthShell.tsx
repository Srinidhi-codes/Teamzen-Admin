"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lock,
  Zap,
  Building2,
  Users,
} from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  sideImage?: string;
  sideImageAlt?: string;
  wide?: boolean;
}

export function AuthShell({
  children,
  title,
  description,
  sideImage = "/images/auth/login-admin.webp",
  sideImageAlt = "Teamzen admin workspace illustration",
  wide = false,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background lg:grid lg:grid-cols-12 selection:bg-[#38ABB1]/20 selection:text-[#38ABB1]">
      {/* ========================================================
          LEFT COLUMN: Interactive Admin Console Showcase (Desktop)
         ======================================================== */}
      <aside className="relative hidden lg:col-span-5 xl:col-span-5 2xl:col-span-5 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#08151f] lg:flex lg:flex-col lg:justify-between p-6 xl:p-10 text-white">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#38ABB1]/15 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/2 -right-32 h-[420px] w-[420px] rounded-full bg-[#38ABB1]/12 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-[440px] w-[440px] rounded-full bg-[#2a878c]/15 blur-[140px]" />

        {/* Tech Grid Pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:36px_36px] opacity-25" />

        {/* Top Brand Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/login" className="group inline-flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:ring-[#38ABB1]/50">
              <Image
                src="/images/teamzen_zoomed.webp"
                alt="Teamzen"
                width={36}
                height={36}
                priority
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#38ABB1] transition-colors">
                  Teamzen
                </span>
                <span className="inline-flex items-center rounded-full bg-[#38ABB1]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#38ABB1] dark:text-[#4cd1d7] ring-1 ring-[#38ABB1]/30">
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enterprise HRMS & Payroll Control</p>
            </div>
          </Link>
        </div>

        {/* Center Artwork Showcase with Floating Glass Cards */}
        <div className="relative z-10 my-auto py-5 w-full">
          <div className="relative mx-auto w-full max-w-2xl">
            {/* Visual Frame */}
            <div className="relative h-[320px] sm:h-[350px] lg:h-[360px] xl:h-[400px] w-full rounded-3xl overflow-hidden border border-white/15 bg-[#fbf9f5] shadow-2xl shadow-black/50 backdrop-blur-md group">
              <Image
                src={sideImage}
                alt={sideImageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-bottom transition-transform duration-700 group-hover:scale-[1.01]"
              />
              {/* Subtle film vignette */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/10" />

              {/* Floating Glass Card 1: Admin Authority */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-950/80 p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#38ABB1]/50">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#38ABB1]/20 text-[#38ABB1] ring-1 ring-[#38ABB1]/30">
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38ABB1] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38ABB1]"></span>
                  </span>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white">Privileged Access</p>
                    <span className="rounded bg-[#38ABB1]/20 px-1.5 py-0.2 text-[10px] font-medium text-[#38ABB1] dark:text-[#4cd1d7]">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Audit logs & 2FA enabled</p>
                </div>
              </div>

              {/* Floating Glass Card 2: Company Payroll Batch */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-950/80 p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#38ABB1]/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#38ABB1]/20 text-[#38ABB1] ring-1 ring-[#38ABB1]/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white">Payroll Batch Ready</p>
                    <span className="rounded bg-[#38ABB1]/20 px-1.5 py-0.2 text-[10px] font-medium text-[#38ABB1] dark:text-[#4cd1d7]">
                      All Branches
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">1,240 Employees Processed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Headline & Feature Tags */}
        <div className="relative z-10 w-full max-w-2xl mx-auto space-y-3.5">
          <div className="space-y-1.5">
            <h1 className="text-xl xl:text-2xl font-extrabold tracking-tight text-white leading-tight">
              Workforce, shift and <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#38ABB1] via-[#5dd6dc] to-white bg-clip-text text-transparent">
                payroll administration console.
              </span>
            </h1>
            <p className="text-xs xl:text-sm leading-relaxed text-slate-300/90">
              Manage employees, attendance rules, geofences, tax regimes, and payroll disbursement from one centralized workspace.
            </p>
          </div>

          {/* Quick Feature Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
              <Zap className="h-3 w-3 text-[#38ABB1]" />
              Bulk Payroll Runs
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
              <Building2 className="h-3 w-3 text-[#38ABB1]" />
              Multi-Entity Governance
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
              <Users className="h-3 w-3 text-[#38ABB1]" />
              Department Hierarchy
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/10">
            <span>Enterprise Security Guaranteed</span>
            <span>© {new Date().getFullYear()} Teamzen Pvt. Ltd.</span>
          </div>
        </div>
      </aside>

      {/* ========================================================
          RIGHT COLUMN: Elevated Auth Container
         ======================================================== */}
      <div className="relative flex min-h-screen flex-col justify-center px-4 py-6 sm:px-6 lg:col-span-7 xl:col-span-7 2xl:col-span-7 lg:px-8 xl:px-12 bg-slate-50/70 dark:bg-[#070b12]">
        {/* Ambient Background Light for Right Panel */}
        <div className="pointer-events-none absolute top-12 right-12 h-80 w-80 rounded-full bg-[#38ABB1]/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-12 left-12 h-72 w-72 rounded-full bg-[#38ABB1]/10 blur-[100px]" />

        <div className={`relative mx-auto w-full ${wide ? "max-w-lg" : "max-w-md"}`}>
          {/* Top Mobile Bar (Logo + Theme Toggle) */}
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link href="/login" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-card ring-1 ring-border shadow-xs">
                <Image
                  src="/images/teamzen_zoomed.webp"
                  alt="Teamzen"
                  width={28}
                  height={28}
                  priority
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="text-base font-bold text-foreground">Teamzen Admin</span>
            </Link>

            <ThemeSelector />
          </div>

          {/* Glass Form Card */}
          <div className="relative rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/85 p-6 sm:p-7 shadow-xl shadow-slate-950/5 dark:shadow-black/60 backdrop-blur-2xl transition-all">
            {/* Glowing Accent Top Border */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#38ABB1] to-transparent rounded-t-3xl" />

            {/* Header with Title and Desktop Theme Toggle */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#38ABB1]/15 border border-[#38ABB1]/30 text-[#38ABB1] dark:text-[#4cd1d7] shadow-sm shadow-[#38ABB1]/10">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#38ABB1]/25 bg-[#38ABB1]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#38ABB1] dark:text-[#4cd1d7]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38ABB1] animate-pulse" />
                    Admin Session
                  </span>
                  <div className="hidden lg:block">
                    <ThemeSelector />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
              {description ? (
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>

            {/* Form Content */}
            {children}

            {/* Security Guarantee Row */}
            <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3 text-[#38ABB1]" />
                256-Bit SSL
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#38ABB1]" />
                Admin 2FA
              </span>
              <span>•</span>
              <span>IP Geofenced</span>
            </div>
          </div>

          {/* Mobile Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
            © {new Date().getFullYear()} Teamzen Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
