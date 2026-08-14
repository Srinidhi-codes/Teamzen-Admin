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
      alert(error.message || "Login failed");
    }
  };

  return (
    <AuthShell title="Sign in" description="Use your admin credentials to continue.">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Email"
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              prefetch={false}
              className="text-sm font-medium text-primary hover:underline"
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={AUTH_INPUT_CLASS}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>

        <AuthSubmitButton type="submit" disabled={login.isPending} loading={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </AuthSubmitButton>
      </form>

      <AuthFooterLink prompt="New here?" href="/register" label="Create an account" />
    </AuthShell>
  );
}
