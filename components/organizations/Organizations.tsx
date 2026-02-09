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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";

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

    const topRefs = useRef<HTMLDivElement>(null);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse font-medium">Synchronizing Ecosystem Data...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
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
                    { label: "Organizations", val: organizations?.length, icon: Building2, color: "primary", bg: "bg-primary/10", text: "text-primary" },
                    { label: "Office Locations", val: officeLocations?.length, icon: MapPin, color: "orange", bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
                    { label: "Departments", val: departments?.length, icon: UserRoundCog, color: "yellow", bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400" },
                    { label: "Designations", val: designations?.length, icon: Briefcase, color: "blue", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
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


            <div className="space-y-6">
                <Tabs defaultValue="organizations" className="w-full">
                    <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border inline-flex h-auto w-auto mb-8">
                        <TabsTrigger value="organizations" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all">
                            Organizations
                        </TabsTrigger>
                        <TabsTrigger value="offices" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all">
                            Offices
                        </TabsTrigger>
                        <TabsTrigger value="departments" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all">
                            Departments
                        </TabsTrigger>
                        <TabsTrigger value="designations" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all">
                            Designations
                        </TabsTrigger>
                    </TabsList>


                    {/* ORGANIZATIONS */}
                    <TabsContent value="organizations">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between" ref={topRefs.organization}>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-foreground tracking-tight">Active Entities</h2>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Repository</p>
                                </div>
                                <button
                                    onClick={() => openForm("organization")}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:opacity-90 hover:scale-105 transition-all duration-500 shadow-xl shadow-primary/20"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Entity</span>
                                </button>
                            </div>


                            <OrganizationList
                                organizations={organizations || []}
                                onEdit={handleEditOrg}
                                onViewEmployees={handleViewEmployees}
                            />

                            <div ref={formRefs.organization} className="mt-6 scroll-mt-24">
                                {activeForm === "organization" && (
                                    <CreateOrganizationForm
                                        orgEditData={editingOrg}
                                        onCancel={closeForm}
                                        onSubmit={async () => {
                                            closeForm();
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* OFFICES */}
                    <TabsContent value="offices">
                        <div className="bg-gray-50/50 rounded-3xl">
                            <div ref={topRefs.office} className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">All Offices</h2>
                                <Button onClick={() => openForm("office")} className="bg-indigo-600 text-white">
                                    <Plus className="w-5 h-5 mr-2" /> Add Office
                                </Button>
                            </div>

                            <OfficeLocationList
                                officeLocations={officeLocations ?? []}
                                onEdit={handleEditOffLoc}
                            />


                            <div ref={formRefs.office} className="mt-6 scroll-mt-24">
                                {activeForm === "office" && <AddOfficeForm officeLocationEditData={editingOffLoc} onCancel={closeForm} onSubmit={async () => closeForm()} />}
                            </div>
                        </div>
                    </TabsContent>

                    {/* DEPARTMENTS */}
                    <TabsContent value="departments">
                        <div className="bg-gray-50/50 rounded-3xl">
                            <div ref={topRefs.department} className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">All Departments</h2>
                                <Button onClick={() => openForm("department")} className="bg-indigo-600 text-white">
                                    <Plus className="w-5 h-5 mr-2" /> Add Department
                                </Button>
                            </div>

                            <DepartmentList
                                departments={departments ?? []}
                                onEdit={handleEditDept}
                            />

                            <div ref={formRefs.department} className="mt-6 scroll-mt-24">
                                {activeForm === "department" && (
                                    <AddDepartmentForm departmentEditData={editingDept} onCancel={closeForm} onSubmit={async () => closeForm()} />
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* DESIGNATIONS */}
                    <TabsContent value="designations">
                        <div className="bg-gray-50/50 rounded-3xl">
                            <div ref={topRefs.designation} className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">All Designations</h2>
                                <Button onClick={() => openForm("designation")} className="bg-indigo-600 text-white">
                                    <Plus className="w-5 h-5 mr-2" /> Add Designation
                                </Button>
                            </div>

                            <DesignationList
                                designations={designations ?? []}
                                onEdit={handleEditDesignation}
                            />

                            <div ref={formRefs.designation} className="mt-6 scroll-mt-24">
                                {activeForm === "designation" && (
                                    <AddDesignationForm designationEditData={editingDesig} onCancel={closeForm} onSubmit={async () => closeForm()} />
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div >

            {/* Smart Navigation */}
            < div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" >
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
            </div >

            {/* Dynamic Content Repository */}
            < div className="animate-in fade-in slide-in-from-bottom-6 duration-700" >
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
                )
                }

                {
                    activeTab === "offices" && (
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
                    )
                }

                {
                    activeTab === "departments" && (
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
                    )
                }

                {
                    activeTab === "designations" && (
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
                    )
                }
            </div >
        </div >
    );
}
