import React from "react";
import { Edit, Trash2, Library } from "lucide-react";
import { Cohort } from "../types";

interface CohortTableProps {
  cohorts: Cohort[];
  loading: boolean;
  onEditClick: (cohort: Cohort) => void;
  onDeleteClick: (cohortId: number) => void;
}

export function CohortTable({ cohorts, loading, onEditClick, onDeleteClick }: CohortTableProps) {
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
                Tên khóa (Cohort Code)
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Năm bắt đầu
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Thời gian đào tạo (Năm)
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Chương trình áp dụng
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500 w-32 text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-sand-100 last:border-b-0 animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-6 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-12 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-8 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-sand-200 rounded" /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : cohorts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-sand-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Library size={24} className="text-sand-400" />
                    <p className="font-semibold text-sand-800">Không tìm thấy khóa học nào</p>
                    <p className="text-xs text-sand-500">
                      Hãy thêm mới khóa học để thiết lập sinh viên.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              cohorts.map((cohort, idx) => (
                <tr
                  key={cohort.cohortId}
                  className="border-b border-sand-100 last:border-b-0 hover:bg-sand-50/50"
                >
                  <td className="px-4 py-3 text-xs font-medium text-sand-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-sand-800">
                    {cohort.cohortCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-700">
                    {cohort.startAcademicYear}
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-700">
                    {cohort.totalStudyYears}
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-700">
                    {cohort.curriculum ? (
                      <span className="text-sand-800 font-medium">
                        {cohort.curriculum.curriculumName}
                      </span>
                    ) : (
                      <span className="text-sand-400 italic">Chưa áp dụng</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditClick(cohort)}
                        className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                        title="Sửa khóa học"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteClick(cohort.cohortId)}
                        className="rounded p-1.5 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                        title="Xóa khóa học"
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
    </div>
  );
}
