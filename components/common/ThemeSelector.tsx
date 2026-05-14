"use client";

import { useTheme } from "next-themes";
import { useStore } from "@/lib/store/useStore";
import { ColorAccent } from "@/lib/store/slices/themeSlice";
import {
    Check,
    Palette,
    Moon,
    Sun,
    Layout,
    Clock,
    Zap,
    Move
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const accents: { name: ColorAccent; color: string; label: string }[] = [
    { name: "indigo", color: "#480082", label: "Indigo" },
    { name: "slate", color: "#64748B", label: "Slate" },
    { name: "blue", color: "#0F766E", label: "Blue" },
    { name: "green", color: "#16A34A", label: "Green" },
    { name: "red", color: "#DC2626", label: "Red" },
    { name: "orange", color: "#EA580C", label: "Orange" },
    { name: "purple", color: "#7C3AED", label: "Purple" },
];

export function ThemeSelector() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const { accent, setAccent } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-2 rounded-full hover:bg-accent transition-colors flex items-center gap-2 group outline-none"
                    title="Theme Settings"
                >
                    <Palette className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: accents.find(a => a.name === accent)?.color }} 
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 glass-dark shadow-2xl rounded-2xl border border-border p-5 z-50 animate-fade-in origin-top-right">
                <div className="space-y-8">
                    {/* Appearance Section */}
                    <div>
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Layout className="w-3 h-3" /> Theme
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "light", icon: Sun, label: "Light" },
                                { id: "dark", icon: Moon, label: "Dark" },
                                { id: "system", icon: Clock, label: "Auto" }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 cursor-pointer",
                                        theme === t.id ? "border-primary bg-primary/10" : "border-transparent bg-muted/50 hover:bg-accent"
                                    )}
                                >
                                    <t.icon className={cn("w-5 h-5", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                                    <span className="text-[10px] font-bold">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accent Color Section */}
                    <div>
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                            Accent Color
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {accents.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => setAccent(item.name)}
                                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                                >
                                    <div 
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-offset-2 ring-offset-background",
                                            accent === item.name ? "ring-2 ring-primary scale-110 shadow-lg shadow-black/20" : "hover:scale-105"
                                        )}
                                        style={{ backgroundColor: item.color }}
                                    >
                                        {accent === item.name && <Check className="w-5 h-5 text-white" />}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold transition-colors",
                                        accent === item.name ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Settings */}
                    <div className="space-y-4 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">High Contrast Mode</Label>
                                <p className="text-[10px] text-muted-foreground font-medium">Have high contrast mode.</p>
                            </div>
                            <Switch 
                                checked={highContrast} 
                                onCheckedChange={setHighContrast}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">Reduced Motion</Label>
                                <p className="text-[10px] text-muted-foreground font-medium">Automatic, reduced motion settings.</p>
                            </div>
                            <Switch 
                                checked={reducedMotion} 
                                onCheckedChange={setReducedMotion}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground font-medium italic opacity-60">Customizations are saved automatically</p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
