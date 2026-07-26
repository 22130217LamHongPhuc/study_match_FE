import React from "react";
import { Plus, Download, Search } from "lucide-react";

interface SubjectToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddClick: () => void;
  onImportClick: () => void;
}

export function SubjectToolbar({
  search,
  onSearchChange,
  onAddClick,
  onImportClick,
}: SubjectToolbarProps) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-sand-900">
            Quản lý Môn học
          </h1>
          <p className="mt-0.5 text-sm text-sand-500">
            Thiết lập danh mục các môn học chính khóa trong hệ thống phục vụ Matching và Tạo nhóm học.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onImportClick}
            className="flex h-9 items-center gap-2 rounded-lg border border-sand-300 bg-white px-4 text-sm font-semibold text-sand-700 hover:bg-sand-50 transition-colors shadow-sm"
          >
            <Download size={14} />
            <span>Import dữ liệu</span>
          </button>
          <button
            type="button"
            onClick={onAddClick}
            className="flex h-9 items-center gap-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] px-4 text-sm font-semibold text-white transition-all shadow-md shadow-[#3b82f6]/10"
          >
            <Plus size={14} />
            <span>Thêm môn học</span>
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-sand-200 bg-white p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50 pl-9 pr-3 text-sm text-sand-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white"
              placeholder="Tìm theo Mã môn hoặc Tên môn học..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
