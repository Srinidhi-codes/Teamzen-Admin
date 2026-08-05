"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X, Calendar, Building2 } from "lucide-react";
import { useMessageParser } from "./useMessageParser";
import { useChatTypewriter } from "./useChatTypewriter";
import { InsightCard } from "./cards/InsightCard";
import { PayrollCard } from "./cards/PayrollCard";
import { CitationChips } from "./CitationChips";
import { CorrectionCard } from "./cards/CorrectionCard";
import { RouteCard } from "./cards/RouteCard";
import { TypingIndicator } from "./TypingIndicator";
import type { PolicySource } from "@/lib/api/assistant";

interface MessageRendererProps {
    content: string;
    role: string;
    handleSend?: (e?: React.FormEvent, customQuery?: string) => void;
    isLast?: boolean;
    isStreaming?: boolean;
    activeTool?: { name: string; status: 'running' | 'completed' } | null;
    sources?: PolicySource[];
}

const renderInlineFormatting = (text: string, onPrimary = false) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const cleanBoldText = part.slice(2, -2);
            return (
                <span
                    key={idx}
                    className={cn(
                        "font-semibold",
                        onPrimary ? "text-primary-foreground" : "text-foreground"
                    )}
                >
                    {cleanBoldText}
                </span>
            );
        }
        return part;
    });
};

