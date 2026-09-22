"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_LOGIN_HISTORY, GET_ME } from "@/lib/graphql/users/queries";
import { UPDATE_PROFILE } from "@/lib/graphql/users/mutations";
import { DataTable } from "@/components/admin/DataTable";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck,
  Globe,
  Monitor,
  User as UserIcon,
  AlertCircle,
  RefreshCcw,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStore } from "@/lib/store/useStore";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { SearchInput } from "@/components/common/SearchInput";
import { useDebounce } from "@/lib/hooks/useDebounce";

function parseUserAgent(uaRaw?: string) {
  const ua = uaRaw?.toLowerCase() || "";
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("macintosh") || ua.includes("mac os")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

  let browser = "";
  if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edge")) browser = "Edge";

  return { os, browser };
}

export default function SecuritySettingsPage() {
  const { user, updateUser } = useStore();
  const [page, setPage] = useState(1);
  const [organizationId, setOrganizationId] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const pageSize = 20;
  const isSuperadmin = user?.role === "superadmin";

  const { data: meData, refetch: refetchMe } = useQuery(GET_ME, {
    fetchPolicy: "cache-and-network",
  }) as any;
  const me = meData?.me;
  const emailLoginAlerts = Boolean(me?.emailLoginAlerts ?? user?.emailLoginAlerts);

  const [updateProfile, { loading: savingToggle }] = useMutation(UPDATE_PROFILE) as any;

  const { data, loading, error, refetch } = useQuery(GET_LOGIN_HISTORY, {
    variables: {
      page,
      pageSize,
      organizationId: organizationId || undefined,
      search: debouncedSearch || undefined,
    },
    fetchPolicy: "network-only",
  }) as any;

  useEffect(() => {
    setPage(1);
  }, [organizationId, debouncedSearch]);

  const response = data?.globalLoginHistory || {};
  const logs = response.results || [];
  const totalCount = response.total || 0;

  const handleToggleLoginAlerts = async (checked: boolean) => {
    try {
      const res = await updateProfile({
        variables: { input: { emailLoginAlerts: checked } },
      });
      if (res.data?.updateProfile?.error) {
        throw new Error(res.data.updateProfile.error);
      }
      updateUser({ emailLoginAlerts: checked } as any);
      await refetchMe();
      toast.success(
        checked
          ? "Login alert emails enabled"
          : "Login alert emails disabled"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update preference");
    }
  };

  const alertDescription = isSuperadmin
    ? "Email you whenever anyone signs in across the platform."
    : user?.role === "admin" || user?.role === "hr"
      ? "Email you when anyone in your organization signs in (and when you sign in)."
      : "Email you whenever your account is signed in.";

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
        <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
        <h2 className="text-base font-semibold text-foreground">Couldn’t load security logs</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Security"
        description="Login alerts and history across your organization."
        actions={
          <button
            onClick={() => refetch()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Refresh"
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Email login alerts</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{alertDescription}</p>
            </div>
          </div>
          <Switch
            checked={emailLoginAlerts}
            disabled={savingToggle}
            onCheckedChange={handleToggleLoginAlerts}
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Login history
          </h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              placeholder="Search user, IP, location…"
              value={search}
              onChange={setSearch}
              containerClassName="max-w-xs"
            />
            <OrganizationFilterSelect
              value={organizationId}
              onChange={setOrganizationId}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {totalCount} records
            </span>
          </div>
        </div>

        <DataTable
          isLoading={loading}
          data={logs}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(p: number) => setPage(p)}
          columns={[
            {
              key: "user",
              label: "User",
              render: (_val, row: any) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {row.user?.profilePictureUrl ? (
                      <Image
                        src={row.user.profilePictureUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {row.user?.firstName} {row.user?.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.user?.email}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "ipAddress",
              label: "IP address",
              render: (val) => (
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{val || "—"}</code>
              ),
            },
            {
              key: "loginTime",
              label: "Time",
              render: (val) => (
                <div>
                  <p className="text-sm text-foreground">
                    {format(new Date(val), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(val), "HH:mm:ss")}
                  </p>
                </div>
              ),
            },
            {
              key: "userAgent",
              label: "Device",
              render: (val) => {
                const { os, browser } = parseUserAgent(val);
                return (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Monitor className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate" title={val}>
                      {os}
                      {browser ? ` · ${browser}` : ""}
                    </span>
                  </div>
                );
              },
            },
            {
              key: "location",
              label: "Location",
              render: (val) => (
                <span className="text-sm text-foreground">{val || "—"}</span>
              ),
            },
            {
              key: "latitude",
              label: "Coordinates",
              render: (_val, row: any) => (
                <div className="text-xs tabular-nums text-muted-foreground">
                  <p>{row.latitude ? Number(row.latitude).toFixed(4) : "—"}</p>
                  <p>{row.longitude ? Number(row.longitude).toFixed(4) : "—"}</p>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (val) => (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize",
                    val === "success"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {val === "success" ? "Success" : "Failed"}
                </span>
              ),
            },
          ]}
        />

        {logs?.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No login history yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
