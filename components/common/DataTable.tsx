import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
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
      <div className="p-12 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Synchronizing Data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No identifiers found</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">We couldn't locate any records matching your current criteria.</p>
      </div>
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
      <div className="overflow-x-auto rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${col.sortable && onSortChange ? "cursor-pointer hover:text-indigo-600 transition-colors" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && onSortChange && (
                      <div className="text-slate-300 group-hover:text-indigo-400">
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
          <tbody className="bg-white divide-y divide-slate-50">
            {data?.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`
                  group transition-all duration-300
                  ${onRowClick ? "hover:bg-slate-50/80 cursor-pointer" : ""}
                `}
              >
                {columns.map((col) => {
                  const value = getNestedValue(row, col.key);
                  return (
                    <td
                      key={col.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold group-hover:text-indigo-600 transition-colors"
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

      {/* Pagination Footer */}
      {totalPages > 0 && currentPage && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 bg-white/50 rounded-[2rem] border border-white backdrop-blur-sm shadow-sm ring-1 ring-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
            Showing <span className="text-indigo-600 font-black">{(currentPage - 1) * (pageSize || 0) + 1}</span>
            <span className="mx-1.5">—</span>
            <span className="text-indigo-600 font-black">{Math.min(currentPage * (pageSize || 0), total || 0)}</span>
            <span className="mx-2 text-slate-300">Of</span>
            <span className="text-slate-900 font-black">{total}</span>
            <span className="ml-2">{paginationLabel}</span>
          </div>

          <Pagination className="mx-0 w-auto">
            <PaginationContent className="gap-1.5">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  className={`rounded-xl border-slate-100 text-slate-500 font-bold hover:bg-white hover:text-indigo-600 hover:border-indigo-100 transition-all ${currentPage <= 1 ? "pointer-events-none opacity-40 shadow-none border-dashed" : "cursor-pointer shadow-sm"}`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNumber}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(pageNumber);
                        }}
                        className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${currentPage === pageNumber ? "bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-200 scale-110" : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:text-indigo-600 shadow-sm"}`}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <PaginationEllipsis key={pageNumber} className="text-slate-300 scale-75" />;
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  className={`rounded-xl border-slate-100 text-slate-500 font-bold hover:bg-white hover:text-indigo-600 hover:border-indigo-100 transition-all ${currentPage >= totalPages ? "pointer-events-none opacity-40 shadow-none border-dashed" : "cursor-pointer shadow-sm"}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
