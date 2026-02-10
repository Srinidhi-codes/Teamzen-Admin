"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Building, Globe, Layers, Shapes, Building2, MapPin, UserRoundCog, Briefcase, UserPlus } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useStore } from "@/lib/store/useStore";

export default function OrganizationsPage() {
    type FormKey = "organization" | "office" | "department" | "designation" | null;

    const {
        setNavbarTabs,
        activeNavbarTab,
        setActiveNavbarTab,
        clearNavbarTabs
    } = useStore();

    const [activeForm, setActiveForm] = useState<FormKey>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [editingOffLoc, setEditingOffLoc] = useState<OfficeLocation | null>(null);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
    const router = useRouter();


    const openForm = (key: FormKey) => {
        setActiveForm(key);
    };

    const closeForm = () => {
        setActiveForm(null);
        setEditingOrg(null);
        setEditingOffLoc(null);
        setEditingDept(null);
        setEditingDesig(null);
    };


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

    const tabs = useMemo(() => [
        { id: "organizations", label: "Organizations", iconElement: <Building className="w-5 h-5" />, color: "from-indigo-500 to-blue-600" },
        { id: "offices", label: "Offices", iconElement: <Globe className="w-5 h-5" />, color: "from-orange-500 to-red-600" },
        { id: "departments", label: "Departments", iconElement: <Layers className="w-5 h-5" />, color: "from-emerald-500 to-teal-600" },
        { id: "designations", label: "Designations", iconElement: <Shapes className="w-5 h-5" />, color: "from-purple-500 to-fuchsia-600" },
    ], []);

    useEffect(() => {
        setNavbarTabs(tabs);
        if (!activeNavbarTab) {
            setActiveNavbarTab("organizations");
        }
        return () => clearNavbarTabs();
    }, [tabs, setNavbarTabs, setActiveNavbarTab, clearNavbarTabs]);

    const activeTab = activeNavbarTab || "organizations";

    const stats = [
        { label: "Entities", count: organizations?.length || 0, color: "indigo", icon: Building2 },
        { label: "Locations", count: officeLocations?.length || 0, color: "orange", icon: MapPin },
        { label: "Business Units", count: departments?.length || 0, color: "emerald", icon: UserRoundCog },
        { label: "Roles", count: designations?.length || 0, color: "purple", icon: Briefcase },
    ];

    const isLoading = orgsLoading || officesLoading || deptsLoading || desigsLoading;
    const activeTabColor = tabs.find(t => t.id === activeTab)?.color || "from-primary to-primary";


    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse font-medium">Synchronizing Ecosystem Data...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-32">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Organization Ecosystem</h1>
                    </div>
                    <p className="text-muted-foreground font-medium tracking-tight pl-13">Architecting the structural integrity of our global workspace.</p>
                </div>

            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Entities", val: organizations?.length, icon: Building2, color: "primary", bg: "bg-primary/10", text: "text-primary" },
                    { label: "Locations", val: officeLocations?.length, icon: MapPin, color: "orange", bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
                    { label: "Business Units", val: departments?.length, icon: UserRoundCog, color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Roles", val: designations?.length, icon: Briefcase, color: "purple", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
                ].map((stat, i) => (
                    <div key={i} className="group relative bg-card rounded-4xl p-6 border border-border hover:shadow-primary/5 shadow-xl shadow-border/5 overflow-hidden hover:scale-102 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity">
                            <stat.icon className="w-20 h-20 rotate-12" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center shadow-inner`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className={`text-3xl font-black tabular-nums tracking-tighter ${stat.text}`}>{stat.val || 0}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Smart Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" >
                {/* Tabs are now in Navbar, we only show action button here */}
                <div className="flex-1" />

                <button
                    onClick={() => {
                        if (activeTab === "organizations") openForm("organization");
                        if (activeTab === "offices") openForm("office");
                        if (activeTab === "departments") openForm("department");
                        if (activeTab === "designations") openForm("designation");
                    }}
                    className={`flex items-center space-x-3 px-8 py-4 bg-linear-to-r ${activeTabColor} text-white rounded-[1.5rem] hover:scale-105 transition-all shadow-2xl shadow-black/10 font-black text-[11px] uppercase tracking-[0.2em] active:scale-95`}
                >
                    <Plus className="w-5 h-5" />
                    <span>Deploy {activeTab === "offices" ? "Location" : activeTab === "organizations" ? "Entity" : activeTab.slice(0, -1)}</span>
                </button>
            </div >

            {/* Dynamic Content Repository */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700" >
                {activeTab === "organizations" && (
                    <OrganizationList
                        organizations={organizations || []}
                        onEdit={handleEditOrg}
                        onViewEmployees={handleViewEmployees}
                    />
                )}

                {activeTab === "offices" && (
                    <OfficeLocationList
                        officeLocations={officeLocations ?? []}
                        onEdit={handleEditOffLoc}
                    />
                )}

                {activeTab === "departments" && (
                    <DepartmentList
                        departments={departments ?? []}
                        onEdit={handleEditDept}
                    />
                )}

                {activeTab === "designations" && (
                    <DesignationList
                        designations={designations ?? []}
                        onEdit={handleEditDesignation}
                    />
                )}
            </div>

            {/* Unified Form Dialog */}
            <Dialog open={activeForm !== null} onOpenChange={(open) => !open && closeForm()}>
                <DialogContent className="sm:max-w-2xl rounded-4xl p-0 overflow-hidden border-none shadow-3xl">
                    <div className={`bg-linear-to-br border-b p-8 relative ${activeForm === "organization" ? "from-indigo-500/20" :
                        activeForm === "office" ? "from-orange-500/20" :
                            activeForm === "department" ? "from-emerald-500/20" :
                                "from-purple-500/20"
                        } via-background to-background`}>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            {activeForm === "organization" && <Building2 className="w-32 h-32 rotate-12" />}
                            {activeForm === "office" && <MapPin className="w-32 h-32 rotate-12" />}
                            {activeForm === "department" && <UserRoundCog className="w-32 h-32 rotate-12" />}
                            {activeForm === "designation" && <Briefcase className="w-32 h-32 rotate-12" />}
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black tracking-tight">
                                {activeForm === "organization" && (editingOrg ? "Refine Entity" : "Initialize Entity")}
                                {activeForm === "office" && (editingOffLoc ? "Update Location" : "Deploy Location")}
                                {activeForm === "department" && (editingDept ? "Update Department" : "New Business Unit")}
                                {activeForm === "designation" && (editingDesig ? "Update Designation" : "Classify Role")}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-semibold mt-1">
                                {activeForm === "organization" && "Architecting the core identity and fiscal parameters of the organization."}
                                {activeForm === "office" && "Configuring geospatial and temporal parameters for regional operations."}
                                {activeForm === "department" && "Defining functional boundaries and operational focus for this business unit."}
                                {activeForm === "designation" && "Mapping professional responsibilities and hierarchical classification."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 bg-background max-h-[75vh] overflow-y-auto">
                        {activeForm === "organization" && (
                            <CreateOrganizationForm
                                orgEditData={editingOrg}
                                onCancel={closeForm}
                                onSubmit={async () => closeForm()}
                            />
                        )}
                        {activeForm === "office" && (
                            <AddOfficeForm
                                officeLocationEditData={editingOffLoc}
                                onCancel={closeForm}
                                onSubmit={async () => closeForm()}
                            />
                        )}
                        {activeForm === "department" && (
                            <AddDepartmentForm
                                departmentEditData={editingDept}
                                onCancel={closeForm}
                                onSubmit={async () => closeForm()}
                            />
                        )}
                        {activeForm === "designation" && (
                            <AddDesignationForm
                                designationEditData={editingDesig}
                                onCancel={closeForm}
                                onSubmit={async () => closeForm()}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
