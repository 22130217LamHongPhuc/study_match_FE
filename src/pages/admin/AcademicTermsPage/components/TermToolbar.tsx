import React from "react";
import { Plus } from "lucide-react";

interface TermToolbarProps {
  onAddClick: () => void;
}

export function TermToolbar({ onAddClick }: TermToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-sand-900">Cài đặt Học kỳ</h1>
        <p className="mt-0.5 text-sm text-sand-500">
          Thiết lập niên khóa học kỳ và chỉ định học kỳ hoạt động hiện tại để kích hoạt matching.
        </p>
      </div>
      <div>
        <button
          type="button"
          onClick={onAddClick}
          className="flex h-9 items-center gap-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] px-4 text-sm font-semibold text-white transition-all shadow-md shadow-[#3b82f6]/10"
        >
          <Plus size={14} />
          <span>Tạo học kỳ mới</span>
        </button>
      </div>
    </div>
  );
}
