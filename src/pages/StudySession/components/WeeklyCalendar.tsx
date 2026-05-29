import type { StudySessionVm } from "../types";

interface WeeklyCalendarProps {
  sessions: StudySessionVm[];
  onSelectSession: (session: StudySessionVm) => void;
}

const weekDays = [
  { label: "T2", dayIndex: 1 },
  { label: "T3", dayIndex: 2 },
  { label: "T4", dayIndex: 3 },
  { label: "T5", dayIndex: 4 },
  { label: "T6", dayIndex: 5 },
  { label: "T7", dayIndex: 6 },
  { label: "CN", dayIndex: 0 },
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
        <span className="rounded-lg bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
          {sessions.length} buổi
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {weekDays.map((day) => {
          const daySessions = getSessionsByDay(sessions, day.dayIndex);

          return (
            <div
              key={day.label}
              className="min-h-[220px] rounded-xl border border-gray-200 bg-gray-50 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  {day.label}
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
                  {daySessions.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {daySessions.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-400">
                    Trống
                  </div>
                )}

                {daySessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => onSelectSession(session)}
                    className="rounded-lg bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-orange-600">
                        {formatTime(session.startTime)}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          session.sessionType === "GROUP"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {session.sessionType === "GROUP" ? "Nhóm" : "1-1"}
                      </span>
                    </div>
                    <div className="line-clamp-2 text-sm font-semibold text-gray-800">
                      {session.title}
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {session.subjectName || "Chưa có môn học"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
