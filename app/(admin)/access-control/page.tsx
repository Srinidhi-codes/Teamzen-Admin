import React, { Suspense } from "react";
import { AccessControlManager } from "@/components/access-control/AccessControlManager";

export const metadata = {
  title: "Access Control & Feature Governance | Admin Portal",
  description: "Hierarchical access governance across subscription plans, company entitlements, and workforce role permissions.",
};

export default function AccessControlPage() {
  return (
    <div className="w-full pb-16">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Loading access control governance...</div>}>
        <AccessControlManager />
      </Suspense>
    </div>
  );
}
