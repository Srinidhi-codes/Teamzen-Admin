import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    containerClassName?: string;
}

export const SearchInput = ({
    value,
    onChange,
    placeholder = "Search...",
    className,
    containerClassName
}: SearchInputProps) => {
    return (
        <div className={cn("relative group w-full", containerClassName)}>
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search className="w-5 h-5" />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "input pl-14 pr-12 h-14 bg-card border-border/50 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300",
                    className
                )}
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                    title="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
