"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FilePicker } from "@/components/ui/file-picker";
import { FormSelect } from "@/components/common/FormSelect";
import {
  EMPLOYEE_DOCUMENT_REQUESTS,
  EMPLOYEE_ISSUED_DOCUMENTS,
  REQUEST_EMPLOYEE_DOCUMENT,
} from "@/lib/graphql/offboarding/queries";

interface Props {
  userId: string;
  employeeName?: string;
}

type MutationStatus = {
  success: boolean;
  error?: string | null;
};

type IssuedDocument = {
  id: string;
  category?: string | null;
  title?: string | null;
  financialYear?: string | null;
  downloadUrl?: string | null;
  publishedAt?: string | null;
  visibleToEmployee?: boolean | null;
};

type EmployeeDocumentRequest = {
  id: string;
  title?: string | null;
  category?: string | null;
  status?: string | null;
  dueAt?: string | null;
  createdAt?: string | null;
};

function fyStartYear(d = new Date()) {
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

function fyLabel(startYear: number) {
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

function financialYearOptions() {
  const current = fyStartYear();
  return Array.from({ length: 8 }, (_, i) => fyLabel(current + 1 - i));
}

export default function EmployeeDocumentsPanel({ userId }: Props) {
  const [title, setTitle] = useState("Form 16");
  const [fy, setFy] = useState(fyLabel(fyStartYear()));
  const [category, setCategory] = useState("form_16");
  const [reqTitle, setReqTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [picked, setPicked] = useState<File[]>([]);

  const issued = useQuery<
    { employeeIssuedDocuments?: IssuedDocument[] | null },
    { userId: string }
  >(EMPLOYEE_ISSUED_DOCUMENTS, {
    variables: { userId },
    fetchPolicy: "cache-and-network",
  });
  const requests = useQuery<
    { employeeDocumentRequests?: EmployeeDocumentRequest[] | null },
    { userId: string; status: string | null }
  >(EMPLOYEE_DOCUMENT_REQUESTS, {
    variables: { userId, status: null },
    fetchPolicy: "cache-and-network",
  });
  const [requestDoc] = useMutation<
    { requestEmployeeDocument?: MutationStatus | null },
    {
      input: {
        userId: string;
        title: string;
        category: string;
        description: string;
      };
    }
  >(REQUEST_EMPLOYEE_DOCUMENT);

  const publish = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("user_id", userId);
      form.append("title", title || file.name);
      form.append("category", category);
      form.append("financial_year", fy);
      const res = await fetch("/api/documents/issued/publish/", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Publish failed");
      toast.success("Document published to employee vault");
      setPicked([]);
      await issued.refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setUploading(false);
    }
  };

  const createRequest = async () => {
    if (!reqTitle.trim()) {
      toast.error("Title required");
      return;
    }
    try {
      const res = await requestDoc({
        variables: {
          input: {
            userId,
            title: reqTitle,
            category: "hr_request",
            description: "",
          },
        },
      });
      if (!res.data?.requestEmployeeDocument?.success) {
        throw new Error(res.data?.requestEmployeeDocument?.error || "Failed");
      }
      toast.success("Request sent to employee");
      setReqTitle("");
      await requests.refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-medium">Publish to vault (official Form 16 / certificates)</h3>
          <Link
            href="/documents"
            className="text-xs font-medium text-primary underline"
          >
            Open Documents hub
          </Link>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <FormSelect
            label="Financial year"
            value={fy}
            onValueChange={setFy}
            options={financialYearOptions().map((year) => ({
              label: `FY ${year}`,
              value: year,
            }))}
            className="h-9 rounded-md px-3 py-2"
          />
          <FormSelect
            label="Category"
            value={category}
            onValueChange={setCategory}
            options={[
              { value: "form_16", label: "Form 16" },
              { value: "salary_certificate", label: "Salary certificate" },
              { value: "experience", label: "Experience" },
              { value: "relieving", label: "Relieving" },
              { value: "other", label: "Other" },
            ]}
            className="h-9 rounded-md px-3 py-2"
          />
        </div>
        <FilePicker
          accept=".pdf,.jpg,.jpeg,.png"
          label="Choose file"
          disabled={uploading}
          files={picked}
          onChange={(next) => {
            setPicked(next);
            if (next[0]) void publish(next[0]);
          }}
        />
        <ul className="space-y-1 text-sm">
          {(issued.data?.employeeIssuedDocuments || []).map((d: any) => (
            <li key={d.id} className="flex justify-between gap-2">
              <span>
                {d.title}
                {d.financialYear ? ` (FY ${d.financialYear})` : ""}
              </span>
              {d.downloadUrl && (
                <a className="text-primary underline" href={d.downloadUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3 p-4">
        <h3 className="font-medium">Request upload from employee</h3>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Updated bank proof"
            value={reqTitle}
            onChange={(e) => setReqTitle(e.target.value)}
          />
          <Button type="button" onClick={createRequest}>
            Request
          </Button>
        </div>
        <ul className="space-y-1 text-sm">
          {(requests.data?.employeeDocumentRequests || []).map((r: any) => (
            <li key={r.id} className="flex justify-between gap-2">
              <span>
                {r.title} · <span className="capitalize">{r.status}</span>
              </span>
              {r.fileUrl && (
                <a className="text-primary underline" href={r.fileUrl} target="_blank" rel="noreferrer">
                  File
                </a>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
