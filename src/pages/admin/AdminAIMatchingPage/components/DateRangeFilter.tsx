import { CalendarDays, Filter } from "lucide-react";

type DateRangeFilterProps = {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onFilter: () => void;
};

export function DateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onFilter,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <CalendarDays
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className="h-9 rounded-lg border border-sand-300 bg-sand-50 pl-9 pr-3 text-sm font-medium text-sand-700 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
        />
      </div>

      <span className="text-xs font-medium text-sand-400">đến</span>

      <div className="relative">
        <CalendarDays
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className="h-9 rounded-lg border border-sand-300 bg-sand-50 pl-9 pr-3 text-sm font-medium text-sand-700 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
        />
      </div>

      <button
        type="button"
        onClick={onFilter}
        className="flex items-center gap-1.5 rounded-lg bg-sand-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sand-800"
      >
        <Filter size={14} />
        Lọc
      </button>
    </div>
  );
}
