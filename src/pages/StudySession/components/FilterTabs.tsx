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
    <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
