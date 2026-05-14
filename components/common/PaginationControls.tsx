"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  paginationLabel?: string;
}

export function PaginationControls({
  total,
  currentPage,
  pageSize,
  onPageChange,
  paginationLabel = "items",
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (!total || total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-card/50 rounded-4xl border border-border backdrop-blur-sm shadow-sm ring-1 ring-border/50">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">
        Showing <span className="text-primary font-black">{(currentPage - 1) * pageSize + 1}</span>
        <span className="mx-1.5">—</span>
        <span className="text-primary font-black">{Math.min(currentPage * pageSize, total)}</span>
        <span className="mx-2 text-muted-foreground/50">Of</span>
        <span className="text-foreground font-black">{total}</span>
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
              className={`rounded-xl border-border text-muted-foreground font-bold hover:bg-card hover:text-primary hover:border-primary/20 transition-all ${
                currentPage <= 1 ? "pointer-events-none opacity-40 shadow-none border-dashed" : "cursor-pointer shadow-sm"
              }`}
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
                    className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${
                      currentPage === pageNumber
                        ? "bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/20 scale-110"
                        : "bg-card text-muted-foreground border-border hover:border-primary/20 hover:text-primary shadow-sm"
                    }`}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
              return <PaginationEllipsis key={pageNumber} className="text-muted-foreground/30 scale-75" />;
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
              className={`rounded-xl border-border text-muted-foreground font-bold hover:bg-card hover:text-primary hover:border-primary/20 transition-all ${
                currentPage >= totalPages ? "pointer-events-none opacity-40 shadow-none border-dashed" : "cursor-pointer shadow-sm"
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
