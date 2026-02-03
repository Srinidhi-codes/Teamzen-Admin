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
        <div className="flex items-center justify-center z-50 p-4 rounded-full">
            <div className="bg-linear-to-br from-white via-indigo-50/20 to-purple-50/20 rounded-3xl w-full shadow-2xl border-2 border-white/50 my-8 flex flex-col">
                {/* Header - Fixed */}
                <div className="flex justify-between items-center p-8 pb-6 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                    <div>
                        <h2 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                            {editingType ? 'Edit Leave Type' : 'Create Leave Type'}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">Configure leave policies and rules</p>
                    </div>
                    <button
                        onClick={() => onClose()}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-300 flex items-center justify-center transform hover:scale-110"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-8">
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                                    <Info className="w-5 h-5 text-black" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Basic Information</h3>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Sick Leave"
                                    />
                                    <Input
                                        label="Code"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SL"
                                    />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        className="resize-none"
                                        placeholder="Brief description of this leave type..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Limits & Accrual */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                                    <Calendar className="w-5 h-5 text-black" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Limits & Accrual</h3>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Annual Limit (Days)"
                                        type="number"
                                        required
                                        value={formData.maxDaysPerYear}
                                        onChange={(e) => setFormData({ ...formData, maxDaysPerYear: parseInt(e.target.value) })}
                                    />
                                    <div className="flex flex-col gap-y-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Accrual Frequency</label>
                                        <Select
                                            value={formData.accrualFrequency}
                                            onValueChange={(value) => setFormData({ ...formData, accrualFrequency: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yearly">Yearly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                                <SelectItem value="onetime">One-time</SelectItem>
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
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                                    <TrendingUp className="w-5 h-5 text-black" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Carry Forward & Encashment</h3>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <label htmlFor="carryForwardAllowed" className="text-sm font-semibold text-slate-700">Allow Carry Forward</label>
                                            <Switch
                                                id="carryForwardAllowed"
                                                checked={formData.carryForwardAllowed}
                                                onCheckedChange={(checked) => setFormData({ ...formData, carryForwardAllowed: checked })}
                                            />
                                        </div>
                                        <Input
                                            label="Max Carry Forward (Days)"
                                            type="number"
                                            disabled={!formData.carryForwardAllowed}
                                            value={formData.carryForwardMaxDays}
                                            onChange={(e) => setFormData({ ...formData, carryForwardMaxDays: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <label htmlFor="allowEncashment" className="text-sm font-semibold text-slate-700">Allow Encashment</label>
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

                        {/* Policies & Rules */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                                    <Shield className="w-5 h-5 text-black" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Policies & Rules</h3>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <label htmlFor="isPaidLeave" className="text-sm font-semibold text-slate-700">Is Paid Leave</label>
                                        <Switch
                                            id="isPaidLeave"
                                            checked={formData.isPaidLeave}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isPaidLeave: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <label htmlFor="requiresApproval" className="text-sm font-semibold text-slate-700">Requires Approval</label>
                                        <Switch
                                            id="requiresApproval"
                                            checked={formData.requiresApproval}
                                            onCheckedChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <label htmlFor="prorateOnJoin" className="text-sm font-semibold text-slate-700">Prorate on Joining</label>
                                        <Switch
                                            id="prorateOnJoin"
                                            checked={formData.prorateOnJoin}
                                            onCheckedChange={(checked) => setFormData({ ...formData, prorateOnJoin: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <label htmlFor="prorateOnExit" className="text-sm font-semibold text-slate-700">Prorate on Exit</label>
                                        <Switch
                                            id="prorateOnExit"
                                            checked={formData.prorateOnExit}
                                            onCheckedChange={(checked) => setFormData({ ...formData, prorateOnExit: checked })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-y-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Proration Basis</label>
                                        <Select
                                            value={formData.prorationBasis}
                                            onValueChange={(value) => setFormData({ ...formData, prorationBasis: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Basis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Active Status</label>
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

                {/* Footer - Fixed */}
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200/50 bg-white/80 backdrop-blur-sm sticky bottom-0 z-20">
                    <button
                        type="button"
                        onClick={() => onClose()}
                        className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={onSubmit}
                        className="btn-primary"
                    >
                        {editingType ? 'Update Leave Type' : 'Create Leave Type'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LeaveTypeModal