const renderTextWithFormatting = (
    text: string,
    trailingCursor?: React.ReactNode,
    onPrimary = false
) => {
    let lines = text.split('\n');
    const processedLines: string[] = [];
    for (const line of lines) {
        if (line.includes(' - **') || line.includes(' - *')) {
            const parts = line.split(/(?=\s-\s)/);
            for (const part of parts) {
                processedLines.push(part.replace(/^\s*-\s*/, '').trim());
            }
        } else {
            processedLines.push(line);
        }
    }
    lines = processedLines;

    return (
        <div className="space-y-1.5 w-full">
            {lines.map((line, lineIdx) => {
                const isLastLine = lineIdx === lines.length - 1;
                let currentLine = line.trim();
                
                if (currentLine === '') {
                    return <div key={lineIdx} className="h-1" />;
                }

                const isOriginalListItem = /^[-*•]\s+/.test(line.trim());
                currentLine = currentLine.replace(/^[-*•]\s+/, '');

                const isHeading = line.trim().startsWith('###') || line.trim().startsWith('##') || line.trim().startsWith('#');
                if (isHeading) {
                    const cleanText = line.trim().replace(/^#+\s*/, '');
                    return (
                        <h4 
                            key={lineIdx} 
                            className={cn(
                                "font-semibold text-sm pb-1 mb-1 mt-2 border-b",
                                onPrimary
                                    ? "text-primary-foreground border-primary-foreground/25"
                                    : "text-foreground border-border"
                            )}
                        >
                            {renderInlineFormatting(cleanText, onPrimary)}
                            {isLastLine && trailingCursor}
                        </h4>
                    );
                }

                const isSubHeaderOnly = currentLine.endsWith(':') && !isOriginalListItem;
                if (isSubHeaderOnly) {
                    return (
                        <div 
                            key={lineIdx} 
                            className={cn(
                                "font-semibold text-sm mt-2 mb-0.5",
                                onPrimary ? "text-primary-foreground" : "text-foreground"
                            )}
                        >
                            {renderInlineFormatting(currentLine, onPrimary)}
                            {isLastLine && trailingCursor}
                        </div>
                    );
                }
                
                if (isOriginalListItem) {
                    return (
                        <div 
                            key={lineIdx} 
                            className="flex items-start gap-2 text-sm leading-relaxed pl-0.5"
                        >
                            <span
                                className={cn(
                                    "mt-2 shrink-0 block w-1 h-1 rounded-full",
                                    onPrimary ? "bg-primary-foreground/70" : "bg-primary/70"
                                )}
                            />
                            <span className="flex-1">
                                {renderInlineFormatting(currentLine, onPrimary)}
                                {isLastLine && trailingCursor}
                            </span>
                        </div>
                    );
                }
                
                return (
                    <p key={lineIdx} className="text-sm leading-relaxed">
                        {renderInlineFormatting(currentLine, onPrimary)}
                        {isLastLine && trailingCursor}
                    </p>
                );
            })}
        </div>
    );
};

export const MessageRenderer = ({ content, role, handleSend, isLast, isStreaming, activeTool, sources }: MessageRendererProps) => {
    const [typeSession, setTypeSession] = useState(false);
    useEffect(() => {
        if (isStreaming && role === "assistant" && isLast) {
            setTypeSession(true);
        }
    }, [isStreaming, role, isLast]);

    const typewriterOn = role === "assistant" && !!isLast && (isStreaming || typeSession);
    const { revealed, isTyping, done } = useChatTypewriter(content, typewriterOn);

    useEffect(() => {
        if (done && !isStreaming && typeSession) {
            setTypeSession(false);
        }
    }, [done, isStreaming, typeSession]);

    useEffect(() => {
        if (!isLast || role !== "assistant") {
            setTypeSession(false);
        }
    }, [isLast, role]);

    const parts = useMessageParser(revealed);
    const waitingForFirstToken =
        typewriterOn && !content.trim() && (isStreaming || !!activeTool);

    if (waitingForFirstToken) {
        return (
            <div className="animate-in fade-in duration-300">
                <TypingIndicator activeTool={activeTool} />
            </div>
        );
    }

    const showCursor = typewriterOn && (isStreaming || isTyping);

    return (
        <div className="space-y-2.5 w-full">
            {parts.map((part, idx) => {
                if (part.type === 'text') {
                    const text = part.value.trim();
                    const isFinalPart = idx === parts.length - 1;
                    
                    if (!text) return null;
                    
                    const isUser = role === 'user';
                    const cursor = showCursor && isFinalPart ? (
                        <span className="inline-block w-[2px] h-3.5 bg-current/70 ml-0.5 animate-pulse align-middle rounded-sm" />
                    ) : undefined;
                    
                    return (
                        <div key={idx} className={cn(
                            "px-3.5 py-2.5 text-sm leading-relaxed relative shadow-sm",
                            isUser
                                ? "max-w-[min(100%,340px)] ml-auto rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                                : "w-full max-w-full rounded-2xl rounded-bl-md border border-border/70 bg-background/95 text-foreground"
                        )}>
                            {renderTextWithFormatting(text, cursor, isUser)}
                        </div>
                    );
                } else if (part.type === 'balance') {
                         const { name, total, used, available, pending } = part.value;
                         const usedNum = parseFloat(used) || 0;
                         const totalNum = parseFloat(total) || 1;
                         const pendingNum = parseFloat(pending) || 0;
                         const percent = Math.min((usedNum / totalNum) * 100, 100);

                         return (
                             <div key={idx} className="bg-card border border-border rounded-3xl p-5 space-y-4 animate-in zoom-in-95 duration-300">
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
                                         {pendingNum > 0 && <span className="text-yellow-600 dark:text-yellow-500">Pending: {pending}</span>}
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
                             <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5 space-y-4 animate-in zoom-in-95 duration-300">
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
                        <div key={idx} className="bg-destructive/5 border border-destructive/20 rounded-3xl p-5 space-y-2 animate-in zoom-in-95 duration-500 w-full">
                            <div className="flex items-center gap-2 text-destructive">
                                <X className="w-4 h-4" />
                                <h4 className="font-black text-xs uppercase tracking-widest">{title || "Error Occurred"}</h4>
                            </div>
                            <p className="text-sm text-destructive/80 font-medium">{message}</p>
                        </div>
                    );
                } else if (part.type === 'insight') {
                    return <InsightCard key={idx} {...part.value} />;
                } else if (part.type === 'payroll') {
                    return <PayrollCard key={idx} {...part.value} />;
                } else if (part.type === 'route') {
                    return (
                        <RouteCard
                            key={idx}
                            path={part.value.path || part.value.href || ""}
                            label={part.value.label}
                            reason={part.value.reason || part.value.message}
                        />
                    );
                } else if (part.type === 'correction') {
                    return (
                        <CorrectionCard
                            key={idx}
                            id={String(part.value.id)}
                            date={part.value.date}
                            login={part.value.login}
                            suggested_logout={part.value.suggested_logout}
                            reason={part.value.reason}
                            onConfirm={(id, suggested) => {
                                const timePart = suggested && suggested !== '—'
                                    ? ` with logout time ${suggested}`
                                    : '';
                                handleSend?.(
                                    undefined,
                                    `Confirm attendance correction ID ${id}${timePart}`
                                );
                            }}
                        />
                    );
                }
                return null;
            })}
            {role === 'assistant' && sources && sources.length > 0 && !isTyping && (
                <CitationChips sources={sources} />
            )}
        </div>
    );
};
