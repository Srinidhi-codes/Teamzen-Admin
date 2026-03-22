"use client";

import { useAIConfig } from "@/lib/api/hooks";
import { useState, useEffect } from "react";
import { 
    Cpu, 
    Sparkles, 
    Settings2, 
    Save, 
    Loader2, 
    MessageSquareQuote, 
    Thermometer, 
    Zap,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MODELS = [
    { 
        id: 'gpt-4o', 
        name: 'GPT-4o', 
        desc: 'Most capable model, best for complex logic.', 
        provider: 'OpenAI',
        type: 'Premium'
    },
    { 
        id: 'gpt-4o-mini', 
        name: 'GPT-4o Mini', 
        desc: 'Fast and affordable for common tasks.', 
        provider: 'OpenAI',
        type: 'Fast'
    },
    { 
        id: 'gemini-1.5-flash', 
        name: 'Gemini 1.5 Flash', 
        desc: 'Google\'s fastest model with huge context.', 
        provider: 'Google',
        type: 'Free Tier'
    },
    { 
        id: 'gemini-1.5-pro', 
        name: 'Gemini 1.5 Pro', 
        desc: 'Highly intelligent reasoning from Google.', 
        provider: 'Google',
        type: 'Premium'
    },
    { 
        id: 'llama-3.3-70b-versatile', 
        name: 'Llama 3.3 70B', 
        desc: 'Top-tier versatile model via Groq.', 
        provider: 'Groq',
        type: 'Smart'
    },
    { 
        id: 'llama-3.1-8b-instant', 
        name: 'Llama 3.1 8B', 
        desc: 'Instant responses with high intelligence.', 
        provider: 'Groq',
        type: 'Speed'
    },
    { 
        id: 'mixtral-8x7b-32768', 
        name: 'Mixtral 8x7B', 
        desc: 'High context window with consistent performance.', 
        provider: 'Groq',
        type: 'Balanced'
    },
];

export default function AISettingsPage() {
    const { config, isLoading, isUpdating, updateAIConfig } = useAIConfig();
    const [formData, setFormData] = useState({
        model_name: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 1024,
        system_prompt_override: "",
    });

    useEffect(() => {
        if (config) {
            setFormData({
                model_name: config.model_name,
                temperature: config.temperature,
                max_tokens: config.max_tokens,
                system_prompt_override: config.system_prompt_override || "",
            });
        }
    }, [config]);

    const handleSave = async () => {
        try {
            await updateAIConfig(formData);
            toast.success("AI Configuration updated successfully!");
        } catch (error) {
            toast.error("Failed to update AI configuration.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Cpu className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                            AI Engine Settings
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium"> Configure the intelligence behind your Workplace Assistant.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Model Selection */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="w-24 h-24" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            < Zap className="w-5 h-5 text-primary" />
                            <h2 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">Model Engine</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {MODELS.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setFormData(prev => ({ ...prev, model_name: m.id }))}
                                    className={cn(
                                        "relative flex items-center gap-6 p-5 rounded-3xl border text-left transition-all duration-300 group/btn",
                                        formData.model_name === m.id 
                                            ? "border-primary bg-primary/3 shadow-lg shadow-primary/5" 
                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                                        formData.model_name === m.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover/btn:bg-primary/20"
                                    )}>
                                        <Cpu className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-black text-sm">{m.name}</h3>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                                                formData.model_name === m.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                            )}>
                                                {m.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium line-clamp-1">{m.desc}</p>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        formData.model_name === m.id ? "border-primary bg-primary scale-110" : "border-border"
                                    )}>
                                        {formData.model_name === m.id && <Zap className="w-3 h-3 text-primary-foreground fill-current" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <MessageSquareQuote className="w-5 h-5 text-primary" />
                            <h2 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">System Personality</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary px-4 py-2 bg-primary/10 rounded-xl w-max">
                                <Info className="w-3 h-3" />
                                Overrides Default Behavior
                            </div>
                            <textarea
                                value={formData.system_prompt_override || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, system_prompt_override: e.target.value }))}
                                placeholder="E.g. You are a friendly HR assistant that focuses on work-life balance..."
                                className="w-full h-48 bg-muted/30 border-border rounded-3xl p-6 text-sm font-medium resize-none focus:ring-2 focus:ring-primary/20 transition-all outline-hidden"
                            />
                        </div>
                    </section>
                </div>

                {/* Right Column: Parameters */}
                <div className="space-y-8">
                    <section className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <Settings2 className="w-5 h-5 text-primary" />
                            <h2 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">Adjust Parameters</h2>
                        </div>

                        <div className="space-y-10">
                            {/* Temperature */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                                        <label className="text-xs font-black uppercase tracking-widest">Temperature</label>
                                    </div>
                                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                        {formData.temperature.toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1.5"
                                    step="0.05"
                                    value={formData.temperature}
                                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between px-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Deterministic</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Creative</span>
                                </div>
                            </div>

                            {/* Max Tokens */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-muted-foreground" />
                                        <label className="text-xs font-black uppercase tracking-widest">Response Length</label>
                                    </div>
                                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                        {formData.max_tokens}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[256, 512, 1024, 2048, 4096].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setFormData(prev => ({ ...prev, max_tokens: val }))}
                                            className={cn(
                                                "py-3 rounded-xl text-[10px] font-black transition-all border",
                                                formData.max_tokens === val ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border hover:border-primary/50"
                                            )}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-linear-to-br from-primary to-primary-foreground p-8 rounded-[2.5rem] text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
                         <div className="absolute -top-10 -right-10 opacity-20 transform rotate-12">
                            <Sparkles className="w-48 h-48" />
                         </div>
                         <h3 className="text-lg font-black mb-2 relative z-10">Pro Tip</h3>
                         <p className="text-sm font-medium opacity-90 relative z-10 leading-relaxed">
                            Lower the <b>Temperature</b> for factual queries like policies or attendance, and increase it slightly for personalized recommendations.
                         </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
