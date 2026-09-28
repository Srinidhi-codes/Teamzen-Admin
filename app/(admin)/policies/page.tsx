"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePolicies } from "@/lib/api/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FileText, Upload, Trash2 } from "lucide-react";
import moment from "moment";
import { useStore } from "@/lib/store/useStore";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";

export default function PoliciesPage() {
  const { policies, isLoading, isUploading, upload, remove } = usePolicies();
  const [isOpen, setIsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { user } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Please provide a title and file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      await upload.mutateAsync(formData);
      toast.success("Policy uploaded");
      setIsOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      toast.error("Failed to upload policy");
      console.error(error);
    }
  };

  const isAuthorized = user?.role === "admin" || user?.role === "superadmin";

  return (
    <div className="page-shell">
      <PageHeader
        title="Policies"
        description="Upload and manage organization policy documents."
        actions={
          isAuthorized ? (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload policy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload policy</DialogTitle>
                  <DialogDescription>
                    Add a PDF policy for your organization.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Employee handbook"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description (optional)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="file">PDF file</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        setFile(e.target.files ? e.target.files[0] : null)
                      }
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Upload
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading policies…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {policies?.map((policy: any) => (
            <div
              key={policy.id}
              className="flex min-h-[180px] flex-col rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {policy.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {moment(policy.created_at).format("MMM D, YYYY")}
                      {" · "}
                      {policy.file_size
                        ? `${(policy.file_size / 1024 / 1024).toFixed(2)} MB`
                        : "—"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                    policy.is_processed
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  )}
                >
                  {policy.is_processed ? "Ready" : "Processing"}
                </span>
              </div>

              {policy.description && (
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {policy.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPdf({
                      url: policy.file_url || policy.file,
                      title: policy.title,
                    });
                    setIsViewOpen(true);
                  }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View document
                </button>
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => {
                      setPolicyToDelete(policy.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                    title="Delete policy"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {!isLoading && policies?.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No policies uploaded yet</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="flex h-[calc(100vh-8rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {selectedPdf?.title}
            </DialogTitle>
            <DialogDescription>Document preview</DialogDescription>
          </DialogHeader>
          <div className="relative min-h-0 flex-1 bg-muted/40">
            {selectedPdf?.url ? (
              <iframe
                src={`${selectedPdf.url}#toolbar=0`}
                className="h-full w-full border-none"
                title={selectedPdf.title}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (policyToDelete) {
            try {
              await remove.mutateAsync(policyToDelete);
              toast.success("Policy deleted");
            } catch {
              toast.error("Failed to delete policy");
            }
          }
        }}
        variant="destructive"
        title="Delete policy?"
        description="This permanently deletes the document and related search index data. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
