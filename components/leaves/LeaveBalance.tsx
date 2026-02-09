"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useGraphQLLeaveBalances, useGraphQLLeaveMutations, useGraphQLLeaveTypes } from '@/lib/graphql/leaves/leavesHook'
import { useUsers, useMe } from '@/lib/graphql/users/userHooks'
import { LeaveBalance as LeaveBalanceType } from '@/lib/graphql/leaves/types'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { cn } from "@/lib/utils"


import { DataTable, Column } from '../common/DataTable'
import LeaveBalanceModal from './LeaveBalanceModal'
import ConfirmationModal from '../common/ConfirmationModal'


const LeaveBalance = () => {
    const { me } = useMe();
    const { leaveBalanceData, isLoading, error, refetch } = useGraphQLLeaveBalances();
    const { leaveTypes } = useGraphQLLeaveTypes();
    const { users } = useUsers();
    const { createLeaveBalance, updateLeaveBalance, deleteLeaveBalance } = useGraphQLLeaveMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBalance, setEditingBalance] = useState<LeaveBalanceType | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

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
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-inner">
                        {name.charAt(0)}
                    </div>
                    <span className="font-black text-foreground tracking-tight">{name}</span>
                </div>
            )
        },

        ...leaveTypes.map(lt => ({
            key: lt.id,
            label: lt.name,
            render: (val: any, row: any) => {
                const isSelf = row.user.id === me?.id;
                return val ? (
                    <div
                        className={cn(
                            "group relative p-3 rounded-2xl transition-all duration-300",
                            isSelf ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-primary/5"
                        )}
                        onClick={(e) => {
                            if (isSelf) return;
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
                        <div className="flex items-baseline gap-1.5 mb-2">
                            <span className={cn(
                                "text-xl font-black text-foreground transition-colors",
                                !isSelf && "group-hover:text-primary"
                            )}>
                                {val.available}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">/ {val.total}d</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${Math.min((val.available / (val.total || 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-4">
                        <span className="text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.2em]">—</span>
                    </div>
                )
            }

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

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteLeaveBalance(deleteId);
            refetch();
        } catch (err) {
            console.error("Error deleting balance:", err);
        }
        setDeleteId(null);
    };


    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Entitlements...</p>
        </div>
    );


    if (error) return (
        <div className="p-8 text-center bg-destructive/10 rounded-3xl border border-destructive/20">
            <p className="text-destructive font-black text-sm uppercase tracking-widest">Entitlement Breach: {error.message}</p>
        </div>
    );


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="premium-card flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full shadow-sm shadow-primary/20" />
                    <h2 className="text-premium-h2 leading-none">Leave Balances</h2>
                    <p className="text-premium-label mt-2 opacity-60">Unified synchronization of leave balances.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-80 group w-full">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Identify human asset..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-14"
                        />

                    </div>
                    <button
                        onClick={() => {
                            setEditingBalance(null);
                            setFormData({ userId: '', leaveTypeId: '', year: new Date().getFullYear(), totalEntitled: 0 });
                            setIsModalOpen(true);
                        }}
                        className="btn-primary w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        <span>Allocate Quota</span>
                    </button>

                </div>
            </div>


            <div className="bg-card rounded-4xl border border-border shadow-2xl shadow-primary/5 overflow-hidden p-2">
                <DataTable
                    data={filteredAggregated}
                    columns={dynamicColumns}
                />
            </div>


            {filteredAggregated.length === 0 && (
                <div className="text-center py-32 bg-muted/20 rounded-4xl border-2 border-dashed border-border animate-in fade-in duration-700">
                    <div className="text-6xl mb-6 opacity-20">📭</div>
                    <p className="text-muted-foreground font-black text-sm uppercase tracking-widest">No assets identified in the current perimeter.</p>
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

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Deactivate Allowance"
                description="Are you sure you want to deactivate this leave entitlement? This action will remove the allocated quota for this cycle."
                confirmText="Deactivate"
                variant="destructive"
            />

        </div>
    );
}

export default LeaveBalance