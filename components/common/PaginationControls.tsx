"use client";

import { Pagination } from "@/components/common/Pagination";

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

  if (!total || total === 0 || totalPages <= 0) return null;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      total={total}
      pageSize={pageSize}
      label={paginationLabel}
    />
  );
}
