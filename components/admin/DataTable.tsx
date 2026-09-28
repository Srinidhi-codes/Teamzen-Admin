import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";


export interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  itemsPerPage?: number;
  pageSize?: number;
  isLoading?: boolean;
  page?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  onRowClick,
  itemsPerPage: itemsPerPageProp = 10,
  pageSize: externalPageSize,
  isLoading = false,
  page: externalPage,
  totalCount: externalTotalCount,
  onPageChange,
}: DataTableProps<T>) {
  const itemsPerPage = externalPageSize || itemsPerPageProp;
  const [searchTerm, setSearchTerm] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const currentPage = externalPage || internalPage;
  const setCurrentPage = (newPage: number | ((prev: number) => number)) => {
    if (onPageChange) {
      const next = typeof newPage === "function" ? newPage(currentPage) : newPage;
      onPageChange(next);
    } else {
      setInternalPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4" aria-busy="true">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  // Filter data based on search
  const filteredData = searchable
    ? data.filter((item) =>
      Object.values(item as any).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    : data;

  // Sort data
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    })
    : filteredData;

  // Pagination
  const totalCount = externalTotalCount !== undefined ? externalTotalCount : sortedData.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = externalTotalCount !== undefined ? data : sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary w-5 h-5 transition-colors" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
      )}


      {/* Table */}
      <div className="overflow-hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-6 py-4 text-left text-xs font-medium text-muted-foreground ${
                    column.sortable ? "cursor-pointer transition-colors hover:bg-muted/80" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col opacity-30">
                        <ChevronLeft
                          className={`h-3 w-3 rotate-90 ${
                            sortConfig?.key === column.key && sortConfig.direction === "asc"
                              ? "text-primary opacity-100"
                              : ""
                          }`}
                        />
                        <ChevronLeft
                          className={`-mt-1 h-3 w-3 -rotate-90 ${
                            sortConfig?.key === column.key && sortConfig.direction === "desc"
                              ? "text-primary opacity-100"
                              : ""
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-card">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm italic text-muted-foreground"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={`group transition-colors hover:bg-muted/30 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground/80 group-hover:text-foreground"
                    >
                      {column.render
                        ? column.render((item as any)[column.key], item)
                        : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          total={totalCount}
          pageSize={itemsPerPage}
          label="items"
        />
      )}
    </div>
  );
}
