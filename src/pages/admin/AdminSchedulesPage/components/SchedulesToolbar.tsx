import { RefreshCw, FileDown } from "lucide-react";

type SchedulesToolbarProps = {
  onRefresh: () => void;
};

export function SchedulesToolbar({ onRefresh }: SchedulesToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-sand-900">
          Quản lý lịch học
        </h1>
        <p className="mt-0.5 text-sm text-sand-500">
          Theo dõi, chỉnh sửa và quản lý các buổi học trong hệ thống
          StudyMatch.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
        {/* <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-sand-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sand-800"
        >
          <FileDown size={14} />
          Xuất báo cáo
        </button> */}
      </div>
    </div>
  );
}
