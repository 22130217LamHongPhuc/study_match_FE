import type { StudySessionVm } from "../types";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyCalendarProps {
  sessions: StudySessionVm[];
  onSelectSession: (session: StudySessionVm) => void;
  weekOffset: number;
  onWeekOffsetChange: (offset: number) => void;
  loading?: boolean;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWeekRange(offset: number) {
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday + offset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  endOfWeek.setHours(0, 0, 0, 0);

  return {
    startOfWeek,
    endOfWeek,
  };
}

function formatWeekRange(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startDay = start.getDate().toString().padStart(2, "0");
  const startMonth = (start.getMonth() + 1).toString().padStart(2, "0");
  const startYear = start.getFullYear();

  const endDay = end.getDate().toString().padStart(2, "0");
  const endMonth = (end.getMonth() + 1).toString().padStart(2, "0");
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    return `${startDay}/${startMonth} - ${endDay}/${endMonth}/${startYear}`;
  }
  return `${startDay}/${startMonth}/${startYear} - ${endDay}/${endMonth}/${endYear}`;
}

function getDaysOfWeek(offset: number) {
  const { startOfWeek } = getWeekRange(offset);

  const dayLabels = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ Nhật",
  ];
  const dayIndices = [1, 2, 3, 4, 5, 6, 0];

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);

    return {
      label: dayLabels[index],
      dayIndex: dayIndices[index],
      date,
      dateString: date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
    };
  });
}

function getSessionsByDate(sessions: StudySessionVm[], date: Date) {
  const targetDateStr = date.toDateString();
  return sessions.filter(
    (session) => new Date(session.startTime).toDateString() === targetDateStr,
  );
}

export function WeeklyCalendarSkeleton() {
  const dayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-6 w-28 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-52 bg-gray-150 rounded" />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 w-48 bg-gray-200 rounded-lg" />
          <div className="h-9 w-20 bg-gray-200 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {dayLabels.map((label, idx) => (
          <div
            key={idx}
            className="min-h-[380px] rounded-xl border border-gray-150 bg-gray-50/50 p-3 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between shrink-0 mb-1">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-6 bg-gray-150 rounded-lg" />
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <div className="rounded-xl bg-white p-3 border border-gray-100/80 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-10 bg-gray-200 rounded" />
                  <div className="h-3.5 w-8 bg-gray-150 rounded" />
                </div>
                <div className="h-4 w-full bg-gray-200 rounded mt-1" />
                <div className="h-3 w-16 bg-gray-100 rounded mt-0.5" />
              </div>
              {idx % 3 !== 0 && (
                <div className="rounded-xl bg-white p-3 border border-gray-100/80 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                    <div className="h-3.5 w-8 bg-gray-150 rounded" />
                  </div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded mt-1" />
                  <div className="h-3 w-12 bg-gray-100 rounded mt-0.5" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WeeklyCalendar({
  sessions,
  onSelectSession,
  weekOffset,
  onWeekOffsetChange,
  loading,
}: WeeklyCalendarProps) {
  if (loading) {
    return <WeeklyCalendarSkeleton />;
  }
  const { startOfWeek } = getWeekRange(weekOffset);
  const weekRangeLabel = formatWeekRange(startOfWeek);
  const daysOfWeek = getDaysOfWeek(weekOffset);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Lịch tuần</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Tổng quan các buổi học trong tuần
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => onWeekOffsetChange(weekOffset - 1)}
              className="rounded-md p-1.5 hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition"
              title="Tuần trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="px-3 py-1 text-sm font-semibold text-gray-700 min-w-[170px] text-center">
              {weekRangeLabel}
            </div>

            <button
              onClick={() => onWeekOffsetChange(weekOffset + 1)}
              className="rounded-md p-1.5 hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition"
              title="Tuần sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {weekOffset !== 0 && (
            <button
              onClick={() => onWeekOffsetChange(0)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 transition"
            >
              Tuần này
            </button>
          )}

          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
            {sessions.length} buổi
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {daysOfWeek.map((day) => {
          const daySessions = getSessionsByDate(sessions, day.date);
          const isToday = day.date.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.label}
              className={`min-h-[380px] rounded-xl border p-3 flex flex-col transition-all ${
                isToday
                  ? "border-blue-200 bg-blue-50/15 ring-1 ring-blue-100/50 shadow-sm"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="mb-3 flex items-center justify-between shrink-0">
                <span className={`text-xs font-bold ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                  {day.label}{" "}
                  <span className={`text-[10px] font-normal ${isToday ? "text-blue-400" : "text-gray-400"}`}>
                    ({day.dateString})
                  </span>
                </span>
                <span className={`rounded-lg bg-white border border-gray-150 px-2 py-0.5 text-[10px] font-bold ${
                  isToday ? "text-blue-500 border-blue-100 shadow-sm" : "text-gray-500"
                }`}>
                  {daySessions.length}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                {daySessions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/60 px-2 py-6 text-center text-[10px] text-gray-400 font-medium">
                    Trống
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onSelectSession(session)}
                      className="rounded-xl bg-white p-2.5 text-left border border-gray-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-500 shrink-0" />
                          <span className="text-[10px] font-bold text-blue-600">
                            {formatTime(session.startTime)}
                          </span>
                        </div>
                        <span
                          className={`rounded border px-1 py-0.2 text-[8px] font-bold ${
                            session.sessionType === "GROUP"
                              ? "bg-rose-50 border-rose-100 text-rose-600"
                              : "bg-emerald-50 border-emerald-100 text-emerald-600"
                          }`}
                        >
                          {session.sessionType === "GROUP" ? "Nhóm" : "1-1"}
                        </span>
                      </div>
                      <div className="line-clamp-2 text-xs font-bold text-gray-800 mt-2 leading-snug">
                        {session.title}
                      </div>
                      {session.subjectName && (
                        <div className="mt-1.5 inline-block rounded bg-gray-50 px-1.5 py-0.2 text-[9px] font-medium text-gray-500">
                          {session.subjectName}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

