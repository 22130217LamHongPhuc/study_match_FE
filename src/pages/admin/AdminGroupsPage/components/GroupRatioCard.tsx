import { MoreHorizontal } from "lucide-react";

export function GroupRatioCard() {
  return (
    <div className="rounded border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Tỷ lệ loại nhóm</h3>
        <MoreHorizontal size={16} className="cursor-pointer text-gray-400" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-bold text-gray-700">
              Nhóm học riêng
            </span>
            <span className="text-[11px] font-bold text-gray-400">81%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-[81%] bg-blue-600" />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-bold text-gray-700">
              Cộng đồng
            </span>
            <span className="text-[11px] font-bold text-gray-400">19%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-[19%] bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
