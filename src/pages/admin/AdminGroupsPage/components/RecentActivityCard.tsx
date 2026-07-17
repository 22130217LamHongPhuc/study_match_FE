import { AlertCircle, Globe2, MoreHorizontal, UsersRound } from "lucide-react";

export function RecentActivityCard() {
  return (
    <div className="rounded-lg border border-sand-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-sand-800">Hoạt động gần đây</h3>
        <MoreHorizontal size={16} className="cursor-pointer text-sand-400" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded bg-accent-50 text-accent-600">
            <Globe2 size={14} />
          </div>
          <div>
            <p className="text-xs font-medium text-sand-700">
              Admin tạo cộng đồng Java
            </p>
            <p className="mt-0.5 text-xs text-sand-400">10 phút trước</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded bg-sand-100 text-sand-600">
            <UsersRound size={14} />
          </div>
          <div>
            <p className="text-xs font-medium text-sand-700">
              Nhóm ôn Java đã đủ thành viên
            </p>
            <p className="mt-0.5 text-xs text-sand-400">1 giờ trước</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-500">
            <AlertCircle size={14} />
          </div>
          <div>
            <p className="text-xs font-medium text-sand-700">
              Có báo cáo mới từ nhóm Web nâng cao
            </p>
            <p className="mt-0.5 text-xs text-sand-400">2 giờ trước</p>
          </div>
        </div>
      </div>
    </div>
  );
}
