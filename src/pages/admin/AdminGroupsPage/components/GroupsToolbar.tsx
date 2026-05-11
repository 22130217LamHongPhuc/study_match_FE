import { Plus, Search } from "lucide-react";

export function GroupsToolbar({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quản lý nhóm học</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Quản trị nhóm cộng đồng do Admin tạo và theo dõi nhóm học riêng của
          sinh viên.
        </p>
      </div>

      <div className="flex gap-2">
        <button className="rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-bold shadow-sm transition-all hover:bg-gray-50">
          Xuất dữ liệu
        </button>
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 rounded bg-gray-900 px-3 py-1.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-gray-800"
        >
          <Plus size={14} />
          Tạo cộng đồng
        </button>
      </div>
    </div>
  );
}

export function GroupsFilterBar() {
  return (
    <div className="mt-6 rounded border border-gray-200 bg-white p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="h-8 w-full rounded border border-gray-300 bg-gray-50 pl-9 pr-3 text-[12px] font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
            placeholder="Tìm tên nhóm, môn học, người tạo..."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "Tất cả",
            "Cộng đồng",
            "Nhóm học riêng",
            "Đang hoạt động",
            "Cần xử lý",
          ].map((item, index) => (
            <button
              key={item}
              className={`rounded px-3 py-1.5 text-[12px] font-bold transition-colors ${
                index === 0
                  ? "bg-blue-400 text-white shadow-sm"
                  : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
