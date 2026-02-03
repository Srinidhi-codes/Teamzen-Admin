"use client";

import { useState, useRef, useEffect } from "react";
import { Briefcase, Building2, MapPin, Plus, UserRoundCog, Building, Globe, Layers, Shapes } from "lucide-react";
import { useRouter } from "next/navigation";
import { OfficeLocation, Organization, Department, Designation } from "@/lib/graphql/organization/types";
import OrganizationList from "./OrganizationList";
import CreateOrganizationForm from "./CreateOrganizationForm";
import { AddDepartmentForm, AddDesignationForm, AddOfficeForm } from "./OrganizationForms";
import OfficeLocationList from "./OfficeLocationList";
import DepartmentList from "./DepartmentsList";
import DesignationList from "./DesignationList";
import {
    useGraphQLDepartments,
    useGraphQLDesignations,
    useGraphQLOfficeLocations,
    useGraphQLOrganizations,
} from "@/lib/graphql/organization/organizationsHook";
import { OrganizationTabs } from "./OrganizationTabs";

export default function OrganizationsPage() {
    type FormKey = "organization" | "office" | "department" | "designation" | null;

    const [activeTab, setActiveTab] = useState("organizations");
    const [activeForm, setActiveForm] = useState<FormKey>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [editingOffLoc, setEditingOffLoc] = useState<OfficeLocation | null>(null);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
    const router = useRouter();

    const formRefs = {
        organization: useRef<HTMLDivElement>(null),
        office: useRef<HTMLDivElement>(null),
        department: useRef<HTMLDivElement>(null),
        designation: useRef<HTMLDivElement>(null),
    } as const;

    const openForm = (key: FormKey) => {
        setEditingOrg(null);
        setActiveForm(key);
    };

    const closeForm = () => {
        setActiveForm(null);
        setEditingOrg(null);
        setEditingOffLoc(null);
        setEditingDept(null);
        setEditingDesig(null);
    };

    useEffect(() => {
        if (activeForm && formRefs[activeForm].current) {
            formRefs[activeForm].current!.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [activeForm]);

    const { organizations, isOrganizationsLoading: orgsLoading } = useGraphQLOrganizations();
    const { officeLocations, isOfficeLocationsLoading: officesLoading } = useGraphQLOfficeLocations();
    const { departments, isDepartmentsLoading: deptsLoading } = useGraphQLDepartments();
    const { designations, isDesignationsLoading: desigsLoading } = useGraphQLDesignations();

    const handleViewEmployees = (org: Organization) => {
        router.push(`/organizations/${org.id}/employees`);
    };

    const handleEditOrg = (org: Organization) => {
        setEditingOrg(org);
        setActiveForm("organization");
    };

    const handleEditOffLoc = (office: OfficeLocation) => {
        setEditingOffLoc(office);
        setActiveForm("office");
    };

    const handleEditDept = (dept: Department) => {
        setEditingDept(dept);
        setActiveForm("department");
    };

    const handleEditDesignation = (desig: Designation) => {
        setEditingDesig(desig);
        setActiveForm("designation");
    };

    const tabs = [
        { id: "organizations", label: "Organizations", icon: <Building className="w-5 h-5" />, color: "from-indigo-500 to-blue-600" },
        { id: "offices", label: "Offices", icon: <Globe className="w-5 h-5" />, color: "from-orange-500 to-red-600" },
        { id: "departments", label: "Departments", icon: <Layers className="w-5 h-5" />, color: "from-emerald-500 to-teal-600" },
        { id: "designations", label: "Designations", icon: <Shapes className="w-5 h-5" />, color: "from-purple-500 to-fuchsia-600" },
    ];

    const stats = [
        { label: "Entities", count: organizations?.length || 0, color: "indigo", icon: Building2 },
        { label: "Locations", count: officeLocations?.length || 0, color: "orange", icon: MapPin },
        { label: "Business Units", count: departments?.length || 0, color: "emerald", icon: UserRoundCog },
        { label: "Roles", count: designations?.length || 0, color: "purple", icon: Briefcase },
    ];

    const isLoading = orgsLoading || officesLoading || deptsLoading || desigsLoading;

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse font-medium">Synchronizing Ecosystem Data...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-32">
            {/* Executive Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Organization Control</h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">Coordinate your global infrastructure and intelligence hierarchy.</p>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 hover:scale-105 transition-all duration-500 overflow-hidden relative">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-50 rounded-full group-hover:scale-110 transition-transform`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-500 opacity-60`} />
                            </div>
                            <h3 className={`text-4xl font-black text-${stat.color}-600 tracking-tighter`}>{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Smart Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <OrganizationTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <button
                    onClick={() => {
                        if (activeTab === "organizations") openForm("organization");
                        if (activeTab === "offices") openForm("office");
                        if (activeTab === "departments") openForm("department");
                        if (activeTab === "designations") openForm("designation");
                    }}
                    className={`flex items-center space-x-2 px-8 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black hover:scale-105 transition-all shadow-xl shadow-black/10 font-bold text-sm tracking-tight`}
                >
                    <Plus className="w-5 h-5" />
                    <span>Add {activeTab.slice(0, -1)}</span>
                </button>
            </div>

            {/* Dynamic Content Repository */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                {activeTab === "organizations" && (
                    <div className="space-y-8">
                        <OrganizationList
                            organizations={organizations || []}
                            onEdit={handleEditOrg}
                            onViewEmployees={handleViewEmployees}
                        />
                        <div ref={formRefs.organization} className="scroll-mt-24">
                            {activeForm === "organization" && (
                                <CreateOrganizationForm
                                    orgEditData={editingOrg}
                                    onCancel={closeForm}
                                    onSubmit={async () => closeForm()}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "offices" && (
                    <div className="space-y-8">
                        <OfficeLocationList
                            officeLocations={officeLocations ?? []}
                            onEdit={handleEditOffLoc}
                        />
                        <div ref={formRefs.office} className="scroll-mt-24">
                            {activeForm === "office" && (
                                <AddOfficeForm
                                    officeLocationEditData={editingOffLoc}
                                    onCancel={closeForm}
                                    onSubmit={async () => closeForm()}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "departments" && (
                    <div className="space-y-8">
                        <DepartmentList
                            departments={departments ?? []}
                            onEdit={handleEditDept}
                        />
                        <div ref={formRefs.department} className="scroll-mt-24">
                            {activeForm === "department" && (
                                <AddDepartmentForm
                                    departmentEditData={editingDept}
                                    onCancel={closeForm}
                                    onSubmit={async () => closeForm()}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "designations" && (
                    <div className="space-y-8">
                        <DesignationList
                            designations={designations ?? []}
                            onEdit={handleEditDesignation}
                        />
                        <div ref={formRefs.designation} className="scroll-mt-24">
                            {activeForm === "designation" && (
                                <AddDesignationForm
                                    designationEditData={editingDesig}
                                    onCancel={closeForm}
                                    onSubmit={async () => closeForm()}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
