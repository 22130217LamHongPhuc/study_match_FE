import type { StudySessionVm } from "../types";
import icon1 from "../../../assets/img/icon1.png";
import { Repeat } from "lucide-react";

interface TodaySessionListProps {
  sessions: StudySessionVm[];
  onSelectSession: (session: StudySessionVm) => void;
  loading?: boolean;
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

export function TodaySessionListSkeleton() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
      <div className="mb-5">
        <div className="h-6 w-44 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-56 bg-gray-150 rounded" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-48 bg-gray-150 rounded" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-lg" />
            </div>

            <div className="space-y-2 mt-1">
              <div className="h-3.5 w-32 bg-gray-100 rounded" />
              <div className="h-3.5 w-40 bg-gray-100 rounded" />
              <div className="h-3.5 w-36 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TodaySessionList({
  sessions,
  onSelectSession,
  loading,
}: TodaySessionListProps) {
  if (loading) {
    return <TodaySessionListSkeleton />;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800">Buổi học hôm nay</h2>
        <p className="text-sm text-gray-500">
          Các lịch học cần chú ý trong ngày
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {sessions.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <img
              src={icon1}
              alt="Hôm nay chưa có lịch học"
              className="mx-auto mb-4 h-24 w-auto object-contain mix-blend-multiply"
            />
            <p className="mt-2 text-sm font-semibold text-gray-600">
              Hôm nay chưa có lịch học
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Bạn có thể tạo lịch mới hoặc chờ nhóm trưởng tạo lịch.
            </p>
          </div>
        )}

        {sessions.map((session) => (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelectSession(session)}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-blue-600">
                  {formatTimeRange(session.startTime, session.endTime)}
                  {(session.recurrenceId || (session.recurrenceType && session.recurrenceType !== "NONE")) && (
                    <span
                      title={session.recurrenceType === "WEEKLY" ? "Lặp lại hàng tuần" : "Lặp lại"}
                      className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600"
                    >
                      <Repeat size={10} className="shrink-0" />
                      {session.recurrenceType === "WEEKLY" ? "Lặp tuần" : "Lặp"}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-base font-bold text-gray-800">
                  {session.title}
                </div>
              </div>
              <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                {getModeLabel(session.studyMode)}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
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
