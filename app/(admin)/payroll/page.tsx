"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { GET_PAYROLL_RUNS, GET_SALARY_COMPONENTS, GET_SALARY_STRUCTURES } from "@/lib/graphql/payroll/queries";
import { INITIATE_PAYROLL_RUN, CREATE_SALARY_COMPONENT, CREATE_SALARY_STRUCTURE, DELETE_PAYROLL_RUN } from "@/lib/graphql/payroll/mutations";
import { toast } from "sonner";
import { Plus, Play, FileText, Settings, Users, Sparkles, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import moment from "moment";

export default function PayrollPage() {
    const { user } = useStore();
    const [activeTab, setActiveTab] = useState("runs");

    if (user && user.role !== 'admin') {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-premium-h1 text-rose-500">Access Restricted</h1>
                <p className="text-muted-foreground font-medium italic text-center">You do not have administrative privileges to access the Payroll Machine.<br />This module is restricted to the Admin role.</p>
                <Link href="/dashboard">
                    <Button className="btn-primary mt-6 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px]">Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    // Queries
    const { data: runsData, loading: runsLoading, refetch: refetchRuns } = useQuery(GET_PAYROLL_RUNS) as any;
    const { data: componentsData, loading: componentsLoading, refetch: refetchComponents } = useQuery(GET_SALARY_COMPONENTS) as any;
    const { data: structuresData, loading: structuresLoading, refetch: refetchStructures } = useQuery(GET_SALARY_STRUCTURES) as any;

    // Mutations
    const [initiatePayroll] = useMutation(INITIATE_PAYROLL_RUN) as any;
    const [createSalaryComponent] = useMutation(CREATE_SALARY_COMPONENT) as any;
    const [deletePayrollRun] = useMutation(DELETE_PAYROLL_RUN) as any;

    // Component Form State
    const [compForm, setCompForm] = useState({
        name: "",
        code: "",
        component_type: "earning",
        is_taxable: true,
        is_statutory: false
    });

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        runId: ""
    });

    const payrollTabs = [
        { id: "runs", label: "Active Runs", icon: <Play className="w-5 h-5" />, color: "from-primary to-primary/80" },
        { id: "components", label: "Component Vault", icon: <Settings className="w-5 h-5" />, color: "from-blue-500 to-blue-400" },
        { id: "structures", label: "System Structures", icon: <Users className="w-5 h-5" />, color: "from-purple-500 to-purple-400" },
    ];

    const handleCreateComponent = async () => {
        if (!compForm.name || !compForm.code) {
            toast.error("Name and Code are required");
            return;
        }
        try {
            await createSalaryComponent({
                variables: {
                    data: {
                        name: compForm.name,
                        code: compForm.code,
                        componentType: compForm.component_type,
                        isTaxable: compForm.is_taxable,
                        isStatutory: compForm.is_statutory,
                        description: ""
                    }
                }
            });
            toast.success("Component created successfully");
            setCompForm({ name: "", code: "", component_type: "earning", is_taxable: true, is_statutory: false });
            refetchComponents();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteRun = async (id: string) => {
        setModalConfig({ isOpen: true, runId: id });
    };

    const confirmDeleteRun = async () => {
        const id = modalConfig.runId;
        try {
            await deletePayrollRun({ variables: { payrollRunId: id } });
            toast.success("Payroll run discarded");
            refetchRuns();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleRunPayroll = async (month: number, year: number) => {
        try {
            await initiatePayroll({ variables: { month, year } });
            toast.success(`Payroll initiated for ${month}/${year}`);
            refetchRuns();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-10 pl-5">
                <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full shadow-sm shadow-primary/20" />
                    <h2 className="text-premium-h2 leading-none">Payroll Machine</h2>
                    <p className="text-premium-label mt-2 opacity-60">Architect your organizational compensation matrix.</p>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="p-2 rounded-[1.5rem] border border-border inline-flex space-x-1 overflow-x-auto bg-muted/40 backdrop-blur-md mb-8">
                    {payrollTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-3.5 rounded-2xl text-premium-label transition-all duration-500 flex items-center space-x-3 whitespace-nowrap active:scale-95 ${activeTab === tab.id
                                ? `bg-primary text-white shadow-2xl shadow-primary/20 -translate-y-1 font-bold`
                                : "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-lg hover:shadow-primary/5"
                                }`}
                        >
                            <span className="group-hover:scale-110 transition-transform">{tab.icon}</span>
                            <span className="tracking-widest uppercase">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <button className="p-4 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-2xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 group">
                        <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Audit Records
                    </button>
                    <GeneratePayrollDialog onConfirm={handleRunPayroll} />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* We can hide the default TabsList since we are using our custom triggers */}
                <TabsList className="hidden" />

                {/* Runs Tab Content */}
                <TabsContent value="runs" className="animate-slide-up">
                    <Card className="premium-card overflow-hidden p-0 border border-border/50 bg-card/50 backdrop-blur-sm">
                        <DataTable
                            isLoading={runsLoading}
                            data={runsData?.payrollRuns || []}
                            columns={[
                                {
                                    key: "period",
                                    label: "Cycle Reference",
                                    render: (_val, row: any) => (
                                        <div className="font-black text-foreground">
                                            {moment().month(row.month - 1).format("MMMM")}-{moment().year(row.year).format("YY")}
                                        </div>
                                    )
                                },
                                {
                                    key: "status",
                                    label: "Current State",
                                    render: (val: any) => (
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${val === 'completed'
                                            ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-100/50 text-amber-700 border-amber-200'
                                            }`}>
                                            {val}
                                        </span>
                                    )
                                },
                                {
                                    key: "totalNetPay",
                                    label: "Liquidity Total",
                                    render: (val: any) => <span className="font-black italic">₹{Number(val).toLocaleString()}</span>
                                },
                                {
                                    key: "createdAt",
                                    label: "Process Timestamp",
                                    render: (val: any) => <span className="text-muted-foreground font-medium">{new Date(val).toLocaleDateString()}</span>
                                },
                                {
                                    key: "actions",
                                    label: "Audit",
                                    render: (_val: any, row: any) => (
                                        <div className="flex gap-2">
                                            <Link href={`/payroll/${row.id}`}>
                                                <Button variant="default" size="sm" className="font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary">
                                                    Analyze Run
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteRun(row.id)}
                                                className="font-black text-[10px] uppercase tracking-widest text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </TabsContent>

                {/* Components Tab Content */}
                <TabsContent value="components" className="animate-slide-up">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <Card className="premium-card lg:col-span-1 border-primary/20 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                            <h3 className="text-premium-h2 mb-6 flex items-center gap-2">
                                Structural Creation
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-premium-label block">Structural Name</label>
                                    <input
                                        className="input bg-muted/20 border-border/50 focus:border-primary/30 transition-all h-12"
                                        placeholder="e.g. Wellness Allowance"
                                        value={compForm.name}
                                        onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-premium-label block">Unique Identifier (Code)</label>
                                    <input
                                        className="input bg-muted/20 border-border/50 focus:border-primary/30 transition-all font-mono h-12 uppercase"
                                        placeholder="WELL_ALW"
                                        value={compForm.code}
                                        onChange={(e) => setCompForm({ ...compForm, code: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-premium-label block">Component Classification</label>
                                    <select
                                        className="input bg-muted/20 border-border/50 focus:border-primary/30 transition-all h-12"
                                        value={compForm.component_type}
                                        onChange={(e) => setCompForm({ ...compForm, component_type: e.target.value })}
                                    >
                                        <option value="earning">Unified Earning</option>
                                        <option value="deduction">Structural Deduction</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/20"
                                            checked={compForm.is_taxable}
                                            onChange={(e) => setCompForm({ ...compForm, is_taxable: e.target.checked })}
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Taxable</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/20"
                                            checked={compForm.is_statutory}
                                            onChange={(e) => setCompForm({ ...compForm, is_statutory: e.target.checked })}
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Statutory</span>
                                    </label>
                                </div>
                                <button onClick={handleCreateComponent} className="btn-primary w-full mt-6 py-4 shadow-xl shadow-primary/20 italic font-black uppercase tracking-widest text-xs">
                                    Create Structural
                                </button>
                            </div>
                        </Card>
                        <Card className="premium-card lg:col-span-2 p-0 overflow-hidden border-border/50">
                            <DataTable
                                isLoading={componentsLoading}
                                data={componentsData?.salaryComponents || []}
                                columns={[
                                    { key: "name", label: "Structural Name", render: (val) => <span className="font-bold">{val}</span> },
                                    { key: "code", label: "Identifier", render: (val) => <code className="bg-primary/5 text-primary px-2 py-1 rounded-lg text-xs font-black">{val}</code> },
                                    {
                                        key: "componentType",
                                        label: "Class",
                                        render: (val: any) => (
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${val === 'earning' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {val}
                                            </span>
                                        )
                                    },
                                    {
                                        key: "isTaxable",
                                        label: "Regulatory State",
                                        render: (_val: any, row: any) => (
                                            <div className="flex gap-2">
                                                {row.isTaxable && <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter border border-border/50">Taxable</span>}
                                                {row.isStatutory && <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter border border-primary/20">Statutory</span>}
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        </Card>
                    </div>
                </TabsContent>

                {/* Structures Tab Content */}
                <TabsContent value="structures" className="animate-slide-up">
                    <div className="flex justify-end mb-8">
                        <NewStructureDialog
                            components={componentsData?.salaryComponents || []}
                            onSuccess={() => refetchStructures()}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {structuresData?.salaryStructures?.map((struct: any) => (
                            <Card key={struct.id} className="premium-card bg-card/40 border-border/50 group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tight">{struct.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Institutional Blueprint</p>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100/50 text-emerald-700 text-[9px] font-black rounded-lg border border-emerald-200 uppercase tracking-widest">Active</span>
                                </div>
                                <p className="text-muted-foreground text-xs leading-relaxed mb-8 opacity-80">{struct.description || "Synthesizing organizational compensation logic without descriptive metadata."}</p>
                                <div className="space-y-4">
                                    {struct.components.map((sc: any) => (
                                        <div key={sc.id} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0 border-dashed">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{sc.component.name}</span>
                                                <span className="text-[8px] font-bold text-primary/70">{sc.calculationType}</span>
                                            </div>
                                            <span className="font-black italic text-sm tabular-nums">
                                                {sc.calculationType === 'percentage' ? `${sc.value}%` : `₹${Number(sc.value).toLocaleString()}`}
                                                {sc.baseComponent && <span className="text-[8px] ml-1 opacity-50 font-normal">of {sc.baseComponent.code}</span>}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10 pt-6 border-t border-border/30">
                                    <Button variant="default" className="w-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary/5 hover:text-primary transition-all">
                                        Modify Configuration
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={confirmDeleteRun}
                variant="destructive"
                title="Discard Payroll Matrix?"
                description="This will permanently delete all generated payslips and computation snapshots for this period. This action cannot be undone."
                confirmText="Execute Deletion"
                cancelText="Keep Records"
            />
        </div>
    );
}

function GeneratePayrollDialog({ onConfirm }: { onConfirm: (month: number, year: number) => void }) {
    const [open, setOpen] = useState(false);
    const today = new Date();
    const [month, setMonth] = useState((today.getMonth() + 1).toString());
    const [year, setYear] = useState(today.getFullYear().toString());

    const years = Array.from({ length: 5 }, (_, i) => (today.getFullYear() - 2 + i).toString());
    const months = [
        { val: "1", label: "January" }, { val: "2", label: "February" }, { val: "3", label: "March" },
        { val: "4", label: "April" }, { val: "5", label: "May" }, { val: "6", label: "June" },
        { val: "7", label: "July" }, { val: "8", label: "August" }, { val: "9", label: "September" },
        { val: "10", label: "October" }, { val: "11", label: "November" }, { val: "12", label: "December" }
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Generate Payroll
                </button>
            </DialogTrigger>
            <DialogContent className="premium-card border-border/50 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-premium-h2 italic tracking-tighter">Initiate Payroll Run</DialogTitle>
                    <p className="text-muted-foreground text-sm font-medium">Select the target period for organizational disbursement.</p>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-8">
                    <div className="space-y-2">
                        <label className="text-premium-label">Target Month</label>
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="h-12 rounded-2xl bg-muted/20">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl border-border">
                                {months.map(m => (
                                    <SelectItem key={m.val} value={m.val} className="rounded-lg">{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-premium-label">Target Year</label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="h-12 rounded-2xl bg-muted/20">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl border-border">
                                {years.map(y => (
                                    <SelectItem key={y} value={y} className="rounded-lg">{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => { onConfirm(parseInt(month), parseInt(year)); setOpen(false); }} className="btn-primary w-full py-6 italic font-black uppercase tracking-widest">
                        Execute Computation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function NewStructureDialog({ components, onSuccess }: { components: any[], onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedComponents, setSelectedComponents] = useState<any[]>([]);

    const [createStructure, { loading }] = useMutation(CREATE_SALARY_STRUCTURE) as any;

    const addComponentRow = () => {
        setSelectedComponents([...selectedComponents, {
            component_id: "",
            calculation_type: "flat",
            value: 0,
            base_component_id: null
        }]);
    };

    const removeComponentRow = (index: number) => {
        const newComps = [...selectedComponents];
        newComps.splice(index, 1);
        setSelectedComponents(newComps);
    };

    const updateRow = (index: number, updates: any) => {
        const newComps = [...selectedComponents];
        newComps[index] = { ...newComps[index], ...updates };
        setSelectedComponents(newComps);
    };

    const handleCreate = async () => {
        if (!name) return toast.error("Structure name is required");
        if (selectedComponents.length === 0) return toast.error("Add at least one component");

        try {
            await createStructure({
                variables: {
                    name,
                    description,
                    components: selectedComponents.map(c => ({
                        componentId: c.component_id,
                        calculationType: c.calculation_type,
                        value: parseFloat(c.value),
                        baseComponentId: c.base_component_id || null
                    }))
                }
            });
            toast.success("Salary Structure synthesized");
            setOpen(false);
            onSuccess();
            // Reset
            setName("");
            setDescription("");
            setSelectedComponents([]);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="btn-primary px-8 text-xs font-black uppercase tracking-widest">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Structure
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto premium-card border-border/50">
                <DialogHeader>
                    <DialogTitle className="text-premium-h2 italic tracking-tighter">Blueprint Synthesis</DialogTitle>
                    <p className="text-muted-foreground text-sm font-medium">Configure the core logic for institutional compensation.</p>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-premium-label">Structure Title</label>
                            <input
                                className="input h-12"
                                placeholder="e.g. Standard Executive Tier"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-premium-label">Abstract Description</label>
                            <input
                                className="input h-12"
                                placeholder="Compensation logic for specific roles..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Component Configuration</h4>
                            <Button onClick={addComponentRow} variant="outline" size="sm" className="rounded-xl border-dashed border-primary/30 text-primary hover:bg-primary/5">
                                <Plus className="w-3 h-3 mr-2" />
                                Add Dimension
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {selectedComponents.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-muted/20 p-4 rounded-2xl border border-border/30 group animate-in slide-in-from-right-4 duration-300">
                                    <div className="col-span-4 space-y-2">
                                        <label className="text-[8px] font-black uppercase opacity-50">Select Component</label>
                                        <Select
                                            value={row.component_id}
                                            onValueChange={(val) => updateRow(idx, { component_id: val })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl bg-background shadow-xs">
                                                <SelectValue placeholder="Attribute" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-2xl border-border bg-card/95 backdrop-blur-md">
                                                {components.map(c => (
                                                    <SelectItem key={c.id} value={c.id} className="rounded-lg text-xs font-medium m-1">{c.name} ({c.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[8px] font-black uppercase opacity-50">Mode</label>
                                        <Select
                                            value={row.calculation_type}
                                            onValueChange={(val) => updateRow(idx, { calculation_type: val })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl bg-background shadow-xs">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-2xl border-border bg-card/95 backdrop-blur-md">
                                                <SelectItem value="flat" className="rounded-lg text-xs font-medium m-1">Direct Amount</SelectItem>
                                                <SelectItem value="percentage" className="rounded-lg text-xs font-medium m-1">Relative %</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[8px] font-black uppercase opacity-50">{row.calculation_type === 'percentage' ? 'Rate (%)' : 'Value (₹)'}</label>
                                        <input
                                            type="number"
                                            className="input h-10 bg-background rounded-xl p-3 text-xs"
                                            value={row.value}
                                            onChange={(e) => updateRow(idx, { value: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-span-3 space-y-2">
                                        <label className="text-[8px] font-black uppercase opacity-50">Base Anchor</label>
                                        <Select
                                            value={row.base_component_id || "none"}
                                            onValueChange={(val) => updateRow(idx, { base_component_id: val === "none" ? null : val })}
                                            disabled={row.calculation_type !== 'percentage'}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl bg-background shadow-xs disabled:opacity-30">
                                                <SelectValue placeholder="Cost to Company (CTC)" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-2xl border-border bg-card/95 backdrop-blur-md">
                                                <SelectItem value="none" className="rounded-lg text-xs font-medium m-1 italic opacity-50 text-primary font-bold">Cost to Company (CTC)</SelectItem>
                                                {components.map(c => (
                                                    <SelectItem key={c.id} value={c.id} className="rounded-lg text-xs font-medium m-1">{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-rose-500 hover:bg-rose-50 rounded-xl"
                                            onClick={() => removeComponentRow(idx)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {selectedComponents.length === 0 && (
                                <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/5">
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50 italic">No Dimensional Attributes Added</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-4 pt-6 border-t border-border/50">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest">Cancel</Button>
                    <Button onClick={handleCreate} disabled={loading} className="btn-primary rounded-2xl px-12 font-black italic shadow-xl shadow-primary/20">
                        {loading ? "Synthesizing..." : "Finalize Blueprint"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
