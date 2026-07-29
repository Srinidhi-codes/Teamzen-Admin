"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Bot,
  User,
  Trash2,
  Loader2,
  Minimize2,
  Mic,
  MicOff,
  MessageCircle,
} from "lucide-react";
import { useVoiceWhisper } from "@/lib/hooks/useVoiceWhisper";
import { VoiceWave } from "./VoiceWave";
import { useAssistant } from "@/lib/api/assistant";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import moment from "moment";
import { MessageRenderer } from "./MessageRenderer";
import { useStore } from "@/lib/store/useStore";
import ConfirmationModal from "@/components/common/ConfirmationModal";

const SUGGESTIONS = [
  "What is the analysis of my team?",
  "Show me attendance summary for today",
  "Are there any pending leave requests?",
];

export function AssistantWidget() {
  const { assistantOpen: isOpen, setAssistantOpen: setIsOpen, user } = useStore();
  const [input, setInput] = useState("");
  const {
    messages,
    setMessages,
    sendMessage,
    isLoading,
    isStreaming,
    activeTool,
    clearHistory,
    config,
  } = useAssistant();
  const {
    isRecording,
    isProcessing: isVoiceProcessing,
    startRecording,
    stopRecording,
    error: voiceError,
  } = useVoiceWhisper({
    onTranscript: (text) => {
      if (text) handleSend(undefined, text);
    },
  });
  const [isMicErrorModalOpen, setIsMicErrorModalOpen] = useState(false);

  useEffect(() => {
    if (voiceError === "device-not-found" || voiceError === "permission-denied") {
      setIsMicErrorModalOpen(true);
    }
  }, [voiceError]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const query = customQuery || input;
    if (!query.trim() || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: query, timestamp: new Date().toISOString() },
    ]);

    if (!customQuery) setInput("");

    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true,
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch {
          // optional location
        }
      }

      await sendMessage({ query, latitude, longitude });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) await stopRecording();
    else await startRecording();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="mb-3 flex h-[min(640px,calc(100dvh-6.5rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 sm:w-[420px]">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  Teamzen Assistant
                </h3>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={clearHistory}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
          >
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                    Hi{user?.firstName ? ` ${user.firstName}` : ""}. Ask about
                    attendance, leaves, payroll, or team insights.
                  </div>
                </div>

                <div className="space-y-2 pl-10">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(undefined, q)}
                      className="block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <MessageRenderer
                    content={msg.content}
                    role={msg.role}
                    handleSend={handleSend}
                    isLast={i === messages.length - 1}
                    isStreaming={isStreaming}
                    activeTool={i === messages.length - 1 ? activeTool : null}
                    sources={msg.sources}
                  />
                  <div
                    className={cn(
                      "mt-1 text-[11px] text-muted-foreground",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {msg.timestamp
                      ? moment(msg.timestamp).format("hh:mm A")
                      : moment().format("hh:mm A")}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && !isStreaming && (
              <div className="flex gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-muted px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border bg-card p-3">
            <form onSubmit={handleSend} className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening…" : "Ask anything…"}
                className={cn(
                  "h-11 rounded-xl border-border bg-muted/40 pr-24 text-sm focus-visible:ring-primary/20",
                  isRecording && "border-primary/40 bg-primary/5"
                )}
                disabled={isLoading || isVoiceProcessing}
              />
              <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  disabled={isLoading || isVoiceProcessing}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    isRecording
                      ? "bg-destructive text-destructive-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isVoiceProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || isRecording || isVoiceProcessing}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              {(isRecording || isVoiceProcessing) && (
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <VoiceWave isProcessing={isVoiceProcessing} />
                </div>
              )}
            </form>
            <p className="mt-2 truncate px-0.5 text-[11px] text-muted-foreground">
              {config?.model_name || "GPT-4o Mini"}
            </p>
          </div>
        </div>
      )}

      <button
        id="ai-assistant-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          isOpen
            ? "border border-border bg-card text-foreground shadow-md hover:bg-muted"
            : "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      <ConfirmationModal
        isOpen={isMicErrorModalOpen}
        onClose={() => setIsMicErrorModalOpen(false)}
        onConfirm={() => setIsMicErrorModalOpen(false)}
        title={
          voiceError === "permission-denied"
            ? "Microphone access denied"
            : "Microphone not found"
        }
        description={
          voiceError === "permission-denied"
            ? "Enable microphone permissions in your browser settings to use voice input."
            : "No microphone was detected. Connect a recording device to use voice."
        }
        confirmText="Got it"
        variant={voiceError === "permission-denied" ? "warning" : "destructive"}
      />
    </div>
  );
}
