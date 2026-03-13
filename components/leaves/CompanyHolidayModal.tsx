"use client"
import { X, Info, Calendar, Settings } from 'lucide-react'
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { FormSelect } from '../common/FormSelect'
import { useStore } from '@/lib/store/useStore'
import { useGraphQLOrganizations } from '@/lib/graphql/organization/organizationsHook'

interface CompanyHolidayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: any;
    setFormData: (data: any) => void;
    editingHoliday: boolean;
}

function CompanyHolidayModal({ isOpen, onClose, onSubmit, formData, setFormData, editingHoliday }: CompanyHolidayModalProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { user } = useStore();
    const { organizations } = useGraphQLOrganizations();

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[3rem] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 max-h-[90vh]">
                {/* Header */}
                <div className="relative p-10 pb-8 bg-linear-to-br from-purple-500/10 via-background to-background border-b border-border/50">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Settings className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-black text-foreground tracking-tight leading-none mb-3">
                                {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Festive Calendar Management</p>
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
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-inner">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">Holiday Details</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Define the occasion and its schedule</p>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-4xl p-8 border border-border/50 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Holiday Name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. New Year's Day"
                                    />
                                    <Input
                                        label="Holiday Date"
                                        type="date"
                                        required
                                        value={formData.holidayDate}
                                        onChange={(e) => setFormData({ ...formData, holidayDate: e.target.value })}
                                    />
                                    {user?.role === "admin" && <FormSelect
                                        label="Organization"
                                        value={formData.organizationId}
                                        onValueChange={(value) => handleSelectChange("organizationId", value)}
                                        placeholder="Select Organization"
                                        error={errors.organizationId}
                                        options={organizations?.map((o: any) => ({
                                            label: o.name,
                                            value: String(o.id),
                                        })) || []}
                                    />}
                                </div>
                                
                                <div className="flex items-center justify-between p-5 bg-background rounded-2xl border border-border/50 shadow-sm px-6">
                                    <div className="flex flex-col">
                                        <label htmlFor="isOptional" className="text-[10px] font-black text-foreground uppercase tracking-widest">Optional Holiday</label>
                                        <span className="text-[10px] text-muted-foreground font-medium">Employees can choose whether to take this off</span>
                                    </div>
                                    <Switch
                                        id="isOptional"
                                        checked={formData.isOptional}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isOptional: checked })}
                                    />
                                </div>

                                <div className="flex flex-col gap-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Description (Optional)</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="bg-background rounded-2xl border-border/50 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none p-4 font-medium"
                                        placeholder="Provide more details about this observance..."
                                    />
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

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
                        className="px-12 py-5 bg-purple-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-purple-600/20"
                    >
                        {editingHoliday ? 'Finalize Changes' : 'Add Holiday'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CompanyHolidayModal
