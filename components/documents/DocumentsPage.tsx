"use client";

import { useState } from "react";
import { FileSpreadsheet, Inbox } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import DocumentRequestsPanel from "@/components/documents/DocumentRequestsPanel";
import Form16Page from "@/components/form16/Form16Page";
import EmployeeRequestsPanel from "@/components/documents/EmployeeRequestsPanel";

type HubTab = "emp_requests" | "requests" | "form16";

export default function DocumentsPage() {
  const [tab, setTab] = useState<HubTab>("emp_requests");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Request uploads from employees, track fulfillments, and publish official TRACES Form 16 PDFs."
      />

      <SegmentedTabs
        value={tab}
        onChange={(id) => setTab(id as HubTab)}
        tabs={[
          { id: "emp_requests", label: "Employee requests", icon: Inbox },
          { id: "requests", label: "Requested by HR", icon: Inbox },
          { id: "form16", label: "Form 16", icon: FileSpreadsheet },
        ]}
      />

      {tab === "emp_requests" && <EmployeeRequestsPanel />}
      {tab === "requests" && <DocumentRequestsPanel />}
      {tab === "form16" && <Form16Page embedded />}
    </div>
  );
}
