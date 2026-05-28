import type { StudySessionVm } from "../types";

interface TodaySessionListProps {
  sessions: StudySessionVm[];
  onSelectSession: (session: StudySessionVm) => void;
}

function formatTimeRange(start: string, end: string) {
  const startText = new Date(start).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endText = new Date(end).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startText} - ${endText}`;
}

function getModeLabel(mode: string) {
  if (mode === "ONLINE") return "Online";
  if (mode === "OFFLINE") return "Trực tiếp";
  return "Kết hợp";
}

export function TodaySessionList({
  sessions,
  onSelectSession,
}: TodaySessionListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">Buổi học hôm nay</h2>
        <p className="text-sm text-slate-500">
          Các lịch học cần chú ý trong ngày
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {sessions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Hôm nay chưa có lịch học
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Bạn có thể tạo lịch mới hoặc chờ nhóm trưởng tạo lịch.
            </p>
          </div>
        )}

        {sessions.map((session) => (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelectSession(session)}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-blue-700">
                  {formatTimeRange(session.startTime, session.endTime)}
                </div>
                <div className="mt-1 text-base font-bold text-slate-900">
                  {session.title}
                </div>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {getModeLabel(session.studyMode)}
              </span>
            </div>

            <div className="space-y-1 text-sm text-slate-600">
              <p>Môn: {session.subjectName || "Chưa cập nhật"}</p>
              <p>
                {session.sessionType === "GROUP"
                  ? `Nhóm: ${session.groupName || "Nhóm học"}`
                  : `Với: ${session.partnerName || "Bạn học"}`}
              </p>
              <p>
                {session.studyMode === "ONLINE"
                  ? "Học qua video call"
                  : session.location || "Chưa cập nhật địa điểm"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
