"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useGraphQLLeaveTypes, useGraphQLLeaveMutations } from '@/lib/graphql/leaves/leavesHook'
import { useMe } from '@/lib/graphql/users/userHooks'
import { DataTable, Column } from '../common/DataTable'
import { LeaveType } from '@/lib/graphql/leaves/types'
import { Plus, X, Edit, Trash2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import LeaveTypeModal from './LeaveTypeModal'

const LeaveTypes = () => {
    const { me } = useMe();
    const { leaveTypes, isLoading, error, refetch } = useGraphQLLeaveTypes();
    const { createLeaveType, updateLeaveType, deleteLeaveType } = useGraphQLLeaveMutations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<LeaveType | null>(null);

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
        isActive: true
    });

    const columns: Column<LeaveType>[] = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'maxDaysPerYear', label: 'Annual Limit' },
        { key: 'accrualFrequency', label: 'Accrual' },
        {
            key: 'isActive',
            label: 'Status',
            render: (isActive: boolean) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, type: LeaveType) => (
                <div className="flex space-x-2">
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
                                isActive: type.isActive
                            });
                            setIsModalOpen(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(type.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
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
            isActive: true
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
                await createLeaveType({
                    ...submitData,
                    organizationId: me?.organization?.id
                });
            }
            setIsModalOpen(false);
            setEditingType(null);
            resetForm();
            refetch();
        } catch (err) {
            console.error("Error saving leave type:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to deactivate this leave type?")) {
            try {
                await deleteLeaveType(id);
                refetch();
            } catch (err) {
                console.error("Error deleting leave type:", err);
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading leave types...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-6 rounded-3xl backdrop-blur-sm border shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Configured Leave Types</h2>
                    <p className="text-gray-500 mt-1">Manage leave policies and configurations</p>
                </div>
                <button
                    onClick={() => {
                        setEditingType(null);
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create New Type</span>
                </button>
            </div>

            <DataTable
                data={leaveTypes.filter((lt) => lt.isActive)}
                columns={columns}
            />

            <div ref={formRef}>
                {isModalOpen && (
                    <LeaveTypeModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onSubmit={handleSubmit}
                        formData={formData}
                        setFormData={setFormData}
                        editingType={!!editingType}
                    />
                )}
            </div>
        </div>
    )
}

export default LeaveTypes