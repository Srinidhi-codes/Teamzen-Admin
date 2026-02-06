import { X, Info, Calendar, TrendingUp, Shield, Settings } from 'lucide-react'
import React from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'

interface LeaveTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: any;
    setFormData: (data: any) => void;
    editingType: boolean;
}

function LeaveTypeModal({ isOpen, onClose, onSubmit, formData, setFormData, editingType }: LeaveTypeModalProps) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">

            <div className="bg-card rounded-[3rem] w-full max-w-4xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 max-h-[90vh]">
                {/* Header */}
                <div className="relative p-10 pb-8 bg-linear-to-br from-primary/10 via-background to-background border-b border-border/50">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Settings className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-black text-foreground tracking-tight leading-none mb-3">
                                {editingType ? 'Edit Leave Type' : 'Create Leave Type'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Leave Management System</p>
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


                <div className="overflow-y-auto flex-1 p-10 space-y-12 custom-scrollbar">
                    <form onSubmit={onSubmit} className="space-y-12">
                        {/* Basic Information */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Basic Information</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Basic details of the leave type</p>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-4xl p-8 border border-border/50 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Leave Type Name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Sabbatical Provision"
                                    />
                                    <Input
                                        label="Leave Type Code"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SAB"
                                    />
                                </div>
                                <div className="flex flex-col gap-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Leave Type Description</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="bg-background rounded-2xl border-border/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none p-4 font-medium"
                                        placeholder="Articulate the scope of this entitlement..."
                                    />
                                </div>
                            </div>
                        </section>


                        {/* Limits & Accrual */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Quotas & Entitlements</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Temporal limitations and accrual logic</p>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-4xl p-8 border border-border/50 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Input
                                        label="Annual Entitlement (Days)"
                                        type="number"
                                        required
                                        value={formData.maxDaysPerYear}
                                        onChange={(e) => setFormData({ ...formData, maxDaysPerYear: parseInt(e.target.value) })}
                                    />
                                    <div className="flex flex-col gap-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Accrual Frequency</label>
                                        <Select
                                            value={formData.accrualFrequency}
                                            onValueChange={(value) => setFormData({ ...formData, accrualFrequency: value })}
                                        >
                                            <SelectTrigger className="bg-background rounded-2xl border-border/50 h-[52px]">
                                                <SelectValue placeholder="Select Frequency" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border shadow-2xl">
                                                <SelectItem value="yearly" className="focus:bg-primary/10 focus:text-primary rounded-xl">Yearly Cycle</SelectItem>
                                                <SelectItem value="monthly" className="focus:bg-primary/10 focus:text-primary rounded-xl">Monthly Interval</SelectItem>
                                                <SelectItem value="quarterly" className="focus:bg-primary/10 focus:text-primary rounded-xl">Quarterly Phase</SelectItem>
                                                <SelectItem value="onetime" className="focus:bg-primary/10 focus:text-primary rounded-xl">Instantaneous</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Input
                                        label="Accrual Days"
                                        type="number"
                                        step="0.01"
                                        value={formData.accrualDays}
                                        onChange={(e) => setFormData({ ...formData, accrualDays: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </section>


                        {/* Carry Forward & Encashment */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Carry Forward & Encashment</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Carry-over regulations and financial conversion</p>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-4xl p-8 border border-border/50 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-5 bg-background rounded-2xl border border-border/50 shadow-sm px-6">
                                            <label htmlFor="carryForwardAllowed" className="text-[10px] font-black text-foreground uppercase tracking-widest">Carry Forward</label>
                                            <Switch
                                                id="carryForwardAllowed"
                                                checked={formData.carryForwardAllowed}
                                                onCheckedChange={(checked) => setFormData({ ...formData, carryForwardAllowed: checked })}
                                            />
                                        </div>
                                        <Input
                                            label="Maximum Carry Forward (Days)"
                                            type="number"
                                            disabled={!formData.carryForwardAllowed}
                                            value={formData.carryForwardMaxDays}
                                            onChange={(e) => setFormData({ ...formData, carryForwardMaxDays: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-5 bg-background rounded-2xl border border-border/50 shadow-sm px-6">
                                            <label htmlFor="allowEncashment" className="text-[10px] font-black text-foreground uppercase tracking-widest">Encashment</label>
                                            <Switch
                                                id="allowEncashment"
                                                checked={formData.allowEncashment}
                                                onCheckedChange={(checked) => setFormData({ ...formData, allowEncashment: checked })}
                                            />
                                        </div>
                                        <Input
                                            label="Encashment Rate"
                                            type="number"
                                            step="0.01"
                                            disabled={!formData.allowEncashment}
                                            value={formData.encashmentRate}
                                            onChange={(e) => setFormData({ ...formData, encashmentRate: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>


                        {/* Governance & Rules */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Rules</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rules for leave type</p>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-4xl p-8 border border-border/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50 shadow-sm px-6">
                                        <label htmlFor="isPaidLeave" className="text-[10px] font-black text-foreground uppercase tracking-widest">Paid Leave</label>
                                        <Switch
                                            id="isPaidLeave"
                                            checked={formData.isPaidLeave}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isPaidLeave: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50 shadow-sm px-6">
                                        <label htmlFor="requiresApproval" className="text-[10px] font-black text-foreground uppercase tracking-widest">Approval Required</label>
                                        <Switch
                                            id="requiresApproval"
                                            checked={formData.requiresApproval}
                                            onCheckedChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50 shadow-sm px-6">
                                        <label htmlFor="prorateOnJoin" className="text-[10px] font-black text-foreground uppercase tracking-widest">Join Proration</label>
                                        <Switch
                                            id="prorateOnJoin"
                                            checked={formData.prorateOnJoin}
                                            onCheckedChange={(checked) => setFormData({ ...formData, prorateOnJoin: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50 shadow-sm px-6">
                                        <label htmlFor="prorateOnExit" className="text-[10px] font-black text-foreground uppercase tracking-widest">Exit Proration</label>
                                        <Switch
                                            id="prorateOnExit"
                                            checked={formData.prorateOnExit}
                                            onCheckedChange={(checked) => setFormData({ ...formData, prorateOnExit: checked })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Proration Frequency</label>
                                        <Select
                                            value={formData.prorationBasis}
                                            onValueChange={(value) => setFormData({ ...formData, prorationBasis: value })}
                                        >
                                            <SelectTrigger className="bg-background rounded-2xl border-border/50 h-[48px]">
                                                <SelectValue placeholder="Select Basis" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border shadow-2xl">
                                                <SelectItem value="daily" className="focus:bg-primary/10 focus:text-primary rounded-xl">Daily Accrual</SelectItem>
                                                <SelectItem value="monthly" className="focus:bg-primary/10 focus:text-primary rounded-xl">Monthly Interval</SelectItem>
                                                <SelectItem value="quarterly" className="focus:bg-primary/10 focus:text-primary rounded-xl">Quarterly Phase</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50 shadow-sm px-6">
                                        <label htmlFor="isActive" className="text-[10px] font-black text-foreground uppercase tracking-widest">Status</label>
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </form>
                </div>


                {/* Footer */}
                <div className="p-10 border-t border-border bg-muted/10 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-4">
                    <button
                        type="button"
                        onClick={() => onClose()}
                        className="px-10 py-5 text-muted-foreground hover:text-foreground text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-muted rounded-2xl active:scale-95"
                    >
                        Dismiss
                    </button>
                    <button
                        type="submit"
                        onClick={onSubmit}
                        className="px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary/20"
                    >
                        {editingType ? 'Finalize Changes' : 'Create Leave Type'}
                    </button>
                </div>
            </div>
        </div>

    )
}

export default LeaveTypeModal