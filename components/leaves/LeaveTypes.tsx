"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useGraphQLLeaveTypes, useGraphQLLeaveMutations } from '@/lib/graphql/leaves/leavesHook'
import { DataTable, Column } from '../common/DataTable'
import { LeaveType } from '@/lib/graphql/leaves/types'
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react'
import LeaveTypeModal from './LeaveTypeModal'
import ConfirmationModal from '../common/ConfirmationModal'
import { useStore } from '@/lib/store/useStore'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { SearchInput } from '../common/SearchInput'


const LeaveTypes = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { user } = useStore();
    const { leaveTypes, isLoading, error, refetch } = useGraphQLLeaveTypes(debouncedSearch);
    const { createLeaveType, updateLeaveType, deleteLeaveType } = useGraphQLLeaveMutations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<LeaveType | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);


    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isModalOpen && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isModalOpen]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        maxDaysPerYear: 10,
        carryForwardAllowed: false,
        carryForwardMaxDays: 0,
        accrualFrequency: 'yearly',
        accrualDays: 0,
        isPaidLeave: false,
        requiresApproval: true,
        allowEncashment: false,
        encashmentRate: 0,
        prorateOnJoin: true,
        prorateOnExit: true,
        prorationBasis: 'monthly',
        isActive: true,
        organizationId: user?.organization?.id || ''
    });

    useEffect(() => {
        if (user?.organization?.id && !formData.organizationId) {
            setFormData(prev => ({ ...prev, organizationId: user?.organization?.id || '' }));
        }
    }, [user, formData.organizationId]);

    const columns: Column<LeaveType>[] = [
        {
            key: 'name',
            label: 'Name',
            render: (name, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-medium text-xs uppercase">
                        {row.code}
                    </div>
                    <span className="font-medium text-foreground text-sm">
                        {name}
                    </span>
                </div>
            ),
        },
        { key: 'maxDaysPerYear', label: 'Annual Limit' },
        { key: 'accrualFrequency', label: 'Accrual', className: 'capitalize' },
        {
            key: 'isActive',
            label: 'Status',
            render: (isActive: boolean) => (
                <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize ${isActive === true
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                        }`}
                >
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },

        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, type: LeaveType) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingType(type);
                            setFormData({
                                name: type.name,
                                code: type.code,
                                description: type.description || '',
                                maxDaysPerYear: type.maxDaysPerYear,
                                carryForwardAllowed: type.carryForwardAllowed,
                                carryForwardMaxDays: type.carryForwardMaxDays,
                                accrualFrequency: type.accrualFrequency || 'yearly',
                                accrualDays: type.accrualDays || 0,
                                isPaidLeave: type.isPaidLeave,
                                requiresApproval: type.requiresApproval,
                                allowEncashment: type.allowEncashment,
                                encashmentRate: type.encashmentRate || 0,
                                prorateOnJoin: type.prorateOnJoin,
                                prorateOnExit: type.prorateOnExit,
                                prorationBasis: type.prorationBasis || 'monthly',
                                isActive: type.isActive,
                                organizationId: formData.organizationId
                            });
                            setIsModalOpen(true);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(type.id)}
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
            code: '',
            description: '',
            maxDaysPerYear: 10,
            carryForwardAllowed: false,
            carryForwardMaxDays: 0,
            accrualFrequency: 'yearly',
            accrualDays: 0,
            isPaidLeave: false,
            requiresApproval: true,
            allowEncashment: false,
            encashmentRate: 0,
            prorateOnJoin: true,
            prorateOnExit: true,
            prorationBasis: 'monthly',
            isActive: true,
            organizationId: user?.organization?.id || ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                maxDaysPerYear: parseInt(formData.maxDaysPerYear.toString()),
                accrualDays: parseFloat(formData.accrualDays.toString()),
                carryForwardMaxDays: parseInt(formData.carryForwardMaxDays.toString()),
                encashmentRate: parseFloat(formData.encashmentRate.toString())
            };

            if (editingType) {
                await updateLeaveType({
                    id: editingType.id,
                    ...submitData
                });
            } else {
                const finalData = {
                    ...submitData,
                    organizationId: formData.organizationId || user?.organization?.id
                };

                if (!finalData.organizationId) {
                    console.error("Organization ID is missing");
                    return;
                }

                await createLeaveType(finalData);
            }
            setIsModalOpen(false);
            setEditingType(null);
            resetForm();
            refetch();
        } catch (err) {
            console.error("Error saving leave type:", err);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteLeaveType(deleteId);
            refetch();
        } catch (err) {
            console.error("Error deleting leave type:", err);
        }
        setDeleteId(null);
    };


    if (isLoading) return (
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
            <div className="flex justify-end">
                <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-card p-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
                ))}
            </div>
        </div>
    );


    if (error) return (
        <div className="mx-auto max-w-md rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
            <p className="text-sm text-destructive">{error.message}</p>
        </div>
    );


    const filteredLeaveTypes = leaveTypes || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-end items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <SearchInput
                        placeholder="Search leave types..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        containerClassName="flex-1 lg:w-64 min-w-[200px]"
                        className="h-9"
                    />
                    <button
                        onClick={() => {
                            setEditingType(null);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex-1 lg:flex-none"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        <span>Create leave type</span>
                    </button>
                    <button
                        onClick={() => refetch()}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Refresh"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <DataTable
                    data={filteredLeaveTypes}
                    columns={columns}
                />
            </div>


            <div ref={formRef}>
                {isModalOpen && (
                    <LeaveTypeModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setEditingType(null);
                            resetForm();
                        }}
                        onSubmit={handleSubmit}
                        formData={formData}
                        setFormData={setFormData}
                        editingType={!!editingType}
                    />
                )}

                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    title="Deactivate Leave Type"
                    description="Are you sure you want to deactivate this leave type? This action will impact entitlement synchronization across all employees."
                    confirmText="Deactivate"
                    variant="destructive"
                />
            </div>
        </div>
    )
}

export default LeaveTypes