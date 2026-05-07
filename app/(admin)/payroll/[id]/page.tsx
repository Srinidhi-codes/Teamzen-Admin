"use client";

import React, { use } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_PAYROLL_RUN_DETAILS } from "@/lib/graphql/payroll/queries";
import { ArrowLeft, CheckCircle, Clock, Download, DollarSign, Settings2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { PayrollAdjustmentModal } from "@/components/payroll/PayrollAdjustmentModal";
import { INITIATE_PAYROLL_RUN, PUBLISH_PAYSLIPS, EXECUTE_PAYROLL_PAYOUT } from "@/lib/graphql/payroll/mutations";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { DataTable } from "@/components/admin/DataTable";
import { useStore } from "@/lib/store/useStore";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PayrollRunDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useStore();
    
    if (user && user.role !== 'admin') {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
                 <h1 className="text-premium-h1 text-rose-500">Access Restricted</h1>
                 <p className="text-muted-foreground font-medium italic text-center">You do not have administrative privileges to access the Payroll Machine.<br/>This module is restricted to the Admin role.</p>
                 <Link href="/dashboard">
                    <Button className="btn-primary mt-6 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px]">Return to Dashboard</Button>
                 </Link>
            </div>
        );
    }

    const { data, loading, error, refetch } = useQuery(GET_PAYROLL_RUN_DETAILS, {
        variables: { id },
        fetchPolicy: "network-only"
    }) as any;

    const [publishPayslips, { loading: publishing }] = useMutation(PUBLISH_PAYSLIPS);
    const [executePayout, { loading: paying }] = useMutation<{ executePayrollPayout: number }>(EXECUTE_PAYROLL_PAYOUT);
    const [recalculatePayroll, { loading: recalculating }] = useMutation(INITIATE_PAYROLL_RUN);

    const [selectedUser, setSelectedUser] = React.useState<any>(null);

    const run = data?.payrollRun;

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase tracking-[0.2em]">Synthesizing Ledger Data...</div>;
    if (error) return <div className="p-8 text-center text-destructive bg-destructive/10 rounded-2xl m-8 border border-destructive/20 font-bold">Error: {error.message}</div>;
    if (!run) return (
        <div className="p-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-4">
                <Clock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black italic">Payroll Run Not Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">The requested computational cycle (ID: {id}) could not be located in the neural matrix.</p>
            <Link href="/payroll">
                <Button variant="outline" className="mt-4 font-black uppercase tracking-widest text-xs">Return to Runs</Button>
            </Link>
        </div>
    );



    const handlePublish = async () => {
        try {
            await publishPayslips({ variables: { payrollRunId: id } });
            toast.success("Payslips published successfully");
            refetch();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleRecalculate = async () => {
        try {
            await recalculatePayroll({ variables: { month: run.month, year: run.year } });
            toast.success("Payroll values recalculated with adjustments");
            refetch();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleProcessPayouts = async () => {
        try {
            const res = await executePayout({ variables: { payrollRunId: id } });
            toast.success(`Processed payouts for ${res.data?.executePayrollPayout ?? 0} employees via Razorpay.`);
            refetch();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link href="/payroll">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-premium-h1">Payroll Run - {monthNames[run.month - 1]} {run.year}</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Detailed breakdown of disbursements and deductions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="premium-card p-6 bg-card">
                    <p className="text-premium-label mb-2">Total Liquidity Required</p>
                    <p className="text-3xl font-black italic text-primary">₹{Number(run.totalNetPay).toLocaleString()}</p>
                </Card>
                <Card className="premium-card p-6 bg-card">
                    <p className="text-premium-label mb-2">Gross Aggregate</p>
                    <p className="text-2xl font-black italic">₹{Number(run.totalGross).toLocaleString()}</p>
                </Card>
                <Card className="premium-card p-6 bg-card">
                    <p className="text-premium-label mb-2">Statutory & Deductions</p>
                    <p className="text-2xl font-black italic text-destructive">₹{Number(run.totalDeduction).toLocaleString()}</p>
                </Card>
                <Card className="premium-card p-6 bg-card flex flex-col justify-center items-start">
                    <p className="text-premium-label mb-2">Cycle Status</p>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${run.status === 'completed' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' : 'bg-amber-100/50 text-amber-700 border-amber-200'
                        }`}>
                        {run.status}
                    </div>
                </Card>
            </div>

            <div className="flex gap-4">
                <Button onClick={handlePublish} disabled={publishing || run.status !== 'completed'} className="btn-secondary px-6 gap-2">
                    <CheckCircle className="w-4 h-4" /> {publishing ? "Publishing..." : "Publish Payslips"}
                </Button>
                <Button onClick={handleProcessPayouts} disabled={paying || run.status !== 'completed'} className="btn-primary px-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20">
                    <DollarSign className="w-4 h-4" /> {paying ? "Processing..." : "Process Payouts (Razorpay)"}
                </Button>
                <Button
                    onClick={handleRecalculate}
                    disabled={recalculating || run.status === 'published' || run.status === 'paid'}
                    variant="outline"
                    className="premium-card bg-card font-black text-[10px] uppercase tracking-widest gap-2"
                >
                    <RefreshCcw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} /> Recalculate
                </Button>
            </div>

            <Card className="premium-card p-0 overflow-hidden">
                <DataTable
                    isLoading={false}
                    data={run.payslips || []}
                    columns={[
                        {
                            key: "user",
                            label: "Employee",
                            render: (_val, row: any) => (
                                <div>
                                    <p className="font-bold">{row.user?.firstName ?? "Unknown"} {row.user?.lastName ?? "User"}</p>
                                    <p className="text-[10px] text-muted-foreground">{row.user?.email ?? "No Email"}</p>
                                </div>
                            )
                        },
                        { key: "designation", label: "Role", render: (val) => <span className="text-xs font-medium">{val}</span> },
                        { key: "workedDays", label: "Attendance", render: (val, row: any) => <span className="text-xs font-medium">{val} Days (LOP: {row.lopDays})</span> },
                        { key: "grossEarnings", label: "Gross", render: (val) => <span className="font-bold">₹{Number(val).toLocaleString()}</span> },
                        { key: "totalDeductions", label: "Deductions", render: (val) => <span className="font-bold text-destructive">₹{Number(val).toLocaleString()}</span> },
                        { key: "netPay", label: "Net Payable", render: (val) => <span className="font-black italic text-primary">₹{Number(val).toLocaleString()}</span> },
                        {
                            key: "status",
                            label: "Status",
                            render: (val) => (
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${val === 'published' ? 'bg-blue-100 text-blue-700' :
                                    val === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {val}
                                </span>
                            )
                        },
                        {
                            key: "actions",
                            label: "Actions",
                            render: (_val: any, row: any) => (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary"
                                        onClick={() => {
                                            if (row.payslipPdf?.url) {
                                                window.open(row.payslipPdf.url, '_blank');
                                            } else {
                                                toast.error("PDF not generated yet. Publish payslips first.");
                                            }
                                        }}
                                    >
                                        <Download className="w-4 h-4 mr-2" /> PDF
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="font-black text-[10px] uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600"
                                        onClick={() => {
                                            if (row.user) {
                                                setSelectedUser(row.user);
                                            } else {
                                                toast.error("User data missing for this payslip");
                                            }
                                        }}
                                        disabled={run.status === 'published' || run.status === 'paid'}
                                    >
                                        <Settings2 className="w-4 h-4 mr-2" /> Adjust
                                    </Button>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>

            <PayrollAdjustmentModal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                month={run.month}
                year={run.year}
                onSuccess={() => {
                    toast.info("Adjustment saved. Click 'Recalculate' to apply changes.");
                }}
            />
        </div>
    );
}
