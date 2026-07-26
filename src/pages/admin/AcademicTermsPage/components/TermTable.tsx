import React from "react";
import { Edit, Play, Library } from "lucide-react";
import { AcademicTerm } from "../types";

interface TermTableProps {
  terms: AcademicTerm[];
  loading: boolean;
  onEditClick: (term: AcademicTerm) => void;
  onActivateClick: (termId: number) => void;
}

export function TermTable({ terms, loading, onEditClick, onActivateClick }: TermTableProps) {
  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active":
        return (
          <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            Đang hoạt động
          </span>
        );
      case "planned":
        return (
          <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Dự kiến
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center rounded-md border border-sand-300 bg-sand-100 px-2.5 py-1 text-xs font-semibold text-sand-600">
            Đã kết thúc
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-sand-200 bg-white px-2.5 py-1 text-xs font-semibold text-sand-500">
            {status}
          </span>
        );
    }
  };

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
                Tên Học kỳ
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Năm học
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Học kỳ số
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500 w-48 text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-sand-100 last:border-b-0 animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-6 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-48 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-8 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-6 w-20 bg-sand-200 rounded-full" /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : terms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-sand-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Library size={24} className="text-sand-400" />
                    <p className="font-semibold text-sand-800">Không tìm thấy học kỳ nào</p>
                    <p className="text-xs text-sand-500">
                      Hãy tạo học kỳ mới để bắt đầu.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              terms.map((term, idx) => {
                const statusLower = (term.status || "").toLowerCase();
                const isActive = statusLower === "active";
                const isCompleted = statusLower === "completed";
                return (
                  <tr
                    key={term.termId}
                    className="border-b border-sand-100 last:border-b-0 hover:bg-sand-50/50"
                  >
                    <td className="px-4 py-3 text-xs font-medium text-sand-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-sand-800">
                      {term.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-sand-700">
                      {term.academicYearStart} - {term.academicYearEnd}
                    </td>
                    <td className="px-4 py-3 text-sm text-sand-700 font-mono">
                      Kỳ {term.semesterNo}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(term.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-2">
                        {!isActive && !isCompleted && (
                          <button
                            type="button"
                            onClick={() => onActivateClick(term.termId)}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100/70"
                            title="Kích hoạt học kỳ hiện tại"
                          >
                            <Play size={12} fill="currentColor" />
                            <span>Kích hoạt kỳ</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditClick(term)}
                          className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                          title="Sửa học kỳ"
                        >
                          <Edit size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
