"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function ForgotPassword() {
  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-[#38ABB1]/30 selection:text-[#38ABB1] overflow-hidden"
      style={{
        backgroundColor: "#03090a",
        backgroundImage:
          "radial-gradient(ellipse 90% 65% at 50% -15%, rgba(56, 171, 177, 0.35), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 40%, rgba(56, 171, 177, 0.2), transparent 65%), radial-gradient(ellipse 55% 45% at 0% 70%, rgba(56, 171, 177, 0.18), transparent 60%)",
      }}
    >
      {/* Subtle landing grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          maskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
          backgroundImage:
            "linear-gradient(to right, rgba(56, 171, 177, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 171, 177, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div
        className="relative z-10 w-full max-w-[480px] rounded-3xl p-8 sm:p-10 flex flex-col"
        style={{
          backgroundColor: "#061315",
          border: "1px solid rgba(56, 171, 177, 0.28)",
          boxShadow:
            "0 25px 70px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(56, 171, 177, 0.22), 0 0 45px -10px rgba(56, 171, 177, 0.15)",
        }}
      >
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-3 group">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-[#38ABB1]/40 p-1.5 transition-transform group-hover:scale-105">
              <Image
                src="/images/teamzen_zoomed.webp"
                alt="Teamzen logo"
                width={36}
                height={36}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-tight group-hover:text-[#38ABB1] transition-colors">
                Teamzen
              </span>
              <span className="text-[11px] font-medium text-[#38ABB1]/90">
                Admin Workspace
              </span>
            </div>
          </Link>
        </div>

        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Admin Password Reset
          </h1>
          <p className="text-xs text-zinc-400">
            Security policy for administrator credentials.
          </p>
        </div>

        <div
          className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{
            backgroundColor: "rgba(7, 24, 26, 0.75)",
            border: "1px solid rgba(56, 171, 177, 0.25)",
          }}
        >
          <ShieldAlert className="h-5 w-5 text-[#38ABB1] shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-zinc-300">
            Self-service password reset is disabled for administrative accounts to protect your organization&apos;s payroll and employee data. Please contact your internal IT administrator or system owner to reset your credentials.
          </p>
        </div>

        <Link
          href="/login"
          className="h-10 px-6 rounded-full bg-gradient-to-r from-[#38ABB1] via-[#339fa5] to-[#267c82] hover:from-[#42bec4] hover:to-[#2c8d93] active:scale-[0.99] text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-[#38ABB1]/20 transition-all inline-flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
