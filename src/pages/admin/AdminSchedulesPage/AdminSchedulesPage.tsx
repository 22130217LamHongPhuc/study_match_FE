import { useEffect, useState } from "react";

import { SchedulesToolbar } from "./components/SchedulesToolbar";
import { ScheduleStatCard as ScheduleStatCardView } from "./components/ScheduleStatCard";
import { SchedulesFilterBar } from "./components/SchedulesFilterBar";
import { AdminSchedulesTable } from "./components/AdminSchedulesTable";
import { ScheduleDetailModal } from "./components/ScheduleDetailModal";

import { mockScheduleStats } from "./mockData";
import type {
  AdminSessionRowResponse,
  ScheduleRow,
  ScheduleStatCard as ScheduleStatCardModel,
  ScheduleStatus,
  StudyMode,
  ScheduleType,
  TimeFilter,
} from "./types";
import { SCHEDULE_PAGE_SIZE } from "./types";
import {
  getAdminSessionStats,
  getAdminSessions,
  cancelStudySessionForAdmin,
  deleteStudySessionForAdmin,
} from "../../../services/StudySessionService";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";

function toLocalDateTimeString(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function getTimeRange(filter: TimeFilter) {
  const now = new Date();

  if (filter === "TODAY") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return {
      startFrom: toLocalDateTimeString(start),
      startTo: toLocalDateTimeString(end),
    };
  }

  if (filter === "THIS_WEEK") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      startFrom: toLocalDateTimeString(start),
      startTo: toLocalDateTimeString(end),
    };
  }

  if (filter === "THIS_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return {
      startFrom: toLocalDateTimeString(start),
      startTo: toLocalDateTimeString(end),
    };
  }

  return {};
}

function mapSessionToRow(session: AdminSessionRowResponse): ScheduleRow {
  return {
    id: session.id,
    sessionName: session.title,
    groupName: session.groupName,
    groupAvatarUrl: session.groupAvatarUrl ?? null,
    scheduleType: session.sessionType,
    creatorName: session.creatorName,
    creatorAvatar: null,
    startTime: session.startTime,
    endTime: session.endTime,
    studyMode: session.studyMode,
    memberCount: session.membersCount,
    maxMembers: session.maxMembers,
    status: session.status,
    subject: session.subjectName,
    description: null,
    location: null,
    onlineLink: null,
    members: [],
  };
}

