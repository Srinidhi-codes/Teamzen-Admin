"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_LOGIN_HISTORY } from "@/lib/graphql/users/queries";
import { DataTable } from "@/components/admin/DataTable";
import { Card } from "@/components/common/Card";
import { 
    ShieldCheck, 
    Globe, 
    Clock, 
    Monitor, 
    User as UserIcon,
    AlertCircle,
    Loader2,
    Search
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function SecuritySettingsPage() {
    const [page, setPage] = useState(1);
    const { data, loading, error, refetch } = useQuery(GET_LOGIN_HISTORY, {
        variables: { page, pageSize: 50 },
        fetchPolicy: "network-only"
    }) as any;

    const logs = data?.globalLoginHistory || [];

    if (error) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <h2 className="text-xl font-black italic">Neural Link Failure</h2>
                <p className="text-muted-foreground max-w-md">Failed to synchronize security logs from the central core: {error.message}</p>
                <button onClick={() => refetch()} className="btn-primary mt-4">Attempt Resync</button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-rose-500/10 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-rose-500" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                            Security & Access Logs
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium"> Monitor institutional access vectors and neural link stability.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-xl border border-border/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monitoring Active</span>
                    </div>
                    <button 
                        onClick={() => refetch()} 
                        className="p-3 bg-muted/50 hover:bg-muted rounded-xl transition-all active:scale-95 border border-border/50"
                        title="Refresh Logs"
                    >
                        <Clock className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <Card className="premium-card p-0 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
                <div className="p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Institutional Entry History
                    </h3>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Filter access points..." 
                            className="bg-muted/50 border-border/50 rounded-lg pl-9 pr-4 py-1.5 text-[10px] font-medium focus:ring-2 focus:ring-primary/20 outline-hidden w-48 md:w-64"
                        />
                    </div>
                </div>

                <DataTable
                    isLoading={loading}
                    data={logs}
                    columns={[
                        {
                            key: "user",
                            label: "Neural Identity",
                            render: (_val, row: any) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                                        {row.user?.profilePictureUrl ? (
                                            <Image 
                                                src={row.user.profilePictureUrl} 
                                                alt="User" 
                                                width={32} 
                                                height={32} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="w-4 h-4 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-[11px] uppercase tracking-wider">{row.user?.firstName} {row.user?.lastName}</p>
                                        <p className="text-[9px] text-muted-foreground font-medium">{row.user?.email}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: "ipAddress",
                            label: "Entry Vector (IP)",
                            render: (val) => (
                                <div className="flex items-center gap-2">
                                    <code className="bg-muted px-2 py-1 rounded text-[10px] font-mono font-bold text-foreground/80 border border-border/50">
                                        {val || "0.0.0.0"}
                                    </code>
                                    <Globe className="w-3 h-3 text-muted-foreground/50" />
                                </div>
                            )
                        },
                        {
                            key: "loginTime",
                            label: "Entry Timestamp",
                            render: (val) => (
                                <div className="space-y-0.5">
                                    <p className="font-bold text-[10px] uppercase tracking-tight">{format(new Date(val), "MMM dd, yyyy")}</p>
                                    <p className="text-[9px] text-muted-foreground font-medium">{format(new Date(val), "HH:mm:ss")}</p>
                                </div>
                            )
                        },
                        {
                            key: "userAgent",
                            label: "System Matrix",
                            render: (val) => {
                                const ua = val?.toLowerCase() || '';
                                let os = "Unknown OS";
                                if (ua.includes('windows')) os = "Windows";
                                else if (ua.includes('macintosh') || ua.includes('mac os')) os = "macOS";
                                else if (ua.includes('linux')) os = "Linux";
                                else if (ua.includes('android')) os = "Android";
                                else if (ua.includes('iphone') || ua.includes('ipad')) os = "iOS";

                                let browser = "";
                                if (ua.includes('chrome')) browser = "Chrome";
                                else if (ua.includes('firefox')) browser = "Firefox";
                                else if (ua.includes('safari') && !ua.includes('chrome')) browser = "Safari";
                                else if (ua.includes('edge')) browser = "Edge";
                                
                                return (
                                    <div className="flex items-center gap-2 group/ua relative">
                                        <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-[10px] font-medium text-muted-foreground max-w-[150px] truncate" title={val}>
                                            {os} {browser && `(${browser})`}
                                        </span>
                                    </div>
                                );
                            }
                        },
                        {
                            key: "status",
                            label: "Authorization",
                            render: (val) => (
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    val === 'success' 
                                        ? "bg-emerald-100/50 text-emerald-700 border-emerald-200" 
                                        : "bg-rose-100/50 text-rose-700 border-rose-200"
                                )}>
                                    {val === 'success' ? 'Validated' : 'Rejected'}
                                </span>
                            )
                        }
                    ]}
                />

                {logs.length === 0 && !loading && (
                    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-20" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">No access vectors recorded in the current matrix.</p>
                    </div>
                )}
            </Card>

            {/* Footer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <Card className="premium-card p-6 bg-card/40 border-border/30 hover:border-primary/20 transition-all group">
                     <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unique Origins</p>
                        <Globe className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
                     </div>
                     <p className="text-2xl font-black italic">Active Monitoring</p>
                </Card>
                <Card className="premium-card p-6 bg-card/40 border-border/30 hover:border-primary/20 transition-all group">
                     <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Density</p>
                        <UserIcon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                     </div>
                     <p className="text-2xl font-black italic">Real-time Stream</p>
                </Card>
                <Card className="premium-card p-6 bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20 transition-all group">
                     <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/70">Risk Vectors</p>
                        <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                     </div>
                     <p className="text-2xl font-black italic text-rose-600">Secure Protocol</p>
                </Card>
            </div>
        </div>
    );
}
