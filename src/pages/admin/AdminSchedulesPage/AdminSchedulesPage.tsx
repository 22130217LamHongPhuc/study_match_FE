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
} from "../../../services/StudySessionService";

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
        {statsLoading
          ? mockScheduleStats.map((stat) => (
              <ScheduleStatCardView
                key={stat.title}
                card={{
                  ...stat,
                  value: "--",
                  change: "Đang tải...",
                }}
              />
            ))
          : stats.map((stat) => (
              <ScheduleStatCardView key={stat.title} card={stat} />
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
      />

      <ScheduleDetailModal
        open={detailSchedule !== null}
        schedule={detailSchedule}
        onClose={() => setDetailSchedule(null)}
      />
    </main>
  );
}
