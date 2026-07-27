"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import {
  GET_PAYROLL_RUNS,
  GET_SALARY_COMPONENTS,
  GET_SALARY_STRUCTURES,
} from "@/lib/graphql/payroll/queries";
import {
  INITIATE_PAYROLL_RUN,
  CREATE_SALARY_COMPONENT,
  CREATE_SALARY_STRUCTURE,
  DELETE_PAYROLL_RUN,
} from "@/lib/graphql/payroll/mutations";
import { toast } from "sonner";
import { Plus, Play, Settings, Users, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import moment from "moment";
import { cn } from "@/lib/utils";

export default function PayrollPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState("runs");

  const { data: runsData, loading: runsLoading, refetch: refetchRuns } = useQuery(
    GET_PAYROLL_RUNS,
    { skip: !!(user && user.role !== "admin") }
  ) as any;
  const {
    data: componentsData,
    loading: componentsLoading,
    refetch: refetchComponents,
  } = useQuery(GET_SALARY_COMPONENTS, {
    skip: !!(user && user.role !== "admin"),
  }) as any;
  const {
    data: structuresData,
    loading: structuresLoading,
    refetch: refetchStructures,
  } = useQuery(GET_SALARY_STRUCTURES, {
    skip: !!(user && user.role !== "admin"),
  }) as any;

  const [initiatePayroll] = useMutation(INITIATE_PAYROLL_RUN) as any;
  const [createSalaryComponent] = useMutation(CREATE_SALARY_COMPONENT) as any;
  const [deletePayrollRun] = useMutation(DELETE_PAYROLL_RUN) as any;

  const [compForm, setCompForm] = useState({
    name: "",
    code: "",
    component_type: "earning",
    is_taxable: true,
    is_statutory: false,
  });

  const [modalConfig, setModalConfig] = useState({ isOpen: false, runId: "" });

  if (user && user.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-base font-semibold text-foreground">Access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only admins can access payroll.
        </p>
        <Link href="/dashboard" className="mt-6">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  const payrollTabs = [
    { id: "runs", label: "Runs", icon: Play },
    { id: "components", label: "Components", icon: Settings },
    { id: "structures", label: "Structures", icon: Users },
  ];

  const handleCreateComponent = async () => {
    if (!compForm.name || !compForm.code) {
      toast.error("Name and code are required");
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
            description: "",
          },
        },
      });
      toast.success("Component created");
      setCompForm({
        name: "",
        code: "",
        component_type: "earning",
        is_taxable: true,
        is_statutory: false,
      });
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
      toast.success("Payroll run deleted");
      refetchRuns();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRunPayroll = async (month: number, year: number) => {
    try {
      await initiatePayroll({ variables: { month, year } });
      toast.success(`Payroll started for ${month}/${year}`);
      refetchRuns();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Payroll"
        description="Run payroll, manage salary components, and salary structures."
        actions={<GeneratePayrollDialog onConfirm={handleRunPayroll} />}
      />

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {payrollTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden" />

        <TabsContent value="runs" className="mt-0">
          <Card className="overflow-hidden p-0">
            <DataTable
              isLoading={runsLoading}
              data={runsData?.payrollRuns || []}
              columns={[
                {
                  key: "period",
                  label: "Period",
                  render: (_val, row: any) => (
                    <span className="font-medium text-foreground">
                      {moment().month(row.month - 1).format("MMMM")} {row.year}
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (val: any) => (
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize",
                        val === "completed"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {val}
                    </span>
                  ),
                },
                {
                  key: "totalNetPay",
                  label: "Net pay",
                  render: (val: any) => (
                    <span className="tabular-nums">₹{Number(val).toLocaleString()}</span>
                  ),
                },
                {
                  key: "createdAt",
                  label: "Created",
                  render: (val: any) => (
                    <span className="text-muted-foreground">
                      {new Date(val).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (_val: any, row: any) => (
                    <div className="flex items-center gap-1">
                      <Link href={`/payroll/${row.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRun(row.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-0">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Add component</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Wellness allowance"
                    value={compForm.name}
                    onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Code</label>
                  <input
                    className="input font-mono uppercase"
                    placeholder="WELL_ALW"
                    value={compForm.code}
                    onChange={(e) => setCompForm({ ...compForm, code: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="input"
                    value={compForm.component_type}
                    onChange={(e) =>
                      setCompForm({ ...compForm, component_type: e.target.value })
                    }
                  >
                    <option value="earning">Earning</option>
                    <option value="deduction">Deduction</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={compForm.is_taxable}
                      onChange={(e) =>
                        setCompForm({ ...compForm, is_taxable: e.target.checked })
                      }
                    />
                    Taxable
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={compForm.is_statutory}
                      onChange={(e) =>
                        setCompForm({ ...compForm, is_statutory: e.target.checked })
                      }
                    />
                    Statutory
                  </label>
                </div>
                <button onClick={handleCreateComponent} className="btn-primary w-full">
                  Create component
                </button>
              </div>
            </Card>
            <Card className="overflow-hidden p-0 lg:col-span-2">
              <DataTable
                isLoading={componentsLoading}
                data={componentsData?.salaryComponents || []}
                columns={[
                  {
                    key: "name",
                    label: "Name",
                    render: (val) => <span className="font-medium">{val}</span>,
                  },
                  {
                    key: "code",
                    label: "Code",
                    render: (val) => (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{val}</code>
                    ),
                  },
                  {
                    key: "componentType",
                    label: "Type",
                    render: (val: any) => (
                      <span
                        className={cn(
                          "text-xs font-medium capitalize",
                          val === "earning" ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
                        )}
                      >
                        {val}
                      </span>
                    ),
                  },
                  {
                    key: "isTaxable",
                    label: "Flags",
                    render: (_val: any, row: any) => (
                      <div className="flex flex-wrap gap-1">
                        {row.isTaxable && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                            Taxable
                          </span>
                        )}
                        {row.isStatutory && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
                            Statutory
                          </span>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="structures" className="mt-0">
          <div className="mb-4 flex justify-end">
            <NewStructureDialog
              components={componentsData?.salaryComponents || []}
              onSuccess={() => refetchStructures()}
            />
          </div>
          {structuresLoading ? (
            <div className="flex min-h-[20vh] items-center justify-center text-sm text-muted-foreground">
              Loading structures…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {structuresData?.salaryStructures?.map((struct: any) => (
                <Card key={struct.id}>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{struct.name}</h3>
                      <p className="text-xs text-muted-foreground">Salary structure</p>
                    </div>
                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {struct.description || "No description"}
                  </p>
                  <div className="space-y-2 border-t border-border pt-3">
                    {struct.components.map((sc: any) => (
                      <div
                        key={sc.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {sc.component.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{sc.calculationType}</p>
                        </div>
                        <span className="shrink-0 tabular-nums text-foreground">
                          {sc.calculationType === "percentage"
                            ? `${sc.value}%`
                            : `₹${Number(sc.value).toLocaleString()}`}
                          {sc.baseComponent && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              of {sc.baseComponent.code}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={confirmDeleteRun}
        variant="destructive"
        title="Delete payroll run?"
        description="This permanently deletes payslips for this period. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

function GeneratePayrollDialog({
  onConfirm,
}: {
  onConfirm: (month: number, year: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [month, setMonth] = useState((today.getMonth() + 1).toString());
  const [year, setYear] = useState(today.getFullYear().toString());

  const years = Array.from({ length: 5 }, (_, i) =>
    (today.getFullYear() - 2 + i).toString()
  );
  const months = [
    { val: "1", label: "January" },
    { val: "2", label: "February" },
    { val: "3", label: "March" },
    { val: "4", label: "April" },
    { val: "5", label: "May" },
    { val: "6", label: "June" },
    { val: "7", label: "July" },
    { val: "8", label: "August" },
    { val: "9", label: "September" },
    { val: "10", label: "October" },
    { val: "11", label: "November" },
    { val: "12", label: "December" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Play className="h-4 w-4" />
          Generate payroll
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate payroll</DialogTitle>
          <DialogDescription>Choose the pay period to process.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Month</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.val} value={m.val}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onConfirm(parseInt(month), parseInt(year));
              setOpen(false);
            }}
            className="w-full sm:w-auto"
          >
            Start run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewStructureDialog({
  components,
  onSuccess,
}: {
  components: any[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedComponents, setSelectedComponents] = useState<any[]>([]);
  const [createStructure, { loading }] = useMutation(CREATE_SALARY_STRUCTURE) as any;

  const addComponentRow = () => {
    setSelectedComponents([
      ...selectedComponents,
      {
        component_id: "",
        calculation_type: "flat",
        value: 0,
        base_component_id: null,
      },
    ]);
  };

  const removeComponentRow = (index: number) => {
    const next = [...selectedComponents];
    next.splice(index, 1);
    setSelectedComponents(next);
  };

  const updateRow = (index: number, updates: any) => {
    const next = [...selectedComponents];
    next[index] = { ...next[index], ...updates };
    setSelectedComponents(next);
  };

  const handleCreate = async () => {
    if (!name) return toast.error("Structure name is required");
    if (selectedComponents.length === 0) return toast.error("Add at least one component");

    try {
      await createStructure({
        variables: {
          name,
          description,
          components: selectedComponents.map((c) => ({
            componentId: c.component_id,
            calculationType: c.calculation_type,
            value: parseFloat(c.value),
            baseComponentId: c.base_component_id || null,
          })),
        },
      });
      toast.success("Salary structure created");
      setOpen(false);
      onSuccess();
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
        <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create structure
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create salary structure</DialogTitle>
          <DialogDescription>Define components and how each is calculated.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <input
                className="input"
                placeholder="e.g. Standard structure"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <input
                className="input"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold">Components</h4>
              <Button onClick={addComponentRow} variant="outline" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add component
              </Button>
            </div>

            <div className="space-y-2">
              {selectedComponents.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 items-end gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-12"
                >
                  <div className="space-y-1 sm:col-span-4">
                    <label className="text-xs text-muted-foreground">Component</label>
                    <Select
                      value={row.component_id}
                      onValueChange={(val) => updateRow(idx, { component_id: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {components.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Mode</label>
                    <Select
                      value={row.calculation_type}
                      onValueChange={(val) => updateRow(idx, { calculation_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-muted-foreground">
                      {row.calculation_type === "percentage" ? "Rate (%)" : "Amount (₹)"}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={row.value}
                      onChange={(e) => updateRow(idx, { value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs text-muted-foreground">Base</label>
                    <Select
                      value={row.base_component_id || "none"}
                      onValueChange={(val) =>
                        updateRow(idx, { base_component_id: val === "none" ? null : val })
                      }
                      disabled={row.calculation_type !== "percentage"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="CTC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Cost to company (CTC)</SelectItem>
                        {components.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeComponentRow(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {selectedComponents.length === 0 && (
                <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No components added yet
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Saving…" : "Create structure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
