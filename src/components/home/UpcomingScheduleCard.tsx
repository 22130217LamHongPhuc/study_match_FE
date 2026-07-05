import React from "react";

export interface ScheduleItem {
  id: number;
  title: string;
  dateTime: string;
  isOnline: boolean;
  locationOrUrl: string;
}

interface UpcomingScheduleCardProps {
  schedules: ScheduleItem[];
  onViewCalendar?: () => void;
  onViewDetails?: (id: number) => void;
}

export default function UpcomingScheduleCard({
  schedules,
  onViewCalendar,
  onViewDetails,
}: UpcomingScheduleCardProps) {
  if (schedules.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="font-bold text-gray-800 text-sm">
            Lịch học sắp tới
          </h3>
          <button
            onClick={onViewCalendar}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
          >
            Xem lịch
          </button>
        </div>

        <div className="py-8 text-center">
          <p className="text-xs font-medium text-gray-500">
            Bạn chưa có lịch học nào sắp tới.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h3 className="font-bold text-gray-800 text-sm">
          Lịch học sắp tới
        </h3>
        <button
          onClick={onViewCalendar}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
        >
          Xem lịch
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {schedules.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewDetails?.(item.id)}
            className="group cursor-pointer rounded-xl border border-gray-50 bg-sand-50/50 p-3.5 transition-all duration-250 hover:border-orange-100 hover:bg-orange-50/20"
          >
            <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-orange-700 transition-colors">
              {item.title}
            </h4>

            <div className="mt-2.5 space-y-1.5 text-[11px] text-gray-500">
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-400">Thời gian:</span>
                <span>{item.dateTime}</span>
              </div>
              <div className="flex items-start gap-1">
                {item.isOnline ? (
                  <>
                    <span className="text-blue-600 font-bold bg-blue-50/50 px-1 py-0.5 rounded-xs shrink-0">
                      Online
                    </span>
                    <span className="text-gray-500 truncate">{item.locationOrUrl}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sage-700 font-bold bg-sage-50 px-1 py-0.5 rounded-xs shrink-0">
                      Offline
                    </span>
                    <span className="text-gray-500 truncate">{item.locationOrUrl}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
