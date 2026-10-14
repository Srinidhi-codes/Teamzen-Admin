"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/api/hooks";
import { useStore } from "@/lib/store/useStore";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import ConfirmationModal from "../common/ConfirmationModal";

function markLocationSyncNeeded() {
  try {
    sessionStorage.setItem("teamzen_sync_location", "1");
  } catch {
    /* ignore */
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const router = useRouter();
  const { login } = useAuth();
  const { loginUser } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login.mutateAsync({
        email,
        password,
        remember_me: rememberMe,
      });

      if (response && response.user) {
        loginUser(response.user);
      }

      markLocationSyncNeeded();
      router.replace("/dashboard");
      router.refresh();
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        message: error.message || "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 font-sans selection:bg-[#38ABB1]/30 selection:text-[#38ABB1] overflow-hidden"
      style={{
        backgroundColor: "#03090a",
        backgroundImage:
          "radial-gradient(ellipse 90% 65% at 50% -15%, rgba(56, 171, 177, 0.35), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 40%, rgba(56, 171, 177, 0.2), transparent 65%), radial-gradient(ellipse 55% 45% at 0% 70%, rgba(43, 138, 143, 0.18), transparent 60%)",
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

      {/* Centered Floating Card Matching Landing Page Black & Teal Palette */}
      <div
        className="relative z-10 w-full max-w-[960px] min-h-[520px] md:min-h-[560px] rounded-3xl overflow-hidden flex flex-col md:flex-row"
        style={{
          backgroundColor: "#061315",
          border: "1px solid rgba(56, 171, 177, 0.28)",
          boxShadow:
            "0 25px 70px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(56, 171, 177, 0.22), 0 0 45px -10px rgba(56, 171, 177, 0.18)",
        }}
      >
        {/* Mobile Header Banner (Visible on < md screens) */}
        <div className="relative w-full h-44 overflow-hidden md:hidden">
          <Image
            src="/images/auth/login-geometric-teal.webp"
            alt="Admin pattern"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[#061315]/60 to-transparent" />
          <div className="relative z-10 p-6 flex flex-col justify-end h-full text-white">
            <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
              Admin Portal.
            </h2>
            <p className="text-xs text-white/85 line-clamp-2 mt-1">
              Workforce, attendance, and payroll administration.
            </p>
          </div>
        </div>

        {/* Left Section: Admin Login Form */}
        <div className="relative z-20 w-full md:w-[48%] lg:w-[45%] p-7 sm:p-9 md:p-10 lg:p-12 flex flex-col justify-center">
          {/* Prominent Teamzen Brand Header */}
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3 group">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300" htmlFor="admin-email">
                Admin Email
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                  style={{
                    backgroundColor: "#07181a",
                    border: "1px solid #164649",
                  }}
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#38ABB1]/80 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300" htmlFor="admin-password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  prefetch={false}
                  className="text-xs text-zinc-400 hover:text-[#38ABB1] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-11 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                  style={{
                    backgroundColor: "#07181a",
                    border: "1px solid #164649",
                  }}
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#38ABB1]/80 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#38ABB1] cursor-pointer"
                  style={{
                    backgroundColor: "#07181a",
                    borderColor: "#164649",
                  }}
                />
                <span className="text-xs text-zinc-300">Remember me</span>
              </label>
            </div>

            {/* Pill Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={login.isPending}
                className="h-10 px-9 rounded-full bg-gradient-to-r from-[#38ABB1] via-[#339fa5] to-[#267c82] hover:from-[#42bec4] hover:to-[#2c8d93] active:scale-[0.99] text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-[#38ABB1]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {login.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {login.isPending ? "SIGNING IN…" : "SIGN IN"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Low-Poly Diagonal Polygonal Panel (Desktop) in Landing Page Teal */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none select-none overflow-hidden rounded-3xl"
          style={{ clipPath: "polygon(34% 0%, 100% 0%, 100% 100%, 90% 100%)" }}
        >
          <Image
            src="/images/auth/login-geometric-teal.webp"
            alt="Geometric teal crystal pattern"
            fill
            priority
            sizes="65vw"
            className="object-cover object-right"
          />
          {/* Subtle gradient overlay to guarantee text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#061315]/40 via-transparent to-[#03090a]/65" />

          {/* Welcome Text Content: Positioned in top-right with text-right */}
          <div className="absolute top-12 lg:top-16 right-8 lg:right-14 z-10 flex flex-col items-end text-right max-w-[280px] lg:max-w-[320px]">
            <h2 className="text-4xl lg:text-[48px] font-extrabold tracking-tight text-white drop-shadow-lg leading-[1.08]">
              Admin
              <br />
              Portal.
            </h2>
            <p className="mt-4 text-xs lg:text-sm text-white/90 leading-relaxed font-normal max-w-[260px] lg:max-w-[290px] drop-shadow-md">
              Manage employees, attendance, leaves, and payroll processing from one centralized administrator workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation / Error Modal */}
      <ConfirmationModal
        isOpen={errorModal.isOpen}
        title="Authentication Error"
        description={
          errorModal.message ||
          "Please check your email and password or contact your system administrator."
        }
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        onConfirm={() => setErrorModal({ isOpen: false, message: "" })}
        confirmText="Close"
        variant="error"
        hideCancel={true}
      />
    </div>
  );
}
