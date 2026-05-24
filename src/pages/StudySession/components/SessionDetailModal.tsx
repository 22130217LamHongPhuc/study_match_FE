import type { StudySessionVm } from "../types";

interface SessionDetailModalProps {
  session: StudySessionVm | null;
  onClose: () => void;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getParticipantStatusLabel(status: string) {
  if (status === "PENDING") return "Chờ xác nhận";
  if (status === "ACCEPTED") return "Đã xác nhận";
  if (status === "JOINED") return "Đã tham gia";
  if (status === "DECLINED") return "Đã từ chối";
  if (status === "ABSENT") return "Vắng mặt";
  return status;
}

function getModeLabel(mode: string) {
  if (mode === "ONLINE") return "Online";
  if (mode === "OFFLINE") return "Trực tiếp";
  return "Kết hợp";
}

export function SessionDetailModal({
  session,
  onClose,
}: SessionDetailModalProps) {
  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full h-[90vh] max-w-xl rounded-3xl bg-white shadow-xl overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div
              className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                session.sessionType === "GROUP"
                  ? "bg-violet-50 text-violet-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {session.sessionType === "GROUP"
                ? "Lịch học nhóm"
                : "Lịch học 1-1"}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {session.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {session.subjectName || "Chưa cập nhật môn học"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-500">
              Thời gian
            </div>
            <div className="mt-1 font-bold text-slate-900">
              {formatDateTime(session.startTime)}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Kết thúc: {formatDateTime(session.endTime)}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                Hình thức
              </div>
              <div className="mt-1 font-bold text-slate-900">
                {getModeLabel(session.studyMode)}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                Trạng thái tham gia
              </div>
              <div className="mt-1 font-bold text-slate-900">
                {getParticipantStatusLabel(session.participantStatus)}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-500">
              {session.sessionType === "GROUP" ? "Nhóm học" : "Bạn học"}
            </div>
            <div className="mt-1 font-bold text-slate-900">
              {session.sessionType === "GROUP"
                ? session.groupName || "Nhóm học"
                : session.partnerName || "Bạn học"}
            </div>
            {session.sessionType === "GROUP" && (
              <div className="mt-1 text-sm text-slate-500">
                {session.membersCount || 0} thành viên
              </div>
            )}
          </div>

          {(session.location || session.meetingUrl) && (
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                Địa điểm / Link học
              </div>
              {session.location && (
                <div className="mt-1 font-medium text-slate-900">
                  {session.location}
                </div>
              )}
              {session.meetingUrl && (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Mở phòng học online
                </a>
              )}
            </div>
          )}

          {session.description && (
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                Nội dung học
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {session.description}
              </p>
            </div>
          )}

          {session.participantStatus === "PENDING" && (
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                Xác nhận tham gia
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Từ chối
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
