import { X } from 'lucide-react'

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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                        {editingBalance ? 'Edit balance' : 'Allocate balance'}
                    </h2>
                    <button
                        onClick={() => onClose()}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
                    {!editingBalance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-y-2">
                                <label className="text-xs text-muted-foreground px-1">Employee</label>
                                <Select
                                    value={formData.userId}
                                    onValueChange={(value) => setFormData({ ...formData, userId: value })}
                                >
                                    <SelectTrigger className="bg-muted/30 rounded-2xl border-border/50 h-[52px]">
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border">
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id} className="focus:bg-primary/10 focus:text-primary rounded-xl">
                                                {u.firstName} {u.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-y-2">
                                <label className="text-xs text-muted-foreground px-1">Entitlement Type</label>
                                <Select
                                    value={formData.leaveTypeId}
                                    onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                                >
                                    <SelectTrigger className="bg-muted/30 rounded-2xl border-border/50 h-[52px]">
                                        <SelectValue placeholder="Select Leave Type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border">
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

                    <div className="bg-muted/30 p-6 rounded-xl border border-border">
                        <Input
                            label="Total Entitled Day(s)"
                            type="number"
                            step="0.5"
                            required
                            value={formData.totalEntitled}
                            onChange={(e) => setFormData({ ...formData, totalEntitled: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            {editingBalance ? 'Save changes' : 'Allocate balance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LeaveBalanceModal
