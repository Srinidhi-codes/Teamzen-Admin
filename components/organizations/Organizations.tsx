"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Department, Designation, OfficeLocation, Organizations } from "@/types/admin";
import OrganizationStats from "./OrganizationStats";
import OrganizationList from "./OrganizationList";
import CreateOrganizationForm from "./CreateOrganizationForm";
import { AddDepartmentForm, AddDesignationForm, AddOfficeForm } from "./OrganizationForms";
import OfficeLocationList from "./OfficeLocationList";
import DepartmentList from "./DepartmentsList";
import DesignationList from "./DesignationList";
import { useGraphQLDepartments, useGraphQLDesignations, useGraphQLOfficeLocations, useGraphQLOrganizations } from "@/lib/graphql/organization/organizatioHook";

export default function OrganizationsPage() {
    // const [organizations, setOrganizations] = useState<Organizations[]>(mockOrgs);

    // Form Visibility State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showOfficeForm, setShowOfficeForm] = useState(false);
    const [showDeptForm, setShowDeptForm] = useState(false);
    const [showDesigForm, setShowDesigForm] = useState(false);

    const { organizations, isOrganizationsLoading, isOrganizationsError, refetchOrganizations } = useGraphQLOrganizations()
    const { officeLocations, isOfficeLocationsLoading, isOfficeLocationsError, refetchOfficeLocations } = useGraphQLOfficeLocations()
    const { departments, isDepartmentsLoading, isDepartmentsError, refetchDepartments } = useGraphQLDepartments()
    const { designations, isDesignationsLoading, isDesignationsError, refetchDesignations } = useGraphQLDesignations()

    const mappedOrganizations: Organizations[] = organizations?.map((org) => ({
        id: org.id,
        name: org.name,
        description: "",
        manager_id: 0,
        employee_count: 0,
        created_at: org.createdAt,
    })) || [];

    const handleCreateOrg = async (data: any) => {
        // Simulate API call
        setShowOfficeForm(true)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newOrg: Organizations = {
            id: Math.random(),
            name: data.name,
            description: data.headquarters_address || "New Organization",
            manager_id: 0,
            employee_count: 0,
            created_at: new Date().toISOString().split('T')[0],
        };

        // setOrganizations([...organizations, newOrg]);
        setShowCreateForm(false);

        // Optionally ask to add details
        if (confirm("Organization created! Do you want to add an office location now?")) {
            setShowOfficeForm(true);
        }
    };

    const handleDelete = (id: number | string) => {
        if (confirm('Are you sure you want to delete this organization?')) {
            // setOrganizations(organizations.filter(o => o.id !== id));
        }
    }

    const closeAllForms = () => {
        setShowCreateForm(false);
        setShowOfficeForm(false);
        setShowDeptForm(false);
        setShowDesigForm(false);
    }

    const toggleForm = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        closeAllForms(); // Close others first to avoid clutter
        setter(true);
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Organization Management</h1>
                    <p className="text-gray-500 mt-1 text-lg">Manage your company structure and departments</p>
                </div>
            </div>

            {/* Stats */}
            {/* <OrganizationStats organizations={organizations} /> */}

            {/* Main Content */}
            <div className="space-y-6">
                <div className="bg-gray-50/50 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">All Organizations</h2>
                        <button
                            onClick={() => toggleForm(setShowCreateForm)}
                            className="btn-primary flex items-center justify-center px-6 py-2.5 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Organization
                        </button>
                    </div>

                    <OrganizationList
                        organizations={mappedOrganizations}
                        onEdit={(org) => console.log("Edit", org)}
                        onDelete={handleDelete}
                        onViewEmployees={(org) => console.log("View", org)}
                    />

                    <div className="mt-6">
                        {showCreateForm && (
                            <CreateOrganizationForm
                                onCancel={() => setShowCreateForm(false)}
                                onSubmit={handleCreateOrg}
                            />
                        )}
                    </div>
                </div>

                <div className="bg-gray-50/50 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">All Office Locations</h2>
                        <button onClick={() => toggleForm(setShowOfficeForm)} className="btn-primary flex items-center justify-center px-6 py-2.5 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"><Plus className="w-5 h-5 mr-2" />Add Office</button>
                    </div>

                    <OfficeLocationList
                        officeLocations={officeLocations || []}
                        onEdit={(org) => console.log("Edit", org)}
                        onDelete={handleDelete}
                        onViewEmployees={(org) => console.log("View", org)}
                    />
                    <div className="mt-6">
                        {showOfficeForm && (
                            <AddOfficeForm
                                onCancel={() => setShowOfficeForm(false)}
                                onSubmit={async () => {
                                    await new Promise(r => setTimeout(r, 1000));
                                    setShowOfficeForm(false);
                                    setShowDeptForm(true); // Wizard like flow? Or just close. Let's just close for now.
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className="bg-gray-50/50 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">All Departments</h2>
                        <button onClick={() => toggleForm(setShowDeptForm)} className="btn-primary flex items-center justify-center px-6 py-2.5 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"><Plus className="w-5 h-5 mr-2" />Add Department</button>
                    </div>

                    <DepartmentList
                        departments={departments || []}
                        onEdit={(org) => console.log("Edit", org)}
                        onDelete={handleDelete}
                        onViewEmployees={(org) => console.log("View", org)}
                    />
                    <div className="mt-6">

                        {showDeptForm && (
                            <AddDepartmentForm
                                onCancel={() => setShowDeptForm(false)}
                                onSubmit={async () => {
                                    await new Promise(r => setTimeout(r, 1000));
                                    setShowDeptForm(false);
                                }}
                            />
                        )}
                        <div className="mt-6">
                            {showDesigForm && (
                                <AddDesignationForm
                                    onCancel={() => setShowDesigForm(false)}
                                    onSubmit={async () => {
                                        await new Promise(r => setTimeout(r, 1000));
                                        setShowDesigForm(false);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50/50 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">All Designations</h2>
                        <button onClick={() => toggleForm(setShowDesigForm)} className="btn-primary flex items-center justify-center px-6 py-2.5 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"><Plus className="w-5 h-5 mr-2" />Add Designation</button>
                    </div>

                    <DesignationList
                        designations={designations || []}
                        onEdit={(org) => console.log("Edit", org)}
                        onDelete={handleDelete}
                        onViewEmployees={(org) => console.log("View", org)}
                    />
                </div>

            </div>
        </div>
    );
}
