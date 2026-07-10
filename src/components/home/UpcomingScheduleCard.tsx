import React from "react";
import { StudySessionResponse } from "../../pages/StudySession/types";
import icon1 from "../../assets/img/icon1.png";

interface UpcomingScheduleCardProps {
  schedules: StudySessionResponse[];
  onViewCalendar?: () => void;
  onViewDetails?: (session: StudySessionResponse) => void;
}

export default function UpcomingScheduleCard({
  schedules,
  onViewCalendar,
  onViewDetails,
}: UpcomingScheduleCardProps) {
  const formatDateTime = (startTimeStr: string, endTimeStr: string) => {
    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);
    const pad = (num: number) => String(num).padStart(2, "0");
    const dateStr = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}`;
    const timeRangeStr = `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
    return `${dateStr}, ${timeRangeStr}`;
  };

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

        <div className="mt-4">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <img
              src={icon1}
              alt="Hôm nay chưa có lịch học"
              className="mx-auto mb-4 h-24 w-auto object-contain mix-blend-multiply"
            />
            <p className="mt-2 text-sm font-semibold text-gray-600">
              Hôm nay chưa có lịch học
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Bạn có thể tạo lịch mới hoặc chờ nhóm trưởng tạo lịch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
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

      <div className="divide-y divide-gray-100">
        {schedules.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewDetails?.(item)}
            className="cursor-pointer py-3 space-y-1 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
          >
            <h4 className="text-sm font-bold text-gray-850 line-clamp-1">
              {item.title}
            </h4>

            {item.subjectName && (
              <div className="text-[11px]">
                <span className="font-semibold text-gray-400 mr-1.5">Môn học:</span>
                <span className="text-gray-600">{item.subjectName}</span>
              </div>
            )}

            {item.sessionType === "GROUP" && item.groupName && (
              <div className="text-[11px]">
                <span className="font-semibold text-gray-400 mr-1.5">Nhóm:</span>
                <span className="text-gray-600">{item.groupName}</span>
              </div>
            )}

            <div className="text-[11px]">
              <span className="font-semibold text-gray-400 mr-1.5">Thời gian:</span>
              <span className="text-gray-600">{formatDateTime(item.startTime, item.endTime)}</span>
            </div>

            {item.description && (
              <div className="text-[11px] truncate">
                <span className="font-semibold text-gray-400 mr-1.5">Ghi chú:</span>
                <span className="text-gray-600" title={item.description}>
                  {item.description}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
