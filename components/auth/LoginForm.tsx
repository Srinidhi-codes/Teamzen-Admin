"use client";

import { useState } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useStore } from "@/lib/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../common/Input";
import { Eye, EyeOff, LoaderCircle, Lock, Mail, MapPin } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { loginUser } = useStore();

  const [isLocating, setIsLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState("");

  const requestLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    setIsLocating(true);
    setLocationError("");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setShowLocationModal(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setIsLocating(false);
          if (err.code === 1) {
            setLocationError(
              "Location access is blocked. Allow location for this site in your browser settings, then try again."
            );
          } else {
            setLocationError("We couldn't get your location. Please try again.");
          }
          setShowLocationModal(true);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const coords = await requestLocation();
    if (coords) {
      performLogin(coords.latitude, coords.longitude);
    }
  };

  const performLogin = async (lat?: number, lon?: number) => {
    try {
      const response = await login.mutateAsync({
        email,
        password,
        latitude: lat ? parseFloat(lat.toFixed(10)) : (undefined as any),
        longitude: lon ? parseFloat(lon.toFixed(10)) : (undefined as any),
      });

      if (response && response.user) {
        loginUser(response.user);
      }

      router.push("/dashboard");
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

        <button
          type="submit"
          disabled={login.isPending || isLocating}
          className={cn(
            "inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isLocating ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Checking location…
            </>
          ) : login.isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-dialog-title"
            className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 id="location-dialog-title" className="text-base font-semibold text-foreground">
                  Location required
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sign-in records your approximate location for security. Allow location access to continue, or skip if your browser blocks it.
                </p>
              </div>

              {locationError && (
                <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
                  <p className="text-xs text-destructive">{locationError}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => requestLocation().then((coords) => {
                    if (coords) performLogin(coords.latitude, coords.longitude);
                  })}
                  disabled={isLocating}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {isLocating ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    "Allow location"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationModal(false);
                    performLogin();
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Skip and sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
