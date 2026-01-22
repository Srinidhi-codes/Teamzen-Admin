"use client";

import { useState, useRef, useEffect } from "react";
import { Briefcase, Building, Building2, LucideBuilding2, MapPin, Plus, UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { OfficeLocation, Organization, Department, Designation } from "@/lib/graphql/organization/types";
import OrganizationList from "./OrganizationList";
import CreateOrganizationForm from "./CreateOrganizationForm";
import { AddDepartmentForm, AddDesignationForm, AddOfficeForm } from "./OrganizationForms";
import OfficeLocationList from "./OfficeLocationList";
import DepartmentList from "./DepartmentsList";
import DesignationList from "./DesignationList";
import {
    useGraphQLActivateOrganizationMutation,
    useGraphQLDepartments,
    useGraphQLDesignations,
    useGraphQLOfficeLocations,
    useGraphQLOrganizations,
    useGraphQLSuspendOrganizationMutation,
} from "@/lib/graphql/organization/organizatioHook";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrganizationsPage() {
    type FormKey = "organization" | "office" | "department" | "designation" | null;

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

    const topRefs = {
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
        const currentTab = getActiveTab();
        setEditingOrg(null);
        setActiveForm(null);
        if (currentTab) {
            topRefs[currentTab]?.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    const getActiveTab = (): FormKey => {
        if (activeForm) return activeForm;
        return null;
    };

    useEffect(() => {
        if (activeForm && formRefs[activeForm].current) {
            formRefs[activeForm].current!.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [activeForm]);

    const { organizations } = useGraphQLOrganizations();
    const { officeLocations } = useGraphQLOfficeLocations();
    const { departments } = useGraphQLDepartments();
    const { designations } = useGraphQLDesignations();

    const { suspendOrganization } = useGraphQLSuspendOrganizationMutation();
    const { activateOrganization } = useGraphQLActivateOrganizationMutation();

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

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Organization Management
                    </h1>
                    <p className="text-gray-500 mt-1 text-lg">
                        Manage your company structure and departments
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex gap-5 bg-white rounded-lg shadow-sm p-6">
                    <div className="bg-indigo-100 p-5 rounded-lg">
                        <LucideBuilding2 className="text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-600">Organizations</div>
                        <div className="mt-2 text-3xl font-bold text-indigo-600">{organizations?.length}</div>
                    </div>
                </div>
                <div className="flex gap-5 bg-white rounded-lg shadow-sm p-6">
                    <div className="bg-orange-100 p-5 rounded-lg">
                        <MapPin className="text-orange-600" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-600">Office Locations</div>
                        <div className="mt-2 text-3xl font-bold text-orange-600">
                            {officeLocations?.length}
                        </div>
                    </div>
                </div>
                <div className="flex gap-5 bg-white rounded-lg shadow-sm p-6">
                    <div className="bg-yellow-100 p-5 rounded-lg">
                        <UserRoundCog className="text-yellow-600" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-600">Departments</div>
                        <div className="mt-2 text-3xl font-bold text-yellow-600">
                            {departments?.length}
                        </div>
                    </div>
                </div>
                <div className="flex gap-5 bg-white rounded-lg shadow-sm p-6">
                    <div className="bg-blue-100 p-5 rounded-lg">
                        <Briefcase className="text-blue-600" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-600">Designations</div>
                        <div className="mt-2 text-3xl font-bold text-blue-600">{designations?.length}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <Tabs defaultValue="organizations" className="w-full">
                    <TabsList className="w-full h-12">
                        <TabsTrigger value="organizations" className="data-[state=active]:text-indigo-500">
                            Organizations
                        </TabsTrigger>
                        <TabsTrigger value="offices" className="data-[state=active]:text-orange-500">
                            Offices
                        </TabsTrigger>
                        <TabsTrigger value="departments" className="data-[state=active]:text-yellow-500">
                            Departments
                        </TabsTrigger>
                        <TabsTrigger value="designations" className="data-[state=active]:text-blue-500">
                            Designations
                        </TabsTrigger>
                    </TabsList>

                    {/* ORGANIZATIONS */}
                    <TabsContent value="organizations">
                        <div className="bg-gray-50/50 rounded-3xl">
                            <div className="flex items-center justify-between mb-6" ref={topRefs.organization}>
                                <h2 className="text-xl font-bold text-gray-800">All Organizations</h2>
                                <Button
                                    onClick={() => openForm("organization")}
                                    className="flex items-center px-6 py-2.5 shadow bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Plus className="w-5 h-5 mr-2" /> Add Organization
                                </Button>
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
            </div>
        </div>
    );
}
