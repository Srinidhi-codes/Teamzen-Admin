import * as React from "react"

import { cn } from "@/lib/utils"

interface CustomInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
}

function Input({ className, type, label, error, hint, suffix, ...props }: CustomInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        <input
          type={type}
          data-slot="input"
          className={cn(
            "flex w-full px-4 py-2.5 bg-white border rounded-md shadow-sm text-sm font-medium transition-all duration-200 outline-none",
            suffix ? "pr-11" : "",
            error
              ? "border-rose-200 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500"
              : "border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 hover:border-slate-300",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] font-bold text-rose-600 pl-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
      {hint && <p className="mt-1 text-[11px] font-medium text-slate-400 pl-1">{hint}</p>}
    </div>
  )
}

export { Input }
