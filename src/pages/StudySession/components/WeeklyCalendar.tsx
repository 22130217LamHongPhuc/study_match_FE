import type { StudySessionVm } from "../types";
import { Clock } from "lucide-react";

interface WeeklyCalendarProps {
  sessions: StudySessionVm[];
  onSelectSession: (session: StudySessionVm) => void;
}

const weekDays = [
  { label: "Thứ 2", dayIndex: 1 },
  { label: "Thứ 3", dayIndex: 2 },
  { label: "Thứ 4", dayIndex: 3 },
  { label: "Thứ 5", dayIndex: 4 },
  { label: "Thứ 6", dayIndex: 5 },
  { label: "Thứ 7", dayIndex: 6 },
  { label: "Chủ Nhật", dayIndex: 0 },
];

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSessionsByDay(sessions: StudySessionVm[], dayIndex: number) {
  return sessions.filter(
    (session) => new Date(session.startTime).getDay() === dayIndex,
  );
}

export function WeeklyCalendar({
  sessions,
  onSelectSession,
}: WeeklyCalendarProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Lịch tuần</h2>
          <p className="text-sm text-gray-500">
            Tổng quan các buổi học trong tuần
          </p>
        </div>
        <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
          {sessions.length} buổi
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {weekDays.map((day) => {
          const daySessions = getSessionsByDay(sessions, day.dayIndex);

          return (
            <div
              key={day.label}
              className="min-h-[220px] rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col"
            >
              <div className="mb-4 flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-gray-700">
                  {day.label}
                </span>
                <span className="rounded-lg bg-white border border-gray-150 px-2.5 py-0.5 text-xs font-bold text-gray-500">
                  {daySessions.length}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {daySessions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/60 px-3 py-6 text-center text-xs text-gray-400 font-medium">
                    Trống
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onSelectSession(session)}
                      className="rounded-xl bg-white p-3.5 text-left border border-gray-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-bold text-blue-600">
                            {formatTime(session.startTime)}
                          </span>
                        </div>
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${
                            session.sessionType === "GROUP"
                              ? "bg-rose-50 border-rose-100 text-rose-600"
                              : "bg-emerald-50 border-emerald-100 text-emerald-600"
                          }`}
                        >
                          {session.sessionType === "GROUP" ? "Nhóm" : "1-1"}
                        </span>
                      </div>
                      <div className="line-clamp-2 text-sm font-bold text-gray-800 mt-2.5 leading-snug">
                        {session.title}
                      </div>
                      {session.subjectName && (
                        <div className="mt-2 inline-block rounded bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          {session.subjectName}
                        </div>
                      )}
                      <div className="mt-2 text-[10px] font-medium text-gray-400">
                        {session.sessionType === "GROUP"
                          ? `Nhóm: ${session.groupName || "Nhóm học"}`
                          : `Với: ${session.partnerName || "Bạn học"}`}
                      </div>
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
