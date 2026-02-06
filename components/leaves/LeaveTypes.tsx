"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useGraphQLLeaveTypes, useGraphQLLeaveMutations } from '@/lib/graphql/leaves/leavesHook'
import { DataTable, Column } from '../common/DataTable'
import { LeaveType } from '@/lib/graphql/leaves/types'
import { Plus, X, Edit, Trash2, AlertCircle } from 'lucide-react'
import LeaveTypeModal from './LeaveTypeModal'
import ConfirmationModal from '../common/ConfirmationModal'
import { useStore } from '@/lib/store/useStore'


const LeaveTypes = () => {
    const { user } = useStore();
    const { leaveTypes, isLoading, error, refetch } = useGraphQLLeaveTypes();
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
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-inner uppercase">
                        {row.code}
                    </div>
                    <span className="font-black text-foreground tracking-tight">
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
                    className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all duration-300 ${isActive === true
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5"
                        : "bg-destructive/10 text-destructive border border-destructive/20 shadow-destructive/5"

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
                        className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/5 active:scale-90"
                        title="Modify Protocol"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(type.id)}
                        className="p-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all duration-300 shadow-lg shadow-destructive/5 active:scale-90"
                        title="Decommission"
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
        console.log(user?.organization?.id)
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
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-premium-label animate-pulse">Synchronizing Policies Matrix...</p>
        </div>
    );


    if (error) return (
        <div className="p-12 text-center bg-destructive/10 rounded-4xl border border-destructive/20 mx-auto max-w-2xl animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight mb-2">Policy Violation</h3>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">{error.message}</p>
        </div>
    );


    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="premium-card flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full shadow-sm shadow-primary/20" />
                    <h2 className="text-premium-h2 leading-none">Configured Leave Types</h2>
                    <p className="text-premium-label mt-2 opacity-60">Manage leave policies and configurations</p>
                </div>

                <button
                    onClick={() => {
                        setEditingType(null);
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="btn-primary"
                >
                    <Plus className="w-5 h-5 mr-3" />
                    <span>Initialize Protocol</span>
                </button>


            </div>

            <div className="bg-card rounded-4xl border border-border shadow-2xl shadow-primary/5 overflow-hidden p-2">
                <DataTable
                    data={leaveTypes.filter((lt) => lt.isActive)}
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