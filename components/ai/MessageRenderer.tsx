"use client";

import { cn } from "@/lib/utils";
import { X, Calendar, Building2 } from "lucide-react";
import { useMessageParser } from "./useMessageParser";
import { InsightCard } from "./cards/InsightCard";

interface MessageRendererProps {
    content: string;
    role: string;
    handleSend?: (e?: React.FormEvent, customQuery?: string) => void;
    isLast?: boolean;
    isStreaming?: boolean;
}

export const MessageRenderer = ({ content, role, handleSend, isLast, isStreaming }: MessageRendererProps) => {
    const parts = useMessageParser(content);
    const showDots = isLast && isStreaming && role === 'assistant' && (parts.length === 0 || (parts.length === 1 && !parts[0].value.trim()));

    if (showDots) {
        return (
            <div className="bg-muted/50 border border-border rounded-3xl rounded-tl-none p-4 flex items-center gap-1.5 w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            </div>
        );
    }

    return (
        <div className="space-y-3 w-full">
            {parts.map((part, idx) => {
                if (part.type === 'text') {
                    const text = part.value.trim();
                    const isFinalPart = idx === parts.length - 1;
                    
                    if (!text) return null;
                    
                    return (
                        <div key={idx} className={cn(
                            "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed relative",
                            role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-none ml-auto shadow-md shadow-primary/10"
                                : "bg-muted/50 border border-border rounded-tl-none font-medium text-foreground/90"
                        )}>
                            {text}
                            {isLast && isStreaming && isFinalPart && (
                                <span className="inline-block w-2 h-4 bg-primary/40 ml-1 animate-pulse align-middle rounded-sm" />
                            )}
                        </div>
                    );
                } else if (part.type === 'balance') {
                         const { name, total, used, available } = part.value;
                         const usedNum = parseFloat(used) || 0;
                         const totalNum = parseFloat(total) || 1;
                         const percent = Math.min((usedNum / totalNum) * 100, 100);

                         return (
                             <div key={idx} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 animate-in zoom-in-95 duration-300">
                                 <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                                             <Calendar className="w-5 h-5" />
                                         </div>
                                         <div>
                                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Leave Type</p>
                                             <h4 className="font-black text-sm">{name}</h4>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Available</p>
                                         <p className="font-black text-lg text-primary leading-none">{available} <span className="text-[10px]">Days</span></p>
                                     </div>
                                 </div>

                                 <div className="space-y-2">
                                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                         <span>Used: {used}</span>
                                         <span>Total: {total}</span>
                                     </div>
                                     <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                         <div
                                             className="h-full bg-primary rounded-full transition-all duration-1000"
                                             style={{ width: `${percent}%` }}
                                         />
                                     </div>
                                 </div>
                             </div>
                         );
                } else if (part.type === 'attendance') {
                         const { action, status, time, office, distance, hours } = part.value;
                         return (
                             <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5 shadow-sm space-y-4 animate-in zoom-in-95 duration-300">
                                 <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                             <Building2 className="w-5 h-5" />
                                         </div>
                                         <div>
                                             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-0.5">{action}</p>
                                             <h4 className="font-black text-sm text-emerald-900">{office || "Office Location"}</h4>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-0.5">Time</p>
                                         <p className="font-black text-sm text-emerald-600 leading-none">{time}</p>
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-500/10">
                                     {distance && (
                                         <div>
                                             <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/50">Proximity</p>
                                             <p className="text-xs font-bold text-emerald-700">{distance}</p>
                                         </div>
                                     )}
                                     {hours && (
                                         <div>
                                             <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/50">Work Duration</p>
                                             <p className="text-xs font-bold text-emerald-700">{hours} hrs</p>
                                         </div>
                                     )}
                                     <div>
                                         <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/50">Status</p>
                                         <p className="text-xs font-bold text-emerald-700 capitalize">{status}</p>
                                     </div>
                                 </div>
                             </div>
                         );
                } else if (part.type === 'error') {
                    const { title, message } = part.value;
                    return (
                        <div key={idx} className="bg-destructive/5 border border-destructive/20 rounded-3xl p-5 shadow-sm space-y-2 animate-in zoom-in-95 duration-500 w-full">
                            <div className="flex items-center gap-2 text-destructive">
                                <X className="w-4 h-4" />
                                <h4 className="font-black text-xs uppercase tracking-widest">{title || "Error Occurred"}</h4>
                            </div>
                            <p className="text-sm text-destructive/80 font-medium">{message}</p>
                        </div>
                    );
                } else if (part.type === 'insight') {
                    return <InsightCard key={idx} {...part.value} />;
                }
                return null;
            })}
        </div>
    );
};
