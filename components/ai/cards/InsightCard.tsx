"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, BookOpen, Sparkles, TrendingUp } from "lucide-react";

interface InsightCardProps {
    title: string;
    message: string;
    type: string;
    stats?: string;
    topic?: string;
}

export const InsightCard = ({ title, message, type, stats, topic }: InsightCardProps) => {
    const isWarning = type === 'warning' || type === 'anomaly';
    const isPolicy = topic?.toLowerCase().includes('policy') || type === 'policy';
    const isStats = type === 'stats' || !!stats;

    return (
        <div className={cn(
            "relative overflow-hidden bg-card border border-border rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full group/insight",
            "before:absolute before:inset-0 before:bg-linear-to-br before:opacity-[0.03] before:pointer-events-none",
            isWarning
                ? "before:from-amber-500 before:to-transparent border-amber-500/20"
                : isPolicy
                    ? "before:from-emerald-500 before:to-transparent border-emerald-500/20"
                    : "before:from-primary before:to-transparent"
        )}>
            <div className={cn(
                "absolute -right-20 -top-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-20",
                isWarning ? "bg-amber-500" : isPolicy ? "bg-emerald-500" : "bg-primary"
            )} />

            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0",
                    isWarning
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                        : isPolicy
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                            : "bg-primary/10 border-primary/20 text-primary"
                )}>
                    {isWarning ? (
                        <AlertTriangle className="w-5 h-5" />
                    ) : isPolicy ? (
                        <BookOpen className="w-5 h-5" />
                    ) : isStats ? (
                        <TrendingUp className="w-5 h-5" />
                    ) : (
                        <Sparkles className="w-5 h-5" />
                    )}
                </div>
                <h4 className={cn(
                    "text-sm font-semibold",
                    isWarning ? "text-amber-600" : "text-foreground"
                )}>
                    {title || "Insight"}
                </h4>
            </div>

            <div className="max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent pr-2">
                <div className="text-[14px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">
                    {message}
                </div>
            </div>

            {stats && (
                <div className="pt-4 flex flex-wrap gap-x-10 gap-y-4 border-t border-border/40 relative">
                    {stats.replace(/[{}]/g, '').split(',').map((s: string, i: number) => {
                        const firstColonIndex = s.indexOf(':');
                        const k = firstColonIndex !== -1 ? s.slice(0, firstColonIndex).trim() : s.trim();
                        const v = firstColonIndex !== -1 ? s.slice(firstColonIndex + 1).trim() : '';
                        if (!k) return null;
                        return (
                            <div key={i}>
                                <p className="text-xs font-medium text-muted-foreground mb-1">{k}</p>
                                <p className="text-sm font-semibold text-foreground">{v}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
