import Link from "next/link";

export default function ForgotPassword() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="animate-fade-in text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-200 mb-6 transform hover:rotate-6 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Self-service password reset is currently disabled.
                    </p>
                </div>

                <div className="glass p-8 rounded-3xl animate-slide-up bg-white/50 border border-gray-200 shadow-xl">
                    <div className="text-center space-y-4">
                        <p className="text-gray-700">
                            Please contact your system administrator or the IT department to reset your password.
                        </p>

                        <div className="pt-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transform active:scale-[0.98] transition-all"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
