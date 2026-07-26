import type { ScheduleFilter } from "../types";

interface FilterTabsProps {
  activeFilter: ScheduleFilter;
  onChange: (filter: ScheduleFilter) => void;
}

const filters: Array<{ label: string; value: ScheduleFilter }> = [
  { label: "Tất cả", value: "ALL" },
  { label: "Lịch 1-1", value: "USER_PAIR" },
  { label: "Lịch nhóm", value: "GROUP" },
  { label: "Chờ xác nhận", value: "PENDING" },
];

export function FilterTabs({ activeFilter, onChange }: FilterTabsProps) {
  return (
    <div className="inline-flex items-center p-1 bg-white border border-gray-200/80 shadow-sm rounded-full gap-1 self-start sm:self-auto">
      {filters.map((filter) => {
        const active = activeFilter === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              active
                ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
                : "text-gray-500 hover:text-gray-700 bg-transparent border border-transparent"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
