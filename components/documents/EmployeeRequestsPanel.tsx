"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import moment from "moment";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ORG_EMPLOYEE_DOCUMENT_REQUESTS, ISSUE_EMPLOYEE_DOCUMENT, REJECT_EMPLOYEE_DOCUMENT } from "@/lib/graphql/documents/queries";
import { useLetterTemplates } from "@/lib/graphql/onboarding/onboardingHook";
import { FormSelect } from "@/components/common/FormSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { Upload } from "lucide-react";

type StatusFilter = "pending" | "issued" | "rejected" | "all";

export default function EmployeeRequestsPanel() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  
  const [templateId, setTemplateId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const statusVar = statusFilter === "all" ? null : statusFilter;
  const { data, refetch, loading } = useQuery<{ orgEmployeeDocumentRequests: any[] }>(ORG_EMPLOYEE_DOCUMENT_REQUESTS, {
    variables: { status: statusVar },
    fetchPolicy: "cache-and-network",
  });
  
  const [issueReq, { loading: issuing }] = useMutation<{
    issueEmployeeDocument: { success: boolean; error?: string };
  }>(ISSUE_EMPLOYEE_DOCUMENT);
  const [rejectReq, { loading: rejecting }] = useMutation<{
    rejectEmployeeDocument: { success: boolean; error?: string };
  }>(REJECT_EMPLOYEE_DOCUMENT);

  const { templates: letterTemplates } = useLetterTemplates();

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId && !file) return toast.error("Select a template or upload a file");
    
    try {
      if (file) {
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        form.append("user_id", selectedReq.userId);
        form.append("title", selectedReq.category === "other" ? selectedReq.customTitle : selectedReq.category.replace(/_/g, " "));
        form.append("category", selectedReq.category);
        form.append("employee_request_id", selectedReq.id);
        
        const res = await fetch("/api/documents/issued/publish/", {
          method: "POST",
          body: form,
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Upload failed");
      } else {
        const res = await issueReq({
          variables: {
            input: {
              requestId: selectedReq.id,
              templateId,
            }
          }
        });
        if (res.data?.issueEmployeeDocument?.error) {
          throw new Error(res.data.issueEmployeeDocument.error);
        }
      }
      
      toast.success("Document issued and sent to employee");
      setIssueModalOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to issue document");
    } finally {
      setUploading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return toast.error("Provide a reason");
    try {
      const res = await rejectReq({
        variables: {
          input: {
            requestId: selectedReq.id,
            reason: rejectReason.trim(),
          }
        }
      });
      if (res.data?.rejectEmployeeDocument?.error) {
        throw new Error(res.data.rejectEmployeeDocument.error);
      }
      toast.success("Request rejected");
      setRejectModalOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to reject document");
    }
  };

  const rows = data?.orgEmployeeDocumentRequests || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-2">
        {(["pending", "issued", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors capitalize",
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
      
      {!loading && rows.length === 0 && (
        <EmptyState 
          className="rounded-xl border bg-card"
          size="wide"
          src="/images/empty/empty-payslip.webp" 
          title="No employee requests" 
          description="There are no document requests from employees."
        />
      )}

      <div className="grid gap-3">
        {rows.map((req: any) => (
          <Card key={req.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <p className="font-medium text-base">
                {req.category === "other" ? req.customTitle : req.category.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Requested by <span className="font-medium text-foreground">{req.userName}</span> ({req.userEmail})
              </p>
              <div className="mt-2 text-xs flex gap-3 text-muted-foreground">
                <span className="capitalize px-2 py-0.5 rounded-full border bg-muted/50">{req.status}</span>
                <span>{moment(req.createdAt).format("MMM D, YYYY")}</span>
              </div>
              {req.reason && (
                <div className="mt-3 text-sm bg-muted/50 p-2 rounded-md border">
                  <span className="font-medium">Reason: </span>{req.reason}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {req.status === "pending" && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedReq(req);
                      setRejectReason("");
                      setRejectModalOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      setSelectedReq(req);
                      setTemplateId("");
                      setFile(null);
                      setIssueModalOpen(true);
                    }}
                  >
                    Issue document
                  </Button>
                </>
              )}
              {req.status === "issued" && req.issuedDocumentUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={req.issuedDocumentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> View document
                  </a>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIssue} className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Provide a document for <strong>{selectedReq?.userName}</strong>.
            </p>
            <div>
              <FormSelect
                label="Letter Template"
                options={[
                  { value: "", label: "Select a template..." },
                  ...letterTemplates.map(t => ({ value: t.id, label: t.name }))
                ]}
                value={templateId}
                onValueChange={setTemplateId}
                disabled={!!file}
              />
            </div>
            <div className="relative text-center">
              <span className="text-xs text-muted-foreground bg-background px-2">OR</span>
              <div className="absolute inset-0 flex items-center -z-10"><div className="w-full border-t border-border"></div></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Upload custom PDF</label>
              <Input
                type="file"
                accept=".pdf"
                disabled={!!templateId}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIssueModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={issuing || uploading}>{(issuing || uploading) ? "Issuing..." : "Issue"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Reason for rejection</label>
              <Input 
                required 
                value={rejectReason} 
                onChange={e => setRejectReason(e.target.value)} 
                placeholder="E.g., Missing details, Not applicable..." 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={rejecting}>{rejecting ? "Rejecting..." : "Reject"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
