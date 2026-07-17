import { ProfileViewModel } from "../types";

interface ScheduleTableProps {
  profile: ProfileViewModel;
}

function getClassBadgeClass(scheduleType: string) {
  if (scheduleType === "MAIN_SUBJECT") {
    return "bg-blue-50 text-blue-700 border border-blue-200 font-semibold";
  }
  return "bg-gray-100 text-gray-600 border border-gray-200 font-medium";
}

export default function ScheduleTable({ profile }: ScheduleTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="border-b border-gray-100 pb-3 mb-4">
        <h3 className="text-base font-bold text-gray-800">Thời khóa biểu tuần</h3>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 min-w-[130px]">
                Khung giờ
              </th>
              {profile.dayHeaders.map((day) => (
                <th
                  key={day.id}
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 min-w-[140px]"
                >
                  {day.short}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {profile.scheduleRows.map((row) => (
              <tr
                key={row.slot.id}
                className="hover:bg-blue-50/10 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-bold text-gray-800">
                    {row.slot.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {row.slot.time}
                  </div>
                </td>

                {row.cells.map((cell) => (
                  <td
                    key={`${row.slot.id}-${cell.dayId}`}
                    className="px-4 py-3 text-center"
                  >
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {cell.classes.map((item) => (
                        <span
                          key={item.id}
                          title={item.subjectName}
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${getClassBadgeClass(
                            item.scheduleType
                          )}`}
                        >
                          {item.subjectCode}
                        </span>
                      ))}

                      {cell.isFree && (
                        <span className="inline-flex items-center rounded bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Rảnh
                        </span>
                      )}

                      {cell.classes.length === 0 && !cell.isFree && (
                        <span className="text-gray-300">-</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
