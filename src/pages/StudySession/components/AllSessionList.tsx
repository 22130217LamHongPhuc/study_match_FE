import type { StudySessionVm } from "../types";

interface AllSessionListProps {
  sessions: StudySessionVm[];
  onSelectSession: (session: StudySessionVm) => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
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

function getStatusStyle(status: string) {
  if (status === "PENDING")
    return "bg-amber-50 text-amber-700 border-amber-100";
  if (status === "ACCEPTED")
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "DECLINED") return "bg-rose-50 text-rose-700 border-rose-100";
  return "bg-slate-50 text-slate-600 border-slate-100";
}

function getStatusLabel(status: string) {
  if (status === "PENDING") return "Chờ xác nhận";
  if (status === "ACCEPTED") return "Đã xác nhận";
  if (status === "JOINED") return "Đã tham gia";
  if (status === "DECLINED") return "Đã từ chối";
  return status;
}

export function AllSessionList({
  sessions,
  onSelectSession,
}: AllSessionListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tất cả buổi học</h2>
          <p className="text-sm text-slate-500">
            Danh sách lịch học 1-1 và nhóm
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {sessions.length} buổi
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="hidden grid-cols-[1.1fr_1.5fr_1fr_1fr_1fr] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 md:grid">
          <div>Thời gian</div>
          <div>Nội dung</div>
          <div>Loại</div>
          <div>Hình thức</div>
          <div>Trạng thái</div>
        </div>

        <div className="divide-y divide-slate-100">
          {sessions.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500">
              Không có lịch học phù hợp với bộ lọc hiện tại.
            </div>
          )}

          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session)}
              className="grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[1.1fr_1.5fr_1fr_1fr_1fr] md:items-center"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {formatDate(session.startTime)}
                </div>
                <div className="text-sm text-slate-500">
                  {formatTimeRange(session.startTime, session.endTime)}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-900">
                  {session.title}
                </div>
                <div className="text-sm text-slate-500">
                  {session.subjectName || "Chưa cập nhật môn học"}
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    session.sessionType === "GROUP"
                      ? "bg-violet-50 text-violet-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {session.sessionType === "GROUP" ? "Nhóm" : "1-1"}
                </span>
              </div>

              <div className="text-sm font-medium text-slate-600">
                {session.studyMode === "ONLINE" && "Online"}
                {session.studyMode === "OFFLINE" && "Trực tiếp"}
                {session.studyMode === "HYBRID" && "Kết hợp"}
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(session.participantStatus)}`}
                >
                  {getStatusLabel(session.participantStatus)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
