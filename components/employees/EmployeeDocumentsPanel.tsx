"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  EMPLOYEE_DOCUMENT_REQUESTS,
  EMPLOYEE_ISSUED_DOCUMENTS,
  REQUEST_EMPLOYEE_DOCUMENT,
} from "@/lib/graphql/offboarding/queries";

interface Props {
  userId: string;
  employeeName?: string;
}

export default function EmployeeDocumentsPanel({ userId }: Props) {
  const [title, setTitle] = useState("Form 16");
  const [fy, setFy] = useState("2025-26");
  const [category, setCategory] = useState("form_16");
  const [reqTitle, setReqTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const issued = useQuery(EMPLOYEE_ISSUED_DOCUMENTS, {
    variables: { userId },
    fetchPolicy: "cache-and-network",
  });
  const requests = useQuery(EMPLOYEE_DOCUMENT_REQUESTS, {
    variables: { userId, status: null },
    fetchPolicy: "cache-and-network",
  });
  const [requestDoc] = useMutation(REQUEST_EMPLOYEE_DOCUMENT);

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
      await issued.refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
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
          <h3 className="font-medium">Publish to vault (Form 16 / certificates)</h3>
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
          <Input
            placeholder="FY e.g. 2025-26"
            value={fy}
            onChange={(e) => setFy(e.target.value)}
          />
          <select
            className="rounded-md border border-input bg-background px-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="form_16">Form 16</option>
            <option value="salary_certificate">Salary certificate</option>
            <option value="experience">Experience</option>
            <option value="relieving">Relieving</option>
            <option value="other">Other</option>
          </select>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => publish(e.target.files?.[0])}
          disabled={uploading}
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
