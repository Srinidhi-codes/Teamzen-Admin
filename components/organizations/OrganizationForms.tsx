"use client";

import { useState } from "react";
import { FormInput } from "../common/FormInput";

interface BaseFormProps {
    onCancel: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export function AddOfficeForm({ onCancel, onSubmit }: BaseFormProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
        await onSubmit(data);
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Office Location</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput name="name" label="Office Name" required placeholder="e.g. Headquarters" />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                        name="address"
                        rows={3}
                        required
                        className="w-full textarea resize-none"
                        placeholder="Full office address"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput name="login_time" label="Login Time" type="time" defaultValue="09:00" />
                    <FormInput name="logout_time" label="Logout Time" type="time" defaultValue="17:00" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput name="latitude" label="Latitude" type="number" step="any" required placeholder="0.000000" />
                    <FormInput name="longitude" label="Longitude" type="number" step="any" required placeholder="0.000000" />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-primary min-w-[120px]" disabled={loading}>
                        {loading ? "Saving..." : "Save Location"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function AddDepartmentForm({ onCancel, onSubmit }: BaseFormProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
        await onSubmit(data);
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Department</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput name="name" label="Department Name" required placeholder="e.g. Engineering" />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full textarea resize-none"
                        placeholder="Brief description of the department"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-primary min-w-[120px]" disabled={loading}>
                        {loading ? "Saving..." : "Save Department"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function AddDesignationForm({ onCancel, onSubmit }: BaseFormProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
        await onSubmit(data);
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Designation</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput name="name" label="Designation Title" required placeholder="e.g. Senior Developer" />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full textarea resize-none"
                        placeholder="Role responsibilities and requirements"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-primary min-w-[120px]" disabled={loading}>
                        {loading ? "Saving..." : "Save Designation"}
                    </button>
                </div>
            </form>
        </div>
    );
}
