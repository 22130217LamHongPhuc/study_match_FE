import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  UsersRound,
  Users2,
} from "lucide-react";
import type { ScheduleRow } from "../types";
import {
  ScheduleStatusBadge,
  ScheduleTypeBadge,
  StudyModeBadge,
} from "./ScheduleBadges";
import { Pagination } from "../../../../components/admin/Pagination";
import { Cancel, CancelOutlined } from "@mui/icons-material";

type AdminSchedulesTableProps = {
  schedules: ScheduleRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onViewDetail: (schedule: ScheduleRow) => void;
  onEdit?: (scheduleId: number) => void;
  onDelete?: (schedule: ScheduleRow) => void;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const startTime = s.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = e.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, startTime, endTime };
}

export function AdminSchedulesTable({
  schedules,
  page,
  pageSize,
  totalItems,
  totalPages,
  loading,
  onPageChange,
  onViewDetail,
  onEdit,
  onDelete,
}: AdminSchedulesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (!openMenuId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".dropdown-menu-container")) return;
      setOpenMenuId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [openMenuId]);

  return (
    <div className="overflow-hidden rounded-lg border border-sand-200 bg-white">
      <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-medium text-sand-800">
            Danh sách lịch học
          </h3>
          <p className="mt-0.5 text-xs font-medium text-sand-500">
            Theo dõi và quản lý các buổi học đã lên lịch
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead>
            <tr className="border-b border-sand-100 bg-sand-50">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Tên buổi học
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Nhóm / Loại
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Người tạo
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Thời gian
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Hình thức
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Thành viên
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-sand-500">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              schedules.map((s) => {
                const time = formatTimeRange(s.startTime, s.endTime);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-sand-100 transition-colors last:border-0 hover:bg-sand-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-sand-800">
                            {s.sessionName}
                          </p>
                          {s.subject && (
                            <p className="mt-0.5 truncate text-xs text-sand-500">
                              Môn: {s.subject}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-sand-700">
                          {s.groupName || "Nhóm công khai"}
                        </p>
                        <ScheduleTypeBadge type={s.scheduleType} />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-sand-600">
                        {s.creatorName}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-sand-700">
                          {time.date}
                        </p>
                        <p className="text-[11px] font-medium text-sand-500">
                          {time.startTime} - {time.endTime}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <StudyModeBadge mode={s.studyMode} />
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-sand-600">
                        {s.memberCount} / {s.maxMembers}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <ScheduleStatusBadge status={s.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetail(s)}
                          className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                          aria-label="Xem chi tiết lịch học"
                        >
                          <Eye size={15} />
                        </button>
                        <div className="relative dropdown-menu-container">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId((prev) => (prev === s.id ? null : s.id));
                            }}
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === s.id}
                            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-700"
                          >
                            <MoreHorizontal size={15} />
                          </button>

                          {openMenuId === s.id && (
                            <div
                              role="menu"
                              className="absolute right-0 top-[calc(100%+6px)] z-10 w-40 overflow-hidden rounded-lg border border-sand-200 bg-white shadow-lg"
                            >
                              {s.status !== "CANCELLED" && (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-sand-700 hover:bg-sand-50"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onEdit?.(s.id);
                                  }}
                                >
                                  <CancelOutlined className="text-sand-500" fontSize="small" />
                                  Hủy lịch học
                                </button>
                              )}
                              <button
                                type="button"
                                role="menuitem"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onDelete?.(s);
                                }}
                              >
                                <Trash2 size={14} className="text-rose-600" />
                                Xóa lịch học
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {loading &&
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={index} className="border-b border-sand-100 last:border-b-0 animate-pulse">
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-4 w-36 bg-sand-200 rounded" />
                      <div className="h-3 w-24 bg-sand-100 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-4 w-28 bg-sand-200 rounded" />
                      <div className="h-3.5 w-16 bg-sand-100 rounded-full" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-4 w-20 bg-sand-200 rounded" />
                      <div className="h-3 w-28 bg-sand-100 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-16 bg-sand-200 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-12 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 bg-sand-200 rounded-full" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && schedules.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100">
                      <CalendarDays size={22} className="text-sand-400" />
                    </div>
                    <p className="text-sm font-medium text-sand-600">
                      Không có lịch học nào
                    </p>
                    <p className="text-xs text-sand-400">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
