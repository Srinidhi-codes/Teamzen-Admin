import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/common/Skeleton";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";


export interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}


export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  // Pagination Props
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  paginationLabel?: string;
  // Sort Props
  sortConfig?: SortConfig | null;
  onSortChange?: (sort: SortConfig | null) => void;
}

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

export function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  total,
  currentPage,
  pageSize,
  onPageChange,
  paginationLabel = "items",
  sortConfig,
  onSortChange,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4" aria-busy="true" aria-label="Loading table">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }


  if (!data || data.length === 0) {
    return (
      <EmptyState
        src={EmptyImages.notFound}
        title="Zero Identifiers Detected"
        description="The requested data set is currently empty or doesn't match the current filters."
        size="wide"
      />
    );
  }


  const handleSort = (key: string) => {
    if (!onSortChange) return;

    if (sortConfig?.key === key) {
      if (sortConfig.direction === "asc") {
        onSortChange({ key, direction: "desc" });
      } else {
        onSortChange(null);
      }
    } else {
      onSortChange({ key, direction: "asc" });
    }
  };

  const totalPages = pageSize ? Math.ceil((total || 0) / pageSize) : 0;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-4xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>

              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-5 text-left text-xs font-medium text-muted-foreground ${col.sortable && onSortChange ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >

                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && onSortChange && (
                      <div className="text-muted-foreground/50 group-hover:text-primary/70">

                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">

            {data?.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`
                  group transition-all duration-300
                  ${onRowClick ? "hover:bg-muted/50 cursor-pointer" : ""}
                `}

              >
                {columns.map((col) => {
                  const value = getNestedValue(row, col.key);
                  return (
                    <td
                      key={col.key}
                      className={cn("px-6 py-5 whitespace-nowrap text-sm font-medium text-foreground/80", col.className)}
                    >


                      {col.render ? col.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && currentPage && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          total={total}
          pageSize={pageSize}
          label={paginationLabel}
        />
      )}
    </div>
  );
}
