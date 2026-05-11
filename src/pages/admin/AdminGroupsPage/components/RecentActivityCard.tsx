import { AlertCircle, Globe2, MoreHorizontal, UsersRound } from "lucide-react";

export function RecentActivityCard() {
  return (
    <div className="rounded border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Hoạt động gần đây</h3>
        <MoreHorizontal size={16} className="cursor-pointer text-gray-400" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600">
            <Globe2 size={14} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-800">
              Admin tạo cộng đồng Java
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">10 phút trước</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded bg-violet-50 text-violet-600">
            <UsersRound size={14} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-800">
              Nhóm ôn Java đã đủ thành viên
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">1 giờ trước</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded bg-orange-50 text-orange-500">
            <AlertCircle size={14} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-800">
              Có báo cáo mới từ nhóm Web nâng cao
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">2 giờ trước</p>
          </div>
        </div>
      </div>
    </div>
  );
}
