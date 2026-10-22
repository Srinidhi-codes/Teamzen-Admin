"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  Eye,
  EyeOff,
  Filter,
  FileCheck,
} from "lucide-react";
import { ORG_ISSUED_DOCUMENTS } from "@/lib/graphql/documents/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/common/Badge";
import { Pagination } from "@/components/common/Pagination";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All Documents" },
  { id: "form16", label: "Form 16" },
  { id: "letter", label: "Issued Letters" },
  { id: "other", label: "Other Vault Files" },
];

export default function OrgIssuedDocumentsPanel({
  organizationId,
}: {
  organizationId?: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data, loading, refetch } = useQuery<any>(ORG_ISSUED_DOCUMENTS, {
    variables: {
      organizationId: organizationId || null,
      category: selectedCategory === "all" ? null : selectedCategory,
    },
    fetchPolicy: "cache-and-network",
  });

  const docs: any[] = data?.orgIssuedDocuments || [];

  const filteredDocs = docs.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (d.title || "").toLowerCase().includes(q) ||
      (d.userName || "").toLowerCase().includes(q) ||
      (d.fileName || "").toLowerCase().includes(q) ||
      (d.financialYear || "").toLowerCase().includes(q) ||
      (d.notes || "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, organizationId]);

  const totalPages = Math.ceil(filteredDocs.length / pageSize);
  const paginatedDocs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDocs.slice(start, start + pageSize);
  }, [filteredDocs, page, pageSize]);

  const getCategoryBadge = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "form16":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "letter":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {/* Control bar: Search + Category Pills + Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, employee, file, or FY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-card text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              const count =
                cat.id === "all"
                  ? docs.length
                  : docs.filter((d) => d.category?.toLowerCase() === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap",
                    active
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat.label}
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-semibold",
                      active ? "bg-white/20 text-white" : "bg-background/80 text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="h-9 px-2.5 gap-1.5 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading && !docs.length ? (
        <div className="flex flex-col items-center justify-center p-16 border rounded-xl bg-card/50">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading issued documents repository...
          </p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-xl bg-card/30 text-center">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 mb-3">
            <FileCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            No issued documents found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {search
              ? "No documents matched your search filter. Try clearing the search query."
              : "No letters or Form 16 documents have been published for this organization yet."}
          </p>
          {search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-3 text-xs"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paginatedDocs.map((doc) => (
            <div
              key={doc.id}
              className="group relative rounded-xl border border-border/70 bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-teal-500/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                      getCategoryBadge(doc.category)
                    )}
                  >
                    {doc.category === "form16" ? "Form 16" : doc.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {doc.financialYear && (
                      <Badge
                        variant="default"
                        className="text-[10px] font-mono font-medium px-1.5 py-0.5"
                      >
                        FY {doc.financialYear}
                      </Badge>
                    )}
                    {doc.visibleToEmployee ? (
                      <span
                        title="Visible in Employee Vault"
                        className="text-emerald-500 bg-emerald-500/10 p-1 rounded-md"
                      >
                        <Eye className="h-3 w-3" />
                      </span>
                    ) : (
                      <span
                        title="Restricted / Internal"
                        className="text-amber-500 bg-amber-500/10 p-1 rounded-md"
                      >
                        <EyeOff className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-teal-600 transition-colors">
                      {doc.title || "Issued Document"}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                      {doc.fileName || "document.pdf"}
                    </p>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {doc.userName || "All Employees"}
                    </span>
                  </div>
                  {doc.publishedAt && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>
                        Published {new Date(doc.publishedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {doc.notes && (
                    <p className="text-[11px] italic text-muted-foreground line-clamp-2 pt-0.5 border-t border-border/40">
                      "{doc.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action: Download / View */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  ID: #{doc.id}
                </span>

                {doc.downloadUrl ? (
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download File
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">
                    No download link
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={filteredDocs.length}
          pageSize={pageSize}
          label="documents"
        />
      )}
    </div>
  );
}
