import { Search } from "lucide-react";
import type {
  ScheduleStatus,
  StudyMode,
  ScheduleType,
  TimeFilter,
} from "../types";

// ── Filter options ──────────────────────────────────────────────
const statusOptions: Array<{ label: string; value: ScheduleStatus | null }> = [
  { label: "Tất cả", value: null },
  { label: "Sắp diễn ra", value: "SCHEDULED" },
  { label: "Đang diễn ra", value: "ONGOING" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

const modeOptions: Array<{ label: string; value: StudyMode | null }> = [
  { label: "Tất cả", value: null },
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
  { label: "Hybrid", value: "HYBRID" },
];

const typeOptions: Array<{ label: string; value: ScheduleType | null }> = [
  { label: "Tất cả", value: null },
  { label: "Học nhóm", value: "GROUP" },
  { label: "Học 1-1", value: "ONE_ON_ONE" },
];

const timeOptions: Array<{ label: string; value: TimeFilter }> = [
  { label: "Tất cả", value: "ALL" },
  { label: "Hôm nay", value: "TODAY" },
  { label: "Tuần này", value: "THIS_WEEK" },
  { label: "Tháng này", value: "THIS_MONTH" },
];

// ── Props ───────────────────────────────────────────────────────
type SchedulesFilterBarProps = {
  keyword: string;
  setKeyword: (keyword: string) => void;
  statusFilter: ScheduleStatus | null;
  onStatusChange: (value: ScheduleStatus | null) => void;
  modeFilter: StudyMode | null;
  onModeChange: (value: StudyMode | null) => void;
  typeFilter: ScheduleType | null;
  onTypeChange: (value: ScheduleType | null) => void;
  timeFilter: TimeFilter;
  onTimeChange: (value: TimeFilter) => void;
};

export function SchedulesFilterBar({
  keyword,
  setKeyword,
  statusFilter,
  onStatusChange,
  modeFilter,
  onModeChange,
  typeFilter,
  onTypeChange,
  timeFilter,
  onTimeChange,
}: SchedulesFilterBarProps) {
  return (
    <div className="rounded-lg border border-sand-200 bg-white p-3">
      <div className="flex flex-col gap-3">
        {/* Search row */}
        <div className="relative w-full lg:max-w-md">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
          />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50 pl-9 pr-3 text-sm font-medium text-sand-800 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
            placeholder="Tìm tên buổi học, nhóm học, người tạo..."
          />
        </div>

        {/* Filter rows */}
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-sand-400">
              Trạng thái
            </span>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value ?? "all"}
                  type="button"
                  onClick={() => onStatusChange(opt.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === opt.value
                      ? "border-sand-800 bg-sand-900 text-white"
                      : "border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden xl:block h-4 w-px bg-sand-200" />

          {/* Mode filter */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-sand-400">
              Hình thức
            </span>
            <div className="flex flex-wrap gap-1.5">
              {modeOptions.map((opt) => (
                <button
                  key={opt.value ?? "all"}
                  type="button"
                  onClick={() => onModeChange(opt.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    modeFilter === opt.value
                      ? "border-sand-800 bg-sand-900 text-white"
                      : "border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden xl:block h-4 w-px bg-sand-200" />

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-sand-400">
              Loại lịch
            </span>
            <div className="flex flex-wrap gap-1.5">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value ?? "all"}
                  type="button"
                  onClick={() => onTypeChange(opt.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    typeFilter === opt.value
                      ? "border-sand-800 bg-sand-900 text-white"
                      : "border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden xl:block h-4 w-px bg-sand-200" />

          {/* Time filter */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-sand-400">
              Thời gian
            </span>
            <select
              value={timeFilter}
              onChange={(e) => onTimeChange(e.target.value as TimeFilter)}
              className="h-8 rounded-lg border border-sand-300 bg-sand-50 px-3 text-xs font-medium text-sand-700 outline-none focus:border-accent-600"
            >
              {timeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
