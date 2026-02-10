import { X, TrendingUp } from 'lucide-react'

import React from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface LeaveBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: any;
    setFormData: (data: any) => void;
    editingBalance: boolean;
    users: any[];
    leaveTypes: any[];
}

function LeaveBalanceModal({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    editingBalance,
    users,
    leaveTypes
}: LeaveBalanceModalProps) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">

            <div className="bg-card rounded-[2.5rem] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="relative p-10 pb-8 bg-linear-to-br from-primary/20 via-background to-background border-b border-border/50">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <TrendingUp className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-black text-foreground tracking-tight leading-none mb-3">
                                {editingBalance ? 'Refine Quota' : 'Initialize Quota'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Entitlement Matrix
                                </span>
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Asset Synchronization</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onClose()}
                            className="w-12 h-12 rounded-2xl bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-300 flex items-center justify-center active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>


                <form onSubmit={onSubmit} className="p-10 space-y-8">
                    {!editingBalance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Human Asset</label>
                                <Select
                                    value={formData.userId}
                                    onValueChange={(value) => setFormData({ ...formData, userId: value })}
                                >
                                    <SelectTrigger className="bg-muted/30 rounded-2xl border-border/50 h-[52px]">
                                        <SelectValue placeholder="Identify Asset" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border shadow-2xl">
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id} className="focus:bg-primary/10 focus:text-primary rounded-xl">
                                                {u.firstName} {u.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Entitlement Type</label>
                                <Select
                                    value={formData.leaveTypeId}
                                    onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                                >
                                    <SelectTrigger className="bg-muted/30 rounded-2xl border-border/50 h-[52px]">
                                        <SelectValue placeholder="Select Logic" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border shadow-2xl">
                                        {leaveTypes.map(lt => (
                                            <SelectItem key={lt.id} value={lt.id} className="focus:bg-primary/10 focus:text-primary rounded-xl">
                                                {lt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Input
                                    label="Temporal Period (Year)"
                                    type="number"
                                    required
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-muted/30 p-8 rounded-4xl border border-border/50">
                        <Input
                            label="Total Entitled Cycles (Days)"
                            type="number"
                            step="0.5"
                            required
                            value={formData.totalEntitled}
                            onChange={(e) => setFormData({ ...formData, totalEntitled: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="px-10 py-5 text-muted-foreground hover:text-foreground text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted rounded-2xl active:scale-95"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            className="px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary/20"
                        >
                            {editingBalance ? 'Finalize Logic' : 'Execute Allocation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default LeaveBalanceModal
