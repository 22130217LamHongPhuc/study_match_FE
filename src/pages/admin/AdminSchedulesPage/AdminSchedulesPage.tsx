import { useEffect, useMemo, useState } from "react";

import { SchedulesToolbar } from "./components/SchedulesToolbar";
import { ScheduleStatCard } from "./components/ScheduleStatCard";
import { SchedulesFilterBar } from "./components/SchedulesFilterBar";
import { AdminSchedulesTable } from "./components/AdminSchedulesTable";
import { ScheduleDetailModal } from "./components/ScheduleDetailModal";

import { mockSchedules, mockScheduleStats } from "./mockData";
import type {
  ScheduleRow,
  ScheduleStatus,
  StudyMode,
  ScheduleType,
  TimeFilter,
} from "./types";
import { SCHEDULE_PAGE_SIZE } from "./types";

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isThisWeek(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function isThisMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

export default function AdminSchedulesPage() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | null>(null);
  const [modeFilter, setModeFilter] = useState<StudyMode | null>(null);
  const [typeFilter, setTypeFilter] = useState<ScheduleType | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALL");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [detailSchedule, setDetailSchedule] = useState<ScheduleRow | null>(
    null,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, modeFilter, typeFilter, timeFilter]);

  const filtered = useMemo(() => {
    let list = [...mockSchedules];

    if (debouncedKeyword) {
      const q = debouncedKeyword.toLowerCase();
      list = list.filter(
        (s) =>
          s.sessionName.toLowerCase().includes(q) ||
          (s.groupName ?? "").toLowerCase().includes(q) ||
          s.creatorName.toLowerCase().includes(q),
      );
    }

    if (statusFilter) {
      list = list.filter((s) => s.status === statusFilter);
    }

    if (modeFilter) {
      list = list.filter((s) => s.studyMode === modeFilter);
    }

    if (typeFilter) {
      list = list.filter((s) => s.scheduleType === typeFilter);
    }

    if (timeFilter === "TODAY") {
      list = list.filter((s) => isToday(s.startTime));
    } else if (timeFilter === "THIS_WEEK") {
      list = list.filter((s) => isThisWeek(s.startTime));
    } else if (timeFilter === "THIS_MONTH") {
      list = list.filter((s) => isThisMonth(s.startTime));
    }

    return list;
  }, [debouncedKeyword, statusFilter, modeFilter, typeFilter, timeFilter]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / SCHEDULE_PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * SCHEDULE_PAGE_SIZE,
    page * SCHEDULE_PAGE_SIZE,
  );

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <main className="space-y-6">
      <SchedulesToolbar onRefresh={handleRefresh} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockScheduleStats.map((stat) => (
          <ScheduleStatCard key={stat.title} card={stat} />
        ))}
      </div>

      <SchedulesFilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        modeFilter={modeFilter}
        onModeChange={setModeFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        timeFilter={timeFilter}
        onTimeChange={setTimeFilter}
      />

      <AdminSchedulesTable
        schedules={paginated}
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
