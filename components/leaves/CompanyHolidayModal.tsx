"use client"
import { X, Info } from 'lucide-react'
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                        {editingHoliday ? 'Edit holiday' : 'Holiday'}
                    </h2>
                    <button
                        onClick={() => onClose()}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-12 custom-scrollbar">
                    <form onSubmit={onSubmit} className="space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Holiday Details</h3>
                                    <p className="text-xs text-muted-foreground">Define the occasion and its schedule</p>
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded-xl p-6 border border-border/50 space-y-6">
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
                                        <label htmlFor="isOptional" className="text-sm font-medium text-foreground">Optional Holiday</label>
                                        <span className="text-[10px] text-muted-foreground font-medium">Employees can choose whether to take this off</span>
                                    </div>
                                    <Switch
                                        id="isOptional"
                                        checked={formData.isOptional}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isOptional: checked })}
                                    />
                                </div>

                                <div className="flex flex-col gap-y-2">
                                    <label className="text-xs text-muted-foreground px-1">Description (Optional)</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="bg-background rounded-xl border-border/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none p-4 text-sm"
                                        placeholder="Provide more details about this observance..."
                                    />
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 border-t border-border px-6 py-4">
                    <button
                        type="button"
                        onClick={() => onClose()}
                        className="btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={onSubmit}
                        className="btn-primary"
                    >
                        {editingHoliday ? 'Save changes' : 'Add holiday'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CompanyHolidayModal
