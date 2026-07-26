import type { ScheduleFilter, StudySessionVm } from "../types";
import { ChevronLeft, ChevronRight, Repeat, Search } from "lucide-react";
import { FilterTabs } from "./FilterTabs";

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
  loading?: boolean;
  filter: ScheduleFilter;
  onFilterChange: (filter: ScheduleFilter) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
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

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return pages;
}

function getStatusStyle(status: string) {
  if (status === "PENDING")
    return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "ACCEPTED" || status === "JOINED")
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "DECLINED") return "bg-rose-50 text-rose-700 border-rose-100";
  if (status === "ABSENT") return "bg-gray-50 text-gray-500 border-gray-200";
  return "bg-gray-50 text-gray-600 border-gray-100";
}

function getStatusLabel(status: string) {
  if (status === "PENDING") return "Chờ xác nhận";
  if (status === "ACCEPTED") return "Đã xác nhận";
  if (status === "JOINED") return "Đã tham gia";
  if (status === "DECLINED") return "Đã từ chối";
  if (status === "ABSENT") return "Vắng mặt";
  return status;
}

export function AllSessionListSkeleton() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="h-6 w-36 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-52 bg-gray-150 rounded" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-9 w-24 bg-gray-150 rounded-lg" />
          <div className="h-9 w-20 bg-gray-200 rounded-lg" />
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
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="grid w-full grid-cols-1 gap-3 px-4 py-5 md:grid-cols-[1.1fr_1.5fr_1fr_1fr_1fr] md:items-center"
            >
              <div className="flex flex-col gap-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3.5 w-28 bg-gray-100 rounded" />
              </div>
              <div>
                <div className="h-6 w-14 bg-gray-150 rounded-md" />
              </div>
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div>
                <div className="h-6 w-24 bg-gray-150 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="h-4 w-44 bg-gray-150 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-16 bg-gray-200 rounded-lg" />
          <div className="h-4 w-20 bg-gray-150 rounded" />
          <div className="h-9 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </section>
  );
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
  loading,
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
}: AllSessionListProps) {
  if (loading) {
    return <AllSessionListSkeleton />;
  }

  const currentPage = totalPages === 0 ? 0 : page + 1;
  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min(startItem + sessions.length - 1, totalElements);
  const canGoPrevious = page > 0;
  const canGoNext = totalPages > 0 && page < totalPages - 1;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-4 mt-1">
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm buổi học..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm transition-all focus:border-blue-400 focus:outline-none cursor-text"
            />
          </div>

          <FilterTabs activeFilter={filter} onChange={onFilterChange} />
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
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  {session.title}
                  {(session.recurrenceId || (session.recurrenceType && session.recurrenceType !== "NONE")) && (
                    <span
                      title={session.recurrenceType === "WEEKLY" ? "Lặp lại hàng tuần" : "Lặp lại"}
                      className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 whitespace-nowrap"
                    >
                      <Repeat size={9} className="shrink-0" />
                      {session.recurrenceType === "WEEKLY" ? "Lặp tuần" : "Lặp"}
                    </span>
                  )}
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

      <div className="mt-6 flex flex-col gap-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-5">
        <div>
          Hiển thị <span className="font-semibold text-gray-800">{startItem}-{endItem}</span> trên <span className="font-semibold text-gray-800">{totalElements}</span> buổi
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            
            <button
              type="button"
              disabled={!canGoPrevious}
              onClick={() => onPageChange(page - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              title="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers(page + 1, totalPages).map((pageNum, idx) => {
              if (pageNum === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-9 w-9 items-center justify-center text-gray-400 font-medium"
                  >
                    ...
                  </span>
                );
              }

              const isPageActive = pageNum === page + 1;

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange((pageNum as number) - 1)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                    isPageActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => onPageChange(page + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              title="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
