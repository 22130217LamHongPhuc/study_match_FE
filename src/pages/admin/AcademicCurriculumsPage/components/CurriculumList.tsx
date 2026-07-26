import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Curriculum } from "../types";

interface CurriculumListProps {
  curriculums: Curriculum[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onEdit: (curriculum: Curriculum) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

export function CurriculumList({
  curriculums,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  loading,
}: CurriculumListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-sand-200 bg-white">
      <div className="border-b border-sand-200 bg-sand-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-sand-800">Danh sách Chương trình học</h2>
      </div>

      <div className="divide-y divide-sand-100 max-h-[600px] overflow-y-auto">
        {loading && curriculums.length === 0 ? (
          <div className="p-8 text-center text-xs text-sand-500 animate-pulse">
            Đang tải chương trình học...
          </div>
        ) : curriculums.length === 0 ? (
          <div className="p-8 text-center text-xs text-sand-500">
            Chưa có chương trình nào.
          </div>
        ) : (
          curriculums.map((curr) => {
            const isSelected = selectedId === curr.curriculumId;
            return (
              <div
                key={curr.curriculumId}
                onClick={() => onSelect(curr.curriculumId)}
                className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isSelected ? "bg-sand-100/75 border-l-4 border-[#3b82f6]" : "hover:bg-sand-50/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sand-800 truncate">
                    {curr.curriculumName}
                  </p>
                  <p className="text-xs text-sand-500 mt-0.5">
                    Mã CT: {curr.curriculumCode}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onEdit(curr)}
                    className="rounded p-1 text-sand-400 hover:bg-sand-200 hover:text-sand-600 transition-colors"
                    title="Sửa chương trình"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(curr.curriculumId)}
                    className="rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    title="Xóa chương trình"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
