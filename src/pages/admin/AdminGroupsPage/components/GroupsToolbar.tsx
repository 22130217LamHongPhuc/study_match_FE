import { Plus, Search } from "lucide-react";
import { FilterGroup } from "../types";

export function GroupsToolbar({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-sand-900">Quản lý nhóm học</h1>
        <p className="mt-0.5 text-sm text-sand-500">
          Quản trị nhóm cộng đồng do Admin tạo và theo dõi nhóm học riêng của
          sinh viên.
        </p>
      </div>

      <div className="flex gap-2">
        {/* <button className="rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50">
          Xuất dữ liệu
        </button> */}
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#2563eb] shadow-md shadow-[#3b82f6]/20"
        >
          <Plus size={14} />
          Tạo cộng đồng
        </button>
      </div>
    </div>
  );
}

export function GroupsFilterBar({
  filters,
  onFilterChange,
  selectedFilter,
  setKeyword,
  keyword,
}: {
  filters: FilterGroup[];
  onFilterChange: (filter: FilterGroup) => void;
  selectedFilter: FilterGroup;
  setKeyword: (keyword: string) => void;
  keyword: string;
}) {
  return (
    <div className="mt-6 rounded-lg border border-sand-200 bg-white p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
          />
          <input
            className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50 pl-9 pr-3 text-sm font-medium text-sand-800 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
            placeholder="Tìm tên nhóm, môn học, người tạo..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item, index) => (
            <button
              key={item.title}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${selectedFilter.title === item.title
                  ? "bg-[#3b82f6] text-white shadow-sm shadow-[#3b82f6]/20"
                  : "border border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
                }`}
              onClick={() => onFilterChange(item)}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
