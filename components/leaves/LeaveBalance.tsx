"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useGraphQLLeaveBalances, useGraphQLLeaveMutations, useGraphQLLeaveTypes } from '@/lib/graphql/leaves/leavesHook'
import { useUsers, useMe } from '@/lib/graphql/users/userHooks'
import { LeaveBalance as LeaveBalanceType } from '@/lib/graphql/leaves/types'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { DataTable, Column } from '../common/DataTable'
import LeaveBalanceModal from './LeaveBalanceModal'

const LeaveBalance = () => {
    const { me } = useMe();
    const { leaveBalanceData, isLoading, error, refetch } = useGraphQLLeaveBalances();
    const { leaveTypes } = useGraphQLLeaveTypes();
    const { users } = useUsers();
    const { createLeaveBalance, updateLeaveBalance, deleteLeaveBalance } = useGraphQLLeaveMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBalance, setEditingBalance] = useState<LeaveBalanceType | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        userId: '',
        leaveTypeId: '',
        year: new Date().getFullYear(),
        totalEntitled: 0
    });

    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isModalOpen && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isModalOpen]);

    // --- Data Aggregation for the Portfolio Table ---
    const aggregatedData = users.map(user => {
        const userBalances = (leaveBalanceData || []).filter(b => b.user.id === user.id && b.isActive);
        const row: any = {
            id: user.id,
            user: user,
            employeeName: `${user.firstName} ${user.lastName}`,
        };

        userBalances.forEach(b => {
            row[b.leaveType.id] = {
                id: b.id,
                available: b.availableBalance,
                total: b.totalEntitled,
                leaveType: b.leaveType,
                original: b
            };
        });

        return row;
    }).filter(row => Object.keys(row).length > 3);

    const dynamicColumns: Column<any>[] = [
        {
            key: 'employeeName',
            label: 'Employee',
            render: (name) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {name[0]}
                    </div>
                    <span className="font-semibold">{name}</span>
                </div>
            )
        },
        ...leaveTypes.map(lt => ({
            key: lt.id,
            label: lt.name,
            render: (val: any, row: any) => val ? (
                <div
                    className="group relative cursor-pointer hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditingBalance(val.original);
                        setFormData({
                            userId: row.user.id,
                            leaveTypeId: val.leaveType.id,
                            year: val.original.year,
                            totalEntitled: val.total
                        });
                        setIsModalOpen(true);
                    }}
                >
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-gray-900 group-hover:text-indigo-600">{val.available}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">/ {val.total}d</span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((val.available / (val.total || 1)) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            ) : (
                <span className="text-gray-300 text-xs italic">-</span>
            )
        }))
    ];

    const filteredAggregated = aggregatedData.filter(row =>
        row.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBalance) {
                await updateLeaveBalance({
                    id: editingBalance.id,
                    totalEntitled: parseFloat(formData.totalEntitled.toString())
                });
            } else {
                await createLeaveBalance({
                    userId: formData.userId,
                    leaveTypeId: formData.leaveTypeId,
                    year: parseInt(formData.year.toString()),
                    totalEntitled: parseFloat(formData.totalEntitled.toString())
                });
            }
            setIsModalOpen(false);
            setEditingBalance(null);
            setFormData({ userId: '', leaveTypeId: '', year: new Date().getFullYear(), totalEntitled: 0 });
            refetch();
        } catch (err) {
            console.error("Error saving balance:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to deactivate this balance?")) {
            try {
                await deleteLeaveBalance(id);
                refetch();
            } catch (err) {
                console.error("Error deleting balance:", err);
            }
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">Loading employee records...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-600 font-medium">Error loading balances: {error.message}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-6 rounded-3xl backdrop-blur-sm border shadow-sm">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Leave Balances</h2>
                    <p className="text-gray-500 mt-1">Unified view of employee entitlements</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <input
                            type="text"
                            placeholder="Filter by employee name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Plus className="w-5 h-5 opacity-50" />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingBalance(null);
                            setFormData({ userId: '', leaveTypeId: '', year: new Date().getFullYear(), totalEntitled: 0 });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-indigo-200 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Balance</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden p-2">
                <DataTable
                    data={filteredAggregated}
                    columns={dynamicColumns}
                />
            </div>

            {filteredAggregated.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-lg">No records match your criteria.</p>
                </div>
            )}

            <div ref={formRef}>
                {isModalOpen && (
                    <LeaveBalanceModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onSubmit={handleSubmit}
                        formData={formData}
                        setFormData={setFormData}
                        editingBalance={!!editingBalance}
                        users={users}
                        leaveTypes={leaveTypes}
                    />
                )}
            </div>
        </div>
    );
}

export default LeaveBalance