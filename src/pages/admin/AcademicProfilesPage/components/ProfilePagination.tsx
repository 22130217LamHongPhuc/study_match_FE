import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProfilePaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

export function ProfilePagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
}: ProfilePaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-sand-200 bg-white px-4 py-3">
      <div className="text-xs text-sand-500">
        Hiển thị{" "}
        <span className="font-semibold text-sand-700">
          {totalElements === 0 ? 0 : page * size + 1}
        </span>{" "}
        đến{" "}
        <span className="font-semibold text-sand-700">
          {Math.min((page + 1) * size, totalElements)}
        </span>{" "}
        trong tổng{" "}
        <span className="font-semibold text-sand-700">{totalElements}</span> kết
        quả
      </div>

      <div className="flex items-center gap-3">
        <select
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="h-8 rounded-md border border-sand-300 bg-sand-50/50 px-2 text-xs text-sand-700 outline-none focus:border-[#3b82f6]"
        >
          <option value={5}>5 / trang</option>
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-sand-300 text-sand-500 transition-colors hover:bg-sand-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="px-2 text-xs font-medium text-sand-600">
            {page + 1} / {totalPages || 1}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page + 1 >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-sand-300 text-sand-500 transition-colors hover:bg-sand-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
