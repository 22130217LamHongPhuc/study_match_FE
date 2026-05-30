import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
      <p className="text-[12px] font-medium text-gray-500">
        Hiển thị <span className="font-bold text-gray-700">{startItem}</span> -{" "}
        <span className="font-bold text-gray-700">{endItem}</span> trong{" "}
        <span className="font-bold text-gray-700">{totalItems}</span> nhóm
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronLeft size={14} />
          Trước
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 min-w-8 rounded px-2 text-[12px] font-bold transition ${
                  page === pageNumber
                    ? "bg-orange-500 text-white"
                    : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
        >
          Sau
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
