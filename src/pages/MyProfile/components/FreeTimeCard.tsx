import { ProfileViewModel } from "../types";
import { Calendar } from "lucide-react";

interface FreeTimeCardProps {
  profile: ProfileViewModel;
}

export default function FreeTimeCard({ profile }: FreeTimeCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="border-b border-gray-100 pb-3 mb-4">
        <h3 className="text-base font-bold text-gray-800">Khung giờ rảnh</h3>
      </div>

      {profile.freeTimeGroups.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          Chưa cấu hình khung giờ rảnh nào.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {profile.freeTimeGroups.map((group) => (
            <div
              key={group.dayId}
              className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2"
            >
              <div className="border-b border-gray-200 pb-1 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold text-gray-700">
                  {group.dayLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.slots.map((slot) => (
                  <span
                    key={slot.id}
                    className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                  >
                    {slot.label} ({slot.time})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
