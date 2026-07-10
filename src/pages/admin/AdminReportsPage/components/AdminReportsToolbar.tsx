import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "../../../../services/reportApi";
import {
  REPORT_REASON_FILTER_OPTIONS,
  REPORT_STATUS_FILTER_OPTIONS,
  REPORT_TARGET_TYPE_FILTER_OPTIONS,
} from "../utils";

type AdminReportsToolbarProps = {
  statusFilter: ReportStatus | null;
  targetTypeFilter: ReportTargetType | null;
  reasonFilter: ReportReason | null;
  onStatusChange: (value: ReportStatus | null) => void;
  onTargetTypeChange: (value: ReportTargetType | null) => void;
  onReasonChange: (value: ReportReason | null) => void;
};

export function AdminReportsToolbar({
  statusFilter,
  targetTypeFilter,
  reasonFilter,
  onStatusChange,
  onTargetTypeChange,
  onReasonChange,
}: AdminReportsToolbarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-sand-900">
          Quản lý báo cáo
        </h1>
        <p className="mt-0.5 text-sm text-sand-500">
          Xem xét và xử lý các báo cáo vi phạm từ người dùng
        </p>
      </div>

      <div className="rounded-lg border border-sand-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FilterSelect
            label="Trạng thái"
            value={statusFilter ?? "all"}
            onChange={(value) =>
              onStatusChange(value === "all" ? null : (value as ReportStatus))
            }
            options={REPORT_STATUS_FILTER_OPTIONS}
          />

          <FilterSelect
            label="Loại đối tượng"
            value={targetTypeFilter ?? "all"}
            onChange={(value) =>
              onTargetTypeChange(
                value === "all" ? null : (value as ReportTargetType),
              )
            }
            options={REPORT_TARGET_TYPE_FILTER_OPTIONS}
          />

          <FilterSelect
            label="Lý do"
            value={reasonFilter ?? "all"}
            onChange={(value) =>
              onReasonChange(value === "all" ? null : (value as ReportReason))
            }
            options={REPORT_REASON_FILTER_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string | null }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-sand-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-sand-300 bg-sand-50 px-3 text-sm font-medium text-sand-700 outline-none transition-colors focus:border-accent-600 focus:bg-white"
      >
        {options.map((option) => (
          <option
            key={option.value ?? "all"}
            value={option.value ?? "all"}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
