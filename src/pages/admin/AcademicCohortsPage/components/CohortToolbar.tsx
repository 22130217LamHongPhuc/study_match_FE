import React from "react";
import { Plus } from "lucide-react";

interface CohortToolbarProps {
  onAddClick: () => void;
}

export function CohortToolbar({ onAddClick }: CohortToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-sand-900">Quản lý Khóa học</h1>
        <p className="mt-0.5 text-sm text-sand-500">
          Thiết lập khóa học sinh viên (K48, K49...), niên khóa và chương trình đào tạo áp dụng tương ứng.
        </p>
      </div>
      <div>
        <button
          type="button"
          onClick={onAddClick}
          className="flex h-9 items-center gap-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] px-4 text-sm font-semibold text-white transition-all shadow-md shadow-[#3b82f6]/10"
        >
          <Plus size={14} />
          <span>Thêm khóa học</span>
        </button>
      </div>
    </div>
  );
}
