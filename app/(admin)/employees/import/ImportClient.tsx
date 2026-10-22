"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { DataImportWizard } from "@/components/employees/DataImportWizard";
import { useStore } from "@/lib/store/useStore";

export default function EmployeeImportPage() {
  const { user } = useStore();
  const searchParams = useSearchParams();
  const [organizationId, setOrganizationId] = useState(
    () => searchParams.get("organizationId") || ""
  );

  useEffect(() => {
    const fromUrl = searchParams.get("organizationId") || "";
    if (fromUrl !== organizationId) {
      setOrganizationId(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const role = (user?.role || "").toLowerCase();
  const isHigherLevel =
    role === "superadmin" ||
    role === "admin" ||
    role === "hr" ||
    (user?.hierarchyLevel !== undefined && user?.hierarchyLevel !== null && user.hierarchyLevel <= 2);

  const backHref = organizationId
    ? `/employees?organizationId=${encodeURIComponent(organizationId)}`
    : "/employees";

  if (user && !isHigherLevel) {
    return (
      <div className="page-shell">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-lg mx-auto mt-12">
          <h2 className="text-base font-semibold text-foreground">Access restricted</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only administrators and HR personnel have permission to import employee records.
          </p>
          <div className="mt-4">
            <Link
              href="/employees"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Import employees"
        description="Upload Excel or CSV, map columns, preview, then load people into Teamzen."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {user?.role === "superadmin" && (
              <OrganizationFilterSelect
                value={organizationId}
                onChange={setOrganizationId}
              />
            )}
            <Link
              href={backHref}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to employees
            </Link>
          </div>
        }
      />

      <DataImportWizard organizationId={organizationId || undefined} />
    </div>
  );
}
