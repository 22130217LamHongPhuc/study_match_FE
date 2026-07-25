import React from "react";
import { AlertCircle, FolderOpen } from "lucide-react";

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-6 bg-gray-200 rounded-full" />
            </div>
            <div className="flex gap-4 items-start mb-4">
              <div className="w-11 h-11 bg-gray-200 rounded-xl shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-150 rounded" />
                <div className="h-3.5 w-full bg-gray-100 rounded" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-12 bg-gray-150 rounded" />
              <div className="h-3 w-20 bg-gray-150 rounded" />
            </div>
            <div className="h-3 w-full bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="rounded-xl border border-rose-100 bg-rose-50/50 p-8 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
      <h2 className="text-base font-bold text-rose-900 mb-1">
        Lỗi tải dữ liệu
      </h2>
      <p className="text-sm text-rose-700 mb-4 max-w-md mx-auto">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none"
      >
        Thử lại
      </button>
    </section>
  );
}

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white py-12 px-4 text-center shadow-sm">
      <FolderOpen className="mx-auto h-14 w-14 text-gray-300 mb-3" />
      <h2 className="text-base font-bold text-gray-800 mb-1">
        Không tìm thấy tài liệu phù hợp
      </h2>
      <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
        {hasFilters
          ? "Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại các bộ lọc đã chọn."
          : "Chưa có tài liệu học tập nào được tải lên trong hệ thống này."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 focus:outline-none"
        >
          Reset bộ lọc
        </button>
      )}
    </section>
  );
}
