"use client";

import { useState } from "react";
import { FormInput } from "../common/FormInput";

interface CreateOrganizationFormProps {
    onCancel: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function CreateOrganizationForm({
    onCancel,
    onSubmit,
}: CreateOrganizationFormProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Gather form data
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());

        await onSubmit(data);
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Organization</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-500"
                >
                    ✕
                </button>
            </div>

            <form id="create-org-form" className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                    <FormInput
                        label="Organization Name"
                        name="name"
                        required
                        placeholder="e.g. Acme Corp"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormInput
                            label="GST Number"
                            name="gst_number"
                            placeholder="Optional"
                        />
                        <FormInput
                            label="PAN Number"
                            name="pan_number"
                            placeholder="Optional"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Headquarters Address
                        </label>
                        <textarea
                            name="headquarters_address"
                            rows={3}
                            required
                            className="w-full textarea resize-none"
                            placeholder="Enter full address"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked
                            id="is_active"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 font-medium">
                            Active Status
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary min-w-[140px]"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Organization"}
                    </button>
                </div>
            </form>
        </div>
    );
}
