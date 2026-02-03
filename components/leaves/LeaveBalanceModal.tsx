import { X } from 'lucide-react'
import React from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface LeaveBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: any;
    setFormData: (data: any) => void;
    editingBalance: boolean;
    users: any[];
    leaveTypes: any[];
}

function LeaveBalanceModal({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    editingBalance,
    users,
    leaveTypes
}: LeaveBalanceModalProps) {
    return (
        <div className="flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editingBalance ? 'Edit Leave Balance' : 'Add New Balance'}
                    </h2>
                    <button onClick={() => onClose()} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    {!editingBalance && (
                        <>
                            <div className="flex flex-col gap-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                                <Select
                                    value={formData.userId}
                                    onValueChange={(value) => setFormData({ ...formData, userId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.firstName} {u.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                <Select
                                    value={formData.leaveTypeId}
                                    onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.map(lt => (
                                            <SelectItem key={lt.id} value={lt.id}>
                                                {lt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Input
                                label="Year"
                                type="number"
                                required
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            />
                        </>
                    )}

                    <Input
                        label="Total Entitled Days"
                        type="number"
                        step="0.5"
                        required
                        value={formData.totalEntitled}
                        onChange={(e) => setFormData({ ...formData, totalEntitled: parseFloat(e.target.value) })}
                    />

                    <div className="flex justify-end space-x-3 pt-6 sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            {editingBalance ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LeaveBalanceModal
