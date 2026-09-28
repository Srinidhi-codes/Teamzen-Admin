import { Suspense } from "react";
import EmployeeImportPage from "./ImportClient";
import { PageSkeleton } from "@/components/common/Skeleton";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton cards={0} />}>
      <EmployeeImportPage />
    </Suspense>
  );
}
