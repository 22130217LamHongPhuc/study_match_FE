import React from "react";
import { Loader2, Library, Edit, Trash2 } from "lucide-react";
import { Subject } from "../types";

interface SubjectTableProps {
  subjects: Subject[];
  loading: boolean;
  page: number;
  size: number;
  setSize: (val: number) => void;
  totalPages: number;
  totalElements: number;
  onPageChange: (val: number) => void;
  onEditClick: (subject: Subject) => void;
  onDeleteClick: (subjectId: number) => void;
}

export function SubjectTable({
  subjects,
  loading,
  page,
  size,
  setSize,
  totalPages,
  totalElements,
  onPageChange,
  onEditClick,
  onDeleteClick,
}: SubjectTableProps) {
  const startItemIdx = totalElements === 0 ? 0 : page * size + 1;
  const endItemIdx = Math.min((page + 1) * size, totalElements);

  return (
    <div className="overflow-hidden rounded-lg border border-sand-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500 w-16">
                STT
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Mã Môn học
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Tên Môn học
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500 w-32 text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: size }).map((_, index) => (
                <tr key={index} className="border-b border-sand-100 last:border-b-0 animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-6 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-48 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-sand-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Library size={24} className="text-sand-400" />
                    <p className="font-semibold text-sand-800">Không tìm thấy môn học nào</p>
                    <p className="text-xs text-sand-500">
                      Hãy thử điều chỉnh từ khóa tìm kiếm hoặc thêm mới một môn học.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              subjects.map((sub, idx) => (
                <tr
                  key={sub.subjectId}
                  className="border-b border-sand-100 last:border-b-0 hover:bg-sand-50/50"
                >
                  <td className="px-4 py-3 text-xs font-medium text-sand-500">
                    {page * size + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-sand-800">
                    {sub.subjectCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-700">
                    {sub.subjectName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditClick(sub)}
                        className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                        title="Sửa môn học"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteClick(sub.subjectId)}
                        className="rounded p-1.5 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                        title="Xóa môn học"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {subjects.length > 0 && (
        <div className="flex items-center justify-between border-t border-sand-200 px-4 py-3">
          <p className="text-xs font-medium text-sand-500">
            Hiển thị{" "}
            <span className="font-medium text-sand-700">{startItemIdx}</span> -{" "}
            <span className="font-medium text-sand-700">{endItemIdx}</span> trong{" "}
            <span className="font-medium text-sand-700">{totalElements}</span> môn học
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-sand-500">Số dòng mỗi trang:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  onPageChange(0);
                }}
                className="h-8 rounded-lg border border-sand-300 bg-sand-50 px-2 text-xs font-medium text-sand-700 outline-none focus:border-[#3b82f6]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages === 0 ? 1 : totalPages }).map(
                (_, index) => {
                  const pageNumber = index + 1;
                  const isCurrent = page === index;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => onPageChange(index)}
                      disabled={totalPages === 0}
                      className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${
                        isCurrent
                          ? "bg-[#3b82f6] text-white shadow-sm shadow-[#3b82f6]/20"
                          : "border border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
