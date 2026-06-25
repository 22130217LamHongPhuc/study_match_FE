import { FileDown } from "lucide-react";
import { DateRangeFilter } from "./DateRangeFilter";

type AIMatchingHeaderProps = {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onFilter: () => void;
};

export function AIMatchingHeader({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onFilter,
}: AIMatchingHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-sand-900">AI Matching</h1>
        <p className="mt-0.5 text-sm text-sand-500">
          Theo dõi hiệu quả gợi ý học tập, hành động ghép đôi và phản hồi từ
          người dùng
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
          onFilter={onFilter}
        />

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
        >
          <FileDown size={14} />
          Xuất dữ liệu
        </button>
      </div>
    </div>
  );
}
