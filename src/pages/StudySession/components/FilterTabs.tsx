import type { ScheduleFilter } from "../types";

interface FilterTabsProps {
  activeFilter: ScheduleFilter;
  onChange: (filter: ScheduleFilter) => void;
}

const filters: Array<{ label: string; value: ScheduleFilter }> = [
  { label: "Tất cả", value: "ALL" },
  { label: "1-1", value: "USER_PAIR" },
  { label: "Nhóm", value: "GROUP" },
  { label: "Chờ xác nhận", value: "PENDING" },
];

export function FilterTabs({ activeFilter, onChange }: FilterTabsProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
