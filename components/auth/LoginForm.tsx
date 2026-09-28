"use client";

import { useState } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useStore } from "@/lib/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../common/Input";
import { ArrowRight, Circle, Eye, EyeOff, Globe, LoaderCircle, Lock, Mail, Sparkles } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { loginUser } = useStore();

  const [isLocating, setIsLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState("");

  const requestLocation = async (): Promise<{latitude: number, longitude: number} | null> => {
    setIsLocating(true);
    setLocationError("");
    
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setShowLocationModal(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => {
          setIsLocating(false);
          if (err.code === 1) {
            setLocationError("Location is blocked. Please click the Lock icon (🔒) in your address bar and set Location to 'Allow' to continue.");
          } else {
            setLocationError("We couldn't pinpoint your location. Please try again.");
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
    
    // Try to get location
    const coords = await requestLocation();
    
    // If we got coords OR if the user deliberately wants to skip (handled by modal state)
    // Actually, we'll only proceed automatically if we HAVE coords.
    // If we DON'T have coords, the requestLocation will have already triggered the modal.
    // We only call the login mutation if coords are present OR if the user clicks "Cancel" in modal.
    
    if (coords) {
      performLogin(coords.latitude, coords.longitude);
    }
    // If no coords, we stay on this page while the modal is open.
    // The "Cancel" button in the modal will now trigger the login without coords.
  };

  const performLogin = async (lat?: number, lon?: number) => {
    try {
      const response = await login.mutateAsync({ 
        email, 
        password,
        latitude: lat ? parseFloat(lat.toFixed(10)) : undefined as any,
        longitude: lon ? parseFloat(lon.toFixed(10)) : undefined as any
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
    <div className="min-h-screen flex items-center justify-center login-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements - Premium Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-fuchsia-600/15 rounded-full blur-[100px] animate-float"></div>
      </div>


      <div className="max-w-[440px] w-full space-y-8 relative z-10">
        <div className="glass-login p-10 rounded-[32px] animate-slide-up">
          <div className="text-center mb-10">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Teamzen</h1>
            </Link>
            <h2 className="text-2xl font-medium text-white/90">Admin Portal</h2>
            <p className="mt-3 text-sm text-white/50">Enter your identifiers to access your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Email</label>
                <Input
                  icon={<Mail className="h-4 w-4" />}
                  name="email"
                  type="email"
                  required
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                />
              </div>


              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60 transition-colors"
                  >

                    {showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative flex items-center">
                   <input type="checkbox" className="peer appearance-none w-4 h-4 rounded border border-white/20 bg-white/5 checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer" />
                   <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                     <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                </div>
                <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" prefetch={false} className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>


            <button
              type="submit"
              disabled={login.isPending || isLocating}
              className="w-full h-[56px] bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
            >
              {isLocating ? (
                <>
                  <Sparkles className="animate-pulse w-5 h-5" />
                  <span>Syncing Location...</span>
                </>
              ) : login.isPending ? (
                <>
                  <LoaderCircle className="animate-spin w-5 h-5" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span className="tracking-wide">SIGN IN</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 tracking-wider">
          &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
        </p>
      </div>
      
      {/* Location Required Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm glass-login p-8 rounded-[32px] shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center animate-pulse">
                <Globe className="w-10 h-10 text-purple-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Location Required</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  To ensure a smooth and secure login flow, we need to verify your entry point. 
                  Please enable location access in your browser settings.
                </p>
              </div>

              {locationError && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-xs text-red-400 font-medium">{locationError}</p>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <button
                  onClick={() => requestLocation()}
                  disabled={isLocating}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLocating ? (
                    <LoaderCircle className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>RE-TRY SYNC</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => performLogin()}
                  className="w-full py-2 text-sm text-white/40 hover:text-white transition-colors"
                >
                  Skip & Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
