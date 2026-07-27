"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useGraphQLCompanyHolidays, useGraphQLCompanyHolidayMutations } from '@/lib/graphql/leaves/leavesHook'
import { DataTable, Column } from '../common/DataTable'
import { CompanyHoliday } from '@/lib/graphql/leaves/types'
import { Plus, Edit, Trash2, RotateCcw, Calendar as CalendarIcon } from 'lucide-react'
import CompanyHolidayModal from './CompanyHolidayModal'
import ConfirmationModal from '../common/ConfirmationModal'
import { useStore } from '@/lib/store/useStore'
import { format } from 'date-fns'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { SearchInput } from '../common/SearchInput'

const CompanyHolidays = () => {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const { user } = useStore();
    const { companyHolidays, isLoading, error, refetch } = useGraphQLCompanyHolidays(debouncedSearch);
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
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm">
                            {name}
                        </span>
                        {row.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
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
                    className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize ${!isOptional
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
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
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(holiday.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                        title="Delete"
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
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
            <div className="flex justify-end">
                <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-card p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="mx-auto max-w-md rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
            <p className="text-sm text-destructive">{error.message}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-end items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Refresh"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <SearchInput
                        placeholder="Search holidays..."
                        value={search}
                        onChange={setSearch}
                        containerClassName="flex-1 lg:w-64 min-w-[200px]"
                        className="h-9"
                    />
                    <button
                        onClick={() => {
                            setEditingHoliday(null);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex-1 lg:flex-none"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        <span>Create holiday</span>
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <DataTable
                    data={companyHolidays}
                    columns={columns}
                />
            </div>

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
