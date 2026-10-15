"use client";

import { useState } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useStore } from "@/lib/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../common/Input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { AUTH_INPUT_CLASS, AuthFooterLink, AuthSubmitButton } from "./auth-ui";
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
      setErrorModal({ isOpen: true, message: error.message || "Invalid credentials. Please try again." });
    }
  };

  return (
    <>
      <AuthShell
        title="Admin Sign In"
        description="Enter your administrator credentials to access the console."
      >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="email">
            Admin Email
          </label>
          <Input
            id="email"
            icon={<Mail className="h-4 w-4" />}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={AUTH_INPUT_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              prefetch={false}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            icon={<Lock className="h-4 w-4" />}
            placeholder="Enter your admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={AUTH_INPUT_CLASS}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground/70 hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Remember this workstation</span>
          </label>
          <span className="text-[11px] text-muted-foreground/75">Protected session</span>
        </div>

        <div className="pt-2">
          <AuthSubmitButton type="submit" disabled={login.isPending} loading={login.isPending}>
            {login.isPending ? "Authenticating…" : "Sign In to Console"}
          </AuthSubmitButton>
        </div>
      </form>

      <AuthFooterLink prompt="New organization?" href="/register" label="Set up an admin account" />
    </AuthShell>

    <ConfirmationModal
      isOpen={errorModal.isOpen}
      title="Authentication Error"
      description={errorModal.message || "Please check your email and password or contact your administrator."}
      onClose={() => setErrorModal({ isOpen: false, message: "" })}
      onConfirm={() => setErrorModal({ isOpen: false, message: "" })}
      confirmText="Close"
      variant="error"
      hideCancel={true}
    />
    </>
  );
}
