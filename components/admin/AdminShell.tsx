"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTokenRefresh } from "@/lib/api/hooks";

export function AdminShell({ children }: { children: React.ReactNode }) {
  useTokenRefresh();
  return <AdminLayout>{children}</AdminLayout>;
}
