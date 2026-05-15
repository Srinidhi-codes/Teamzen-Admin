import Link from "next/link";
import { Mail, ArrowLeft, ShieldAlert } from "lucide-react";

export default function ForgotPassword() {
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
                        <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                            <ShieldAlert className="w-8 h-8 text-purple-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Forgot Password?</h2>
                        <p className="mt-3 text-sm text-white/50 leading-relaxed">
                            Self-service password reset is currently disabled for administrative accounts.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                            <p className="text-sm text-white/70 leading-relaxed">
                                Please contact your system administrator or the IT department to initiate a manual password reset protocol.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/login"
                                className="w-full h-[56px] bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span>BACK TO LOGIN</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-white/30 tracking-wider">
                    &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
                </p>
            </div>
        </div>
    );
}
