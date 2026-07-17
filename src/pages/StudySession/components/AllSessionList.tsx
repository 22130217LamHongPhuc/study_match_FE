import type { StudySessionVm } from "../types";

interface AllSessionListProps {
  sessions: StudySessionVm[];
  page: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
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
    return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "ACCEPTED")
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "DECLINED") return "bg-rose-50 text-rose-700 border-rose-100";
  return "bg-gray-50 text-gray-600 border-gray-100";
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
  page,
  pageSize,
  pageSizeOptions,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onSelectSession,
}: AllSessionListProps) {
  const currentPage = totalPages === 0 ? 0 : page + 1;
  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min(startItem + sessions.length - 1, totalElements);
  const canGoPrevious = page > 0;
  const canGoNext = totalPages > 0 && page < totalPages - 1;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Tất cả buổi học</h2>
          <p className="text-sm text-gray-500">
            Danh sách lịch học 1-1 và nhóm
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
            Hiển thị
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
            {totalElements} buổi
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="hidden grid-cols-[1.1fr_1.5fr_1fr_1fr_1fr] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500 md:grid">
          <div>Thời gian</div>
          <div>Nội dung</div>
          <div>Loại</div>
          <div>Hình thức</div>
          <div>Trạng thái</div>
        </div>

        <div className="divide-y divide-gray-100">
          {sessions.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">
              Không có lịch học phù hợp với bộ lọc hiện tại.
            </div>
          )}

          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session)}
              className="grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition hover:bg-blue-50/40 md:grid-cols-[1.1fr_1.5fr_1fr_1fr_1fr] md:items-center"
            >
              <div>
                <div className="text-sm font-bold text-gray-800">
                  {formatDate(session.startTime)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatTimeRange(session.startTime, session.endTime)}
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-800">
                  {session.title}
                </div>
                <div className="text-sm text-gray-500">
                  {session.subjectName || "Chưa cập nhật môn học"}
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex rounded-md px-3 py-1 text-xs font-bold ${
                    session.sessionType === "GROUP"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {session.sessionType === "GROUP" ? "Nhóm" : "1-1"}
                </span>
              </div>

              <div className="text-sm font-medium text-gray-600">
                {session.studyMode === "ONLINE" && "Online"}
                {session.studyMode === "OFFLINE" && "Trực tiếp"}
                {session.studyMode === "HYBRID" && "Kết hợp"}
              </div>

              <div>
                <span
                  className={`inline-flex rounded-md border px-3 py-1 text-xs font-bold ${getStatusStyle(session.participantStatus)}`}
                >
                  {getStatusLabel(session.participantStatus)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
        <div>
          Hiển thị {startItem}-{endItem} trên {totalElements} buổi
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <span className="min-w-[96px] text-center font-semibold text-gray-700">
            Trang {currentPage}/{Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  );
}
