"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode } from "react";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options?: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
}

export function FormSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  required,
  children,
  className,
}: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`p-5 w-full shadow-sm border rounded-md ${error ? "border-red-500" : ""} ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="top-10 right-2">
          {options
            ? options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
            : children}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
