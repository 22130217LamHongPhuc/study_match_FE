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
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Lịch tuần</h2>
          <p className="text-sm text-slate-500">
            Tổng quan các buổi học trong tuần
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {sessions.length} buổi
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {weekDays.map((day) => {
          const daySessions = getSessionsByDay(sessions, day.dayIndex);

          return (
            <div
              key={day.label}
              className="min-h-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  {day.label}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                  {daySessions.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {daySessions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-400">
                    Trống
                  </div>
                )}

                {daySessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => onSelectSession(session)}
                    className="rounded-2xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-blue-600">
                        {formatTime(session.startTime)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          session.sessionType === "GROUP"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {session.sessionType === "GROUP" ? "Nhóm" : "1-1"}
                      </span>
                    </div>
                    <div className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {session.title}
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-slate-500">
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
