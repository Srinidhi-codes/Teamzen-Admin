"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import {
  FileSpreadsheet,
  Inbox,
  FileCheck,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import EmployeeRequestsPanel from "@/components/documents/EmployeeRequestsPanel";
import DocumentRequestsPanel from "@/components/documents/DocumentRequestsPanel";
import OrgIssuedDocumentsPanel from "@/components/documents/OrgIssuedDocumentsPanel";
import Form16Page from "@/components/form16/Form16Page";
import {
  ORGANIZATION_DOCUMENT_REQUESTS,
  ORG_EMPLOYEE_DOCUMENT_REQUESTS,
  ORG_ISSUED_DOCUMENTS,
} from "@/lib/graphql/documents/queries";
import { cn } from "@/lib/utils";

type HubTab = "emp_requests" | "requests" | "issued" | "form16";

export default function DocumentsPage() {
  const { user } = useStore();
  const isSuperadmin = user?.role === "superadmin";

  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    user?.organization?.id ? String(user.organization.id) : ""
  );

  // Sync default org if user loads late
  useEffect(() => {
    if (!selectedOrgId && user?.organization?.id && !isSuperadmin) {
      setSelectedOrgId(String(user.organization.id));
    }
  }, [user, isSuperadmin, selectedOrgId]);

  const [tab, setTab] = useState<HubTab>("emp_requests");

  // Fetch metrics across panels for the selected organization
  const { data: hrReqsData } = useQuery<any>(ORGANIZATION_DOCUMENT_REQUESTS, {
    variables: {
      organizationId: selectedOrgId || null,
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: empReqsData } = useQuery<any>(ORG_EMPLOYEE_DOCUMENT_REQUESTS, {
    variables: {
      organizationId: selectedOrgId || null,
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: issuedData } = useQuery<any>(ORG_ISSUED_DOCUMENTS, {
    variables: {
      organizationId: selectedOrgId || null,
    },
    fetchPolicy: "cache-and-network",
  });

  // Calculate live KPI metrics
  const empRequests: any[] = empReqsData?.orgEmployeeDocumentRequests || [];
  const hrRequests: any[] = hrReqsData?.organizationDocumentRequests || [];
  const issuedDocs: any[] = issuedData?.orgIssuedDocuments || [];

  const pendingEmpRequests = empRequests.filter(
    (r) => (r.status || "").toLowerCase() === "pending"
  ).length;

  const openHrRequirements = hrRequests.filter(
    (r) => (r.status || "").toLowerCase() === "open"
  ).length;

  const awaitingVerification = hrRequests.filter(
    (r) => (r.status || "").toLowerCase() === "fulfilled"
  ).length;

  const totalIssued = issuedDocs.length;

  const tabs = [
    {
      id: "emp_requests" as HubTab,
      label: "Employee Requests",
      icon: Inbox,
      count: pendingEmpRequests,
      badgeColor: "bg-amber-500 text-white",
      description: "Letters & certificates requested by employees",
    },
    {
      id: "requests" as HubTab,
      label: "Requested by HR",
      icon: Send,
      count: openHrRequirements,
      badgeColor: "bg-blue-500 text-white",
      description: "Compliance uploads requested from workforce",
    },
    {
      id: "issued" as HubTab,
      label: "Issued Library",
      icon: FileCheck,
      count: totalIssued,
      badgeColor: "bg-teal-500 text-white",
      description: "Published letters, agreements & Form 16s",
    },
    {
      id: "form16" as HubTab,
      label: "Form 16 Bulk Studio",
      icon: FileSpreadsheet,
      count: 0,
      badgeColor: "",
      description: "Match TRACES PDFs & publish to vaults",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header with Eyebrow, Title, Description, and Organization Filter */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-2 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-600 border border-teal-500/20 mb-2">
            Workforce Governance & Compliance
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            Documents Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Request official documentation from employees, fulfill letter requests, verify submitted records, and publish Form 16s to personal vaults.
          </p>
        </div>

        {/* Organization Filter Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-[220px]">
              <OrganizationFilterSelect
                value={selectedOrgId}
                onChange={setSelectedOrgId}
                placeholder="All Organizations"
                triggerClassName="h-8 text-xs border-0 bg-transparent shadow-none focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pending Employee Requests */}
        <button
          onClick={() => setTab("emp_requests")}
          className={cn(
            "text-left p-4 rounded-xl border transition-all duration-200 bg-card hover:shadow-md relative overflow-hidden group",
            tab === "emp_requests"
              ? "shadow-sm"
              : "border-border/70"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Employee Requests
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {pendingEmpRequests}
            </span>
            <span className="text-[11px] font-medium">
              awaiting action
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {empRequests.length} total submitted
          </p>
        </button>

        {/* Card 2: Open HR Requirements */}
        <button
          onClick={() => setTab("requests")}
          className={cn(
            "text-left p-4 rounded-xl border transition-all duration-200 bg-card hover:shadow-md relative overflow-hidden group",
            tab === "requests"
              ? "shadow-sm"
              : "border-border/70"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              HR Requirements
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {openHrRequirements}
            </span>
            <span className="text-[11px] font-medium">
              pending upload
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            Sent to employees
          </p>
        </button>

        {/* Card 3: Awaiting Verification */}
        <button
          onClick={() => setTab("requests")}
          className={cn(
            "text-left p-4 rounded-xl border transition-all duration-200 bg-card hover:shadow-md relative overflow-hidden group",
            tab === "requests"
              ? "shadow-sm"
              : "border-border/70"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Awaiting Verification
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {awaitingVerification}
            </span>
            <span className="text-[11px] font-medium">
              to review
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            Fulfilled by employees
          </p>
        </button>

        {/* Card 4: Issued Documents */}
        <button
          onClick={() => setTab("issued")}
          className={cn(
            "text-left p-4 rounded-xl border transition-all duration-200 bg-card hover:shadow-md relative overflow-hidden group",
            tab === "issued"
              ? "shadow-sm"
              : "border-border/70"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Issued Documents
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {totalIssued}
            </span>
            <span className="text-[11px] font-medium">
              published
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            Letters & Form 16s
          </p>
        </button>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/80 pb-2">
        {tabs.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "group flex items-end gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap",
                active
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform",
                  active ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{t.label}</span>
              {t.count > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="transition-opacity duration-150">
        {tab === "emp_requests" && (
          <EmployeeRequestsPanel organizationId={selectedOrgId} />
        )}
        {tab === "requests" && (
          <DocumentRequestsPanel organizationId={selectedOrgId} />
        )}
        {tab === "issued" && (
          <OrgIssuedDocumentsPanel organizationId={selectedOrgId} />
        )}
        {tab === "form16" && <Form16Page embedded />}
      </div>
    </div>
  );
}
