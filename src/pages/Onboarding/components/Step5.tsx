import { DayId, FormData, SlotId } from "./types";
import { DAYS, SLOTS } from "./constants";

interface Step5Props {
  data: FormData;
  update: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function Step5({ data, update }: Step5Props) {
  const toggle = (dayId: DayId, slotId: SlotId): void => {
    update("freeTime", {
      ...data.freeTime,
      [dayId]: {
        ...data.freeTime[dayId],
        [slotId]: !data.freeTime[dayId][slotId],
      },
    });
  };

  const selectAll = (slotId: SlotId): void => {
    const allOn = DAYS.every((d) => data.freeTime[d.id][slotId]);
    const updated = { ...data.freeTime };
    DAYS.forEach((d) => {
      updated[d.id] = { ...updated[d.id], [slotId]: !allOn };
    });
    update("freeTime", updated);
  };

  const totalSelected = DAYS.reduce(
    (acc, d) => acc + Object.values(data.freeTime[d.id]).filter(Boolean).length,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Chọn các khung giờ rảnh trong tuần để hệ thống ghép bạn học cùng lịch.
        </p>
        {totalSelected > 0 && (
          <span className="text-xs font-semibold text-accent border border-accent px-2 py-1 rounded-full whitespace-nowrap bg-white">
            {totalSelected} slot
          </span>
        )}
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-max">
          <thead>
            <tr>
              <th className="w-16 pb-3"></th>
              {SLOTS.map((s) => (
                <th key={s.id} className="pb-3 text-center px-3">
                  <button
                    onClick={() => selectAll(s.id)}
                    className="flex flex-col items-center gap-1 mx-auto group"
                    title={`Chọn tất cả ${s.label}`}
                  >
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-accent">
                      {s.label}
                    </span>
                    <span className="text-xs text-gray-400">{s.time}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((d, di) => {
              const daySlots = data.freeTime[d.id];
              const dayCount = Object.values(daySlots).filter(Boolean).length;
              return (
                <tr
                  key={d.id}
                  className={di % 2 === 0 ? "bg-gray-50 rounded-xl" : ""}
                >
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-700">
                        {d.short}
                      </span>
                      {dayCount > 0 && (
                        <span className="w-4 h-4 rounded-full border border-accent text-accent text-xs flex items-center justify-center font-bold bg-white">
                          {dayCount}
                        </span>
                      )}
                    </div>
                  </td>
                  {SLOTS.map((s) => {
                    const active = daySlots[s.id];
                    return (
                      <td key={s.id} className="py-2 px-2 text-center">
                        <button
                          onClick={() => toggle(d.id, s.id)}
                          className={`w-full py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-100 bg-white ${
                            active
                              ? "border-accent text-accent"
                              : "border-gray-200 text-gray-300 hover:border-accent/40"
                          }`}
                        >
                          {active ? "✓" : "—"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 pt-1">
        Nhấn vào tiêu đề cột để chọn cả ngày
      </p>
    </div>
  );
}
