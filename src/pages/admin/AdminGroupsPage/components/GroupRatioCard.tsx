import { MoreHorizontal } from "lucide-react";

export function GroupRatioCard() {
  return (
    <div className="rounded-lg border border-sand-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-sand-800">Tỷ lệ loại nhóm</h3>
        <MoreHorizontal size={16} className="cursor-pointer text-sand-400" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-sand-600">
              Nhóm học riêng
            </span>
            <span className="text-xs font-medium text-sand-500">81%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sand-100">
            <div className="h-full w-[81%] bg-accent-600" />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-sand-600">
              Cộng đồng
            </span>
            <span className="text-xs font-medium text-sand-500">19%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sand-100">
            <div className="h-full w-[19%] bg-sand-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