export default function AdminSchedulesPage() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | null>(null);
  const [modeFilter, setModeFilter] = useState<StudyMode | null>(null);
  const [typeFilter, setTypeFilter] = useState<ScheduleType | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALL");

  const [page, setPage] = useState(1);
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [sessionsError, setSessionsError] = useState("");
  const [stats, setStats] =
    useState<ScheduleStatCardModel[]>(mockScheduleStats);
  const [sessions, setSessions] = useState<ScheduleRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [detailSchedule, setDetailSchedule] = useState<ScheduleRow | null>(
    null,
  );
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCancelSchedule = (id: number) => {
    setCancelTargetId(id);
  };

  const handleDeleteSchedule = (schedule: ScheduleRow) => {
    setDeleteTarget(schedule);
  };

  const confirmCancelSchedule = async () => {
    if (!cancelTargetId) return;
    setActionLoading(true);
    try {
      const res = await cancelStudySessionForAdmin(cancelTargetId);
      if (res.success) {
        toast.success("Hủy lịch học thành công");
        handleRefresh();
      } else {
        toast.error(res.message || "Hủy lịch học thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi hủy lịch học");
    } finally {
      setActionLoading(false);
      setCancelTargetId(null);
    }
  };

  const confirmDeleteSchedule = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await deleteStudySessionForAdmin(deleteTarget.id);
      if (res.success) {
        toast.success("Xóa lịch học thành công");
        handleRefresh();
      } else {
        toast.error(res.message || "Xóa lịch học thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi xóa lịch học");
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError("");

      const response = await getAdminSessionStats();
      const data = response.data;

      if (!data) return;

      setStats([
        {
          ...mockScheduleStats[0],
          value: String(data.totalSessions),
          change: "Tổng lịch học",
        },
        {
          ...mockScheduleStats[1],
          value: String(data.upcomingSessions),
          change: "Trong thời gian tới",
        },
        {
          ...mockScheduleStats[2],
          value: String(data.ongoingSessions),
          change: "Đang diễn ra",
          warning: true,
        },
        {
          ...mockScheduleStats[3],
          value: String(data.completedCancelledSessions),
          change: `${data.completionPercentage.toFixed(1)}% hoàn thành`,
        },
      ]);
    } catch {
      setStatsError("Không thể tải thống kê lịch học");
      setStats(mockScheduleStats);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    loadStats();
  }, [refreshTick]);

  useEffect(() => {
    let mounted = true;

    async function loadSessions() {
      try {
        setLoading(true);
        setSessionsError("");

        const timeRange = getTimeRange(timeFilter);
        const response = await getAdminSessions({
          keyword: debouncedKeyword || undefined,
          status: statusFilter,
          studyMode: modeFilter,
          sessionType: typeFilter,
          startFrom: timeRange.startFrom,
          startTo: timeRange.startTo,
          page: page - 1,
          limit: SCHEDULE_PAGE_SIZE,
        });

        if (!mounted) return;

        const data = response.data;
        const content = data?.content ?? [];

        setSessions(content.map(mapSessionToRow));
        setTotalItems(data?.totalElements ?? 0);
        setTotalPages(Math.max(data?.totalPages ?? 0, 1));
      } catch {
        if (!mounted) return;

        setSessions([]);
        setTotalItems(0);
        setTotalPages(1);
        setSessionsError("Không thể tải danh sách lịch học");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      mounted = false;
    };
  }, [
    debouncedKeyword,
    statusFilter,
    modeFilter,
    typeFilter,
    timeFilter,
    page,
    refreshTick,
  ]);

  const handleRefresh = () => {
    setRefreshTick((prev) => prev + 1);
  };

  return (
    <main className="space-y-6">
      <SchedulesToolbar onRefresh={handleRefresh} />

      {statsError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {statsError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(statsLoading ? mockScheduleStats : stats).map((stat) => (
          <ScheduleStatCardView
            key={stat.title}
            card={stat}
            loading={statsLoading}
          />
        ))}
      </div>

      <SchedulesFilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        modeFilter={modeFilter}
        onModeChange={(value) => {
          setModeFilter(value);
          setPage(1);
        }}
        typeFilter={typeFilter}
        onTypeChange={(value) => {
          setTypeFilter(value);
          setPage(1);
        }}
        timeFilter={timeFilter}
        onTimeChange={(value) => {
          setTimeFilter(value);
          setPage(1);
        }}
      />

      {sessionsError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {sessionsError}
        </div>
      )}

      <AdminSchedulesTable
        schedules={sessions}
        page={page}
        pageSize={SCHEDULE_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
        onViewDetail={(s) => setDetailSchedule(s)}
        onEdit={handleCancelSchedule}
        onDelete={handleDeleteSchedule}
      />

      <ScheduleDetailModal
        open={detailSchedule !== null}
        schedule={detailSchedule}
        onClose={() => setDetailSchedule(null)}
      />

      {cancelTargetId !== null &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/35"
              onClick={() => !actionLoading && setCancelTargetId(null)}
              aria-label="Đóng"
            />
            <div className="relative z-10 w-full max-w-md rounded-xl border border-sand-200 bg-white p-5 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <AlertTriangle size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-sand-900">
                    Xác nhận hủy lịch học
                  </h3>
                  <p className="text-sm font-medium text-sand-600">
                    Bạn có chắc chắn muốn hủy lịch học này? Trạng thái của buổi học sẽ được chuyển sang CANCELLED và thông báo tới các thành viên tham gia.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setCancelTargetId(null)}
                  className="rounded-lg border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-sand-600 transition-colors hover:bg-sand-50 disabled:opacity-50"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={confirmCancelSchedule}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {actionLoading ? "Đang xử lý..." : "Hủy lịch học"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {deleteTarget !== null &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/35"
              onClick={() => !actionLoading && setDeleteTarget(null)}
              aria-label="Đóng"
            />
            <div className="relative z-10 w-full max-w-md rounded-xl border border-sand-200 bg-white p-5 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <Trash2 size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-sand-900">
                    Xác nhận xóa lịch học
                  </h3>
                  <p className="text-sm font-medium text-sand-600">
                    Bạn có chắc chắn muốn xóa lịch học "{deleteTarget.sessionName}"? Thao tác này sẽ thực hiện xóa mềm khỏi hệ thống.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-sand-600 transition-colors hover:bg-sand-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={confirmDeleteSchedule}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {actionLoading ? "Đang xóa..." : "Xóa lịch học"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
