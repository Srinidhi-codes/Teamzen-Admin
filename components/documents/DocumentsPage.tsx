"use client";

import { useState } from "react";
import { FileSpreadsheet, Inbox } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import DocumentRequestsPanel from "@/components/documents/DocumentRequestsPanel";
import Form16Page from "@/components/form16/Form16Page";

type HubTab = "requests" | "form16";

export default function DocumentsPage() {
  const [tab, setTab] = useState<HubTab>("requests");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Request uploads from employees, track fulfillments, and manage Form 16 bulk publish or Part B generation."
      />

      <SegmentedTabs
        value={tab}
        onChange={(id) => setTab(id as HubTab)}
        tabs={[
          { id: "requests", label: "Requests", icon: Inbox },
          { id: "form16", label: "Form 16", icon: FileSpreadsheet },
        ]}
      />

      {tab === "requests" ? <DocumentRequestsPanel /> : <Form16Page embedded />}
    </div>
  );
}
