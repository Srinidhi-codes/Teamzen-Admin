"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import moment from "moment"
import { CalendarIcon } from "lucide-react"

interface DatePickerSimpleProps {
    label: string
    value?: string | Date
    onChange?: (date: Date | undefined) => void
    error?: string
    required?: boolean
    className?: string
}

export function DatePickerSimple({ label, value, onChange, error, required, className }: DatePickerSimpleProps) {
    const [open, setOpen] = React.useState(false)

    const dateValue = value ? (typeof value === 'string' ? moment(value.substring(0, 10), "YYYY-MM-DD").toDate() : value) : undefined;
    // Check if date is valid
    const isValidDate = dateValue instanceof Date && !isNaN(dateValue.getTime());
    const displayDate = isValidDate ? dateValue : undefined;

    return (
        <div className={cn("flex flex-col space-y-1", className)}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-600">*</span>}
            </label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full pl-3 text-left font-normal py-2 h-10 border-gray-300 shadow-sm rounded-lg",
                            !displayDate && "text-muted-foreground",
                            error && "border-rose-500 bg-rose-50/10"
                        )}
                    >
                        {displayDate ? (
                            moment(displayDate).format("MMM DD, YYYY")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={displayDate}
                        onSelect={(date) => {
                            onChange?.(date)
                            setOpen(false)
                        }}
                        disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1960}
                        toYear={new Date().getFullYear()}
                    />
                </PopoverContent>
            </Popover>
            {error && <p className="mt-1 text-[11px] font-bold text-rose-600 pl-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    )
}
