"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useGraphQLCompanyHolidays, useGraphQLCompanyHolidayMutations } from '@/lib/graphql/leaves/leavesHook'
import { DataTable, Column } from '../common/DataTable'
import { CompanyHoliday } from '@/lib/graphql/leaves/types'
import { Plus, Edit, Trash2, AlertCircle, RotateCcw, Calendar as CalendarIcon } from 'lucide-react'
import CompanyHolidayModal from './CompanyHolidayModal'
import ConfirmationModal from '../common/ConfirmationModal'
import { useStore } from '@/lib/store/useStore'
import { format } from 'date-fns'

const CompanyHolidays = () => {
    const { user } = useStore();
    const { companyHolidays, isLoading, error, refetch } = useGraphQLCompanyHolidays();
    const { createCompanyHoliday, updateCompanyHoliday, deleteCompanyHoliday } = useGraphQLCompanyHolidayMutations();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<CompanyHoliday | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const formRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        holidayDate: format(new Date(), 'yyyy-MM-dd'),
        isOptional: false,
        description: '',
        organizationId: user?.organization?.id || ''
    });

    useEffect(() => {
        if (user?.organization?.id && !formData.organizationId) {
            setFormData(prev => ({ ...prev, organizationId: user?.organization?.id || '' }));
        }
    }, [user, formData.organizationId]);

    const columns: Column<CompanyHoliday>[] = [
        {
            key: 'name',
            label: 'Holiday Name',
            render: (name, row) => (
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-inner">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-foreground tracking-tight">
                            {name}
                        </span>
                        {row.description && (
                            <span className="text-[10px] text-muted-foreground font-medium line-clamp-1">
                                {row.description}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        { 
            key: 'holidayDate', 
            label: 'Date',
            render: (date: string) => (
                <span className="font-bold text-sm text-foreground">
                    {format(new Date(date), 'MMMM dd, yyyy')}
                </span>
            )
        },
        {
            key: 'isOptional',
            label: 'Type',
            render: (isOptional: boolean) => (
                <span
                    className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all duration-300 ${!isOptional
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                >
                    {!isOptional ? 'Mandatory' : 'Optional'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, holiday: CompanyHoliday) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingHoliday(holiday);
                            setFormData({
                                name: holiday.name,
                                holidayDate: holiday.holidayDate,
                                isOptional: holiday.isOptional,
                                description: holiday.description || '',
                                organizationId: user?.organization?.id || ''
                            });
                            setIsModalOpen(true);
                        }}
                        className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/5 active:scale-90"
                        title="Edit Holiday"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(holiday.id)}
                        className="p-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all duration-300 shadow-lg shadow-destructive/5 active:scale-90"
                        title="Remove Holiday"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const resetForm = () => {
        setFormData({
            name: '',
            holidayDate: format(new Date(), 'yyyy-MM-dd'),
            isOptional: false,
            description: '',
            organizationId: user?.organization?.id || ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                organizationId: formData.organizationId || user?.organization?.id
            };

            if (editingHoliday) {
                await updateCompanyHoliday({
                    id: editingHoliday.id,
                    ...submitData
                });
            } else {
                await createCompanyHoliday(submitData);
            }
            setIsModalOpen(false);
            setEditingHoliday(null);
            resetForm();
            refetch();
        } catch (err) {
            console.error("Error saving holiday:", err);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteCompanyHoliday(deleteId);
            refetch();
        } catch (err) {
            console.error("Error deleting holiday:", err);
        }
        setDeleteId(null);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-premium-label animate-pulse">Syncing Festive Calendar...</p>
        </div>
    );

    if (error) return (
        <div className="p-12 text-center bg-destructive/10 rounded-4xl border border-destructive/20 mx-auto max-w-2xl animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight mb-2">Calendar Synchronization Failed</h3>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">{error.message}</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="premium-card flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-purple-500 rounded-full shadow-sm shadow-purple-500/20" />
                    <h2 className="text-premium-h2 leading-none">Organizational Holidays</h2>
                    <p className="text-premium-label mt-2 opacity-60">Manage corporate observances and festive shutdowns</p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <button
                        onClick={() => refetch()}
                        className="p-4 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-2xl transition-all active:rotate-180 duration-500"
                        title="Sync Holidays"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            setEditingHoliday(null);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex-1 lg:flex-none"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        <span>Add Holiday</span>
                    </button>
                </div>
            </div>

            <DataTable
                data={companyHolidays}
                columns={columns}
            />

            <div ref={formRef}>
                {isModalOpen && (
                    <CompanyHolidayModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setEditingHoliday(null);
                            resetForm();
                        }}
                        onSubmit={handleSubmit}
                        formData={formData}
                        setFormData={setFormData}
                        editingHoliday={!!editingHoliday}
                    />
                )}

                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title="Remove Holiday"
                    description="Are you sure you want to remove this holiday? This will reflect on all employee calendars immediately."
                    confirmText="Remove"
                    variant="destructive"
                />
            </div>
        </div>
    )
}

export default CompanyHolidays
