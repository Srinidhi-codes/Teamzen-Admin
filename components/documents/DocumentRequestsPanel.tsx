"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import moment from "moment";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import {
  CANCEL_DOCUMENT_REQUEST,
  ORGANIZATION_DOCUMENT_REQUESTS,
  REQUEST_EMPLOYEE_DOCUMENT,
  VERIFY_VAULT_DOCUMENT,
} from "@/lib/graphql/documents/queries";

const CATEGORIES = [
  { value: "hr_request", label: "HR request" },
  { value: "id_proof", label: "ID proof" },
  { value: "pan", label: "PAN" },
  { value: "aadhaar", label: "Aadhaar" },
  { value: "bank_proof", label: "Bank proof" },
  { value: "education", label: "Education" },
  { value: "exit_clearance", label: "Exit clearance" },
  { value: "other", label: "Other" },
];

type StatusFilter = "open" | "fulfilled" | "cancelled" | "all";

export default function DocumentRequestsPanel() {
  const { user: me } = useStore();
  const organizationId =
    me?.role === "superadmin" ? undefined : me?.organization?.id;

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("hr_request");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [busy, setBusy] = useState(false);

  const { users, isUsersLoading } = useGraphQLUsers({
    page: 1,
    pageSize: 300,
    filters: {
      isActive: true,
      ...(organizationId ? { organizationId } : {}),
    },
  });

  const employeeList = useMemo(
    () => (users || []).filter((u: any) => u.role === "employee"),
    [users]
  );

  const statusVar = statusFilter === "all" ? null : statusFilter;
  const inbox = useQuery(ORGANIZATION_DOCUMENT_REQUESTS, {
    variables: { status: statusVar },
    fetchPolicy: "cache-and-network",
  });

  const [requestDoc] = useMutation(REQUEST_EMPLOYEE_DOCUMENT);
  const [cancelReq] = useMutation(CANCEL_DOCUMENT_REQUEST);
  const [verifyDoc] = useMutation(VERIFY_VAULT_DOCUMENT);

  const createRequest = async () => {
    if (!userId) {
      toast.error("Select an employee");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setBusy(true);
    try {
      const res = await requestDoc({
        variables: {
          input: {
            userId,
            title: title.trim(),
            category,
            description: description.trim(),
            dueAt: dueAt || null,
          },
        },
      });
      if (!res.data?.requestEmployeeDocument?.success) {
        throw new Error(res.data?.requestEmployeeDocument?.error || "Failed");
      }
      toast.success("Request sent — employee will be notified");
      setTitle("");
      setDescription("");
      setDueAt("");
      setStatusFilter("open");
      await inbox.refetch({ status: "open" });
    } catch (e: any) {
      toast.error(e.message || "Failed to create request");
    } finally {
      setBusy(false);
    }
  };

  const onCancel = async (requestId: string) => {
    try {
      const res = await cancelReq({ variables: { requestId } });
      if (!res.data?.cancelDocumentRequest?.success) {
        throw new Error(res.data?.cancelDocumentRequest?.error || "Failed");
      }
      toast.success("Request cancelled");
      await inbox.refetch();
    } catch (e: any) {
      toast.error(e.message || "Cancel failed");
    }
  };

  const onVerify = async (documentId: string, approve: boolean) => {
    try {
      const res = await verifyDoc({
        variables: {
          documentId,
          approve,
          rejectionReason: approve ? "" : "Please re-upload a clearer copy",
        },
      });
      if (!res.data?.verifyVaultDocument?.success) {
        throw new Error(res.data?.verifyVaultDocument?.error || "Failed");
      }
      toast.success(approve ? "Document approved" : "Document rejected");
      await inbox.refetch();
    } catch (e: any) {
      toast.error(e.message || "Verify failed");
    }
  };

  const rows = inbox.data?.organizationDocumentRequests || [];

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <div>
          <h3 className="text-sm font-semibold">Request a document</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Employee gets a notification and can upload from their Documents vault.
            You will be notified when they upload.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Employee
            </label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isUsersLoading}
            >
              <option value="">Select employee…</option>
              {employeeList.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} · {u.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Category
            </label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Title"
            placeholder="e.g. Aadhaar soft copy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Due date (optional)"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </div>
        <Input
          label="Note to employee (optional)"
          placeholder="Any instructions…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button type="button" disabled={busy} onClick={createRequest}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send request
        </Button>
      </Card>

      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Request inbox</h3>
          <div className="flex flex-wrap gap-1">
            {(["open", "fulfilled", "cancelled", "all"] as StatusFilter[]).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {s}
                </button>
              )
            )}
          </div>
        </div>

        {inbox.loading && !rows.length ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests in this filter.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r: any) => (
              <li
                key={r.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {r.title}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {r.userName}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{r.status}</span>
                    {r.category ? ` · ${r.category.replace(/_/g, " ")}` : ""}
                    {r.dueAt
                      ? ` · due ${moment(r.dueAt).format("D MMM YYYY")}`
                      : ""}
                    {r.fulfilledAt
                      ? ` · uploaded ${moment(r.fulfilledAt).format("D MMM YYYY")}`
                      : ""}
                    {r.verificationStatus
                      ? ` · ${r.verificationStatus}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {r.fileUrl && (
                    <a
                      className="text-xs font-medium text-primary underline"
                      href={r.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View file
                    </a>
                  )}
                  {r.status === "fulfilled" && r.fulfilledDocumentId && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onVerify(r.fulfilledDocumentId, true)}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onVerify(r.fulfilledDocumentId, false)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {r.status === "open" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onCancel(r.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
