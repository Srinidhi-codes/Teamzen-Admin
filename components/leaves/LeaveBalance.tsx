"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useGraphQLLeaveBalances, useGraphQLLeaveMutations, useGraphQLLeaveTypes } from '@/lib/graphql/leaves/leavesHook'
import { useGraphQLUsers } from '@/lib/graphql/users/userHook'
import { useMe } from '@/lib/graphql/users/userHooks'
import { LeaveBalance as LeaveBalanceType } from '@/lib/graphql/leaves/types'
import { Plus, RotateCcw } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useDebounce } from "@/lib/hooks/useDebounce";
import { SearchInput } from '../common/SearchInput'
import { OrganizationFilterSelect } from '@/components/common/OrganizationFilterSelect'
import { DataTable, Column } from '../common/DataTable'
import LeaveBalanceModal from './LeaveBalanceModal'
import ConfirmationModal from '../common/ConfirmationModal'

const PAGE_SIZE = 10;

const LeaveBalance = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [organizationId, setOrganizationId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearch = useDebounce(searchQuery, 500);
    const { me } = useMe();
    const { leaveBalanceData, isLoading, error, refetch } = useGraphQLLeaveBalances(
        debouncedSearch,
        organizationId || undefined
    );
    const { leaveTypes } = useGraphQLLeaveTypes(undefined, organizationId || undefined);
    // Modal user picker only — not used to drive the table (table comes from balances)
    const { users } = useGraphQLUsers({
        page: 1,
        pageSize: 200,
        filters: organizationId ? { organizationId } : undefined,
    });
    const { createLeaveBalance, updateLeaveBalance, deleteLeaveBalance } = useGraphQLLeaveMutations();

    const isManager = me?.role === 'manager';
    const isAdmin = me?.role === 'admin' || me?.role === 'superadmin' || me?.role === 'hr';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBalance, setEditingBalance] = useState<LeaveBalanceType | null>(null);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, organizationId]);

    // Aggregate from leave balances (not the paginated users list)
    const aggregatedData = useMemo(() => {
        const byUser = new Map<string, any>();

        for (const b of leaveBalanceData || []) {
            if (!b?.user?.id || b.isActive === false) continue;
            if (isManager && b.user.manager?.id !== me?.id && b.user.id !== me?.id) {
                continue;
            }

            let row = byUser.get(b.user.id);
            if (!row) {
                row = {
                    id: b.user.id,
                    user: b.user,
                    employeeName: `${b.user.firstName || ""} ${b.user.lastName || ""}`.trim() || "Employee",
                    departmentName: b.user.department?.name || "",
                    organizationName: b.user.organization?.name || "",
                };
                byUser.set(b.user.id, row);
            }

            row[b.leaveType.id] = {
                id: b.id,
                available: b.availableBalance,
                total: b.totalAllocation,
                leaveType: b.leaveType,
                original: b,
            };
        }

        return Array.from(byUser.values()).sort((a, b) =>
            a.employeeName.localeCompare(b.employeeName)
        );
    }, [leaveBalanceData, isManager, me?.id]);

    const totalRows = aggregatedData.length;
    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return aggregatedData.slice(start, start + PAGE_SIZE);
    }, [aggregatedData, currentPage]);

    const dynamicColumns: Column<any>[] = [
        {
            key: 'employeeName',
            label: 'Employee',
            render: (name) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                        {(name || "?").charAt(0)}
                    </div>
                    <span className="font-medium text-foreground text-sm">{name}</span>
                </div>
            )
        },
        ...leaveTypes
            .filter(lt => {
                if (isManager) {
                    const name = lt.name.toLowerCase();
                    return name.includes('complementary leave') || name.includes('comp off');
                }
                return true;
            })
            .map(lt => ({
                key: lt.id,
                label: lt.name,
                render: (val: any, row: any) => {
                    const canEdit = isAdmin || (isManager && row.user.manager?.id === me?.id);

                    return val ? (
                        <div
                            className={cn(
                                "group relative p-3 rounded-2xl transition-all duration-300",
                                !canEdit ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-primary/5"
                            )}
                            onClick={(e) => {
                                if (!canEdit) return;
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
                                    "text-lg font-semibold text-foreground transition-colors",
                                    canEdit && "group-hover:text-primary"
                                )}>
                                    {val.available}
                                </span>
                                <span className="text-xs text-muted-foreground">/ {val.total}d</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${val.total > 0
                                            ? Math.min((val.available / val.total) * 100, 100)
                                            : (val.available > 0 ? 100 : 0)}%`
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-4">
                            <span className="text-muted-foreground/40 text-sm">—</span>
                        </div>
                    )
                }
            }))
    ];

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
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-3 h-4 w-28 animate-pulse rounded-md bg-muted" />
                        <div className="mb-2 h-8 w-16 animate-pulse rounded-md bg-muted" />
                        <div className="h-3 w-full animate-pulse rounded-md bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="mx-auto max-w-md rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
            <p className="text-sm text-destructive">{error.message}</p>
        </div>
    );

    const modalUsers = (users || []).filter((u: any) => {
        if (isManager) return u.manager?.id === me?.id;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-end items-center gap-4">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                    <SearchInput
                        placeholder="Search by name, department, or company..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        containerClassName="flex-1 sm:w-80"
                        className="h-9"
                    />
                    <OrganizationFilterSelect
                        value={organizationId}
                        onChange={setOrganizationId}
                    />
                    <button
                        onClick={() => {
                            setEditingBalance(null);
                            setFormData({ userId: '', leaveTypeId: '', year: new Date().getFullYear(), totalEntitled: 0 });
                            setIsModalOpen(true);
                        }}
                        className="btn-primary w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        <span>Allocate balance</span>
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
                    data={pagedData}
                    columns={dynamicColumns}
                    total={totalRows}
                    currentPage={currentPage}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                    paginationLabel="employees"
                />
            </div>

            {totalRows === 0 && (
                <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
                    <p className="text-sm text-muted-foreground">No leave balances found.</p>
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
                        users={modalUsers}
                        leaveTypes={isManager
                            ? leaveTypes.filter(lt => {
                                const name = lt.name.toLowerCase();
                                return name.includes('complementary leave') || name.includes('comp off');
                            })
                            : leaveTypes
                        }
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
