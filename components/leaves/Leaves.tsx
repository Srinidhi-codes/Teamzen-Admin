"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Settings, BarChart3, Clock, Gift } from "lucide-react";
import LeaveRequests from "./LeaveRequests";
import LeaveBalance from "./LeaveBalance";
import LeaveTypes from "./LeaveTypes";
import CompanyHolidays from "./CompanyHolidays";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { PageSkeleton } from "@/components/common/Skeleton";
import { useStore } from "@/lib/store/useStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";

const LeavesPage = () => {
  const { user: storeUser } = useStore();
  const { user: graphqlUser, isLoading: isUserLoading } = useGraphQLUser();
  const user = storeUser || graphqlUser;
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const tabs = useMemo(() => {
    if (!user) return [];
    const isRestrictedRole = user.role === "manager" || user.role === "hr";
    return [
      !isRestrictedRole && { id: "types", label: "Types", icon: Settings },
      { id: "balance", label: "Balance", icon: BarChart3 },
      { id: "requests", label: "Requests", icon: Clock },
      !isRestrictedRole && { id: "holidays", label: "Holidays", icon: Gift },
    ].filter(Boolean) as { id: string; label: string; icon: any }[];
  }, [user]);

  const [activeTab, setActiveTab] = useState(() => {
    const isRestrictedRole = user?.role === "manager" || user?.role === "hr";
    const defaultTab = isRestrictedRole ? "balance" : "types";
    return tabParam && tabs.find((t) => t.id === tabParam) ? tabParam : defaultTab;
  });

  useEffect(() => {
    const isRestrictedRole = user?.role === "manager" || user?.role === "hr";
    const defaultTab = isRestrictedRole ? "balance" : "types";

    if (tabParam && tabs.find((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabs.find((t) => t.id === activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [tabs, tabParam, user?.role, activeTab]);

  const handleActiveTab = (tab: string) => {
    if (tab) {
      setActiveTab(tab);
      router.push(`/leaves?tab=${tab}`);
    }
  };

  if (!user && isUserLoading) {
    return <PageSkeleton cards={0} />;
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Leaves"
        description="Manage leave types, balances, requests, and holidays."
      />

      <SegmentedTabs tabs={tabs} value={activeTab} onChange={handleActiveTab} />

      <div>
        {activeTab === "types" && <LeaveTypes />}
        {activeTab === "balance" && <LeaveBalance />}
        {activeTab === "requests" && <LeaveRequests />}
        {activeTab === "holidays" && <CompanyHolidays />}
      </div>
    </div>
  );
};

export default LeavesPage;
