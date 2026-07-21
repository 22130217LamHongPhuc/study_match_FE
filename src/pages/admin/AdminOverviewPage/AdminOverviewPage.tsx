import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import WebSocketManager from "../../../socket/WebSocketManager";
import {
  getAdminOverviewData,
  AdminOverviewResponse,
} from "../../../services/AdminOverviewService";

// Neutral & Balanced Chart Colors
const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#64748b",
  teal: "#0d9488",
  indigo: "#4f46e5",
  amber: "#d97706",
  rose: "#e11d48",
  emerald: "#059669",
};

// Database-inspired Mock Data
const MOCK_TOP_SUBJECTS_PUBLIC_PRIVATE = [
  { subjectName: "Lập trình Web (React/Node)", publicCount: 42, privateCount: 28, totalGroups: 70, totalMembers: 520 },
  { subjectName: "Cơ sở dữ liệu (SQL/NoSQL)", publicCount: 35, privateCount: 22, totalGroups: 57, totalMembers: 410 },
  { subjectName: "Kiến trúc máy tính", publicCount: 28, privateCount: 18, totalGroups: 46, totalMembers: 330 },
  { subjectName: "Đại số tuyến tính", publicCount: 24, privateCount: 15, totalGroups: 39, totalMembers: 290 },
  { subjectName: "Tiếng Anh chuyên ngành (B2/C1)", publicCount: 30, privateCount: 25, totalGroups: 55, totalMembers: 480 },
  { subjectName: "Cấu trúc dữ liệu & Giải thuật", publicCount: 38, privateCount: 26, totalGroups: 64, totalMembers: 510 },
  { subjectName: "Hệ điều hành", publicCount: 20, privateCount: 14, totalGroups: 34, totalMembers: 240 },
];

const MOCK_REPORTS_BY_TARGET = [
  { name: "Người dùng (User)", pending: 8, reviewing: 4, resolved: 32, rejected: 6, total: 50 },
  { name: "Nhóm học (Group)", pending: 5, reviewing: 2, resolved: 18, rejected: 3, total: 28 },
  { name: "Bài viết (Post)", pending: 3, reviewing: 1, resolved: 14, rejected: 2, total: 20 },
  { name: "Tin nhắn (Message)", pending: 6, reviewing: 3, resolved: 25, rejected: 8, total: 42 },
];

const MOCK_REPORTS_PIE = [
  { name: "Đang chờ (PENDING)", value: 22, color: "#d97706" },
  { name: "Đang xem xét (REVIEWING)", value: 10, color: "#2563eb" },
  { name: "Đã xử lý (RESOLVED)", value: 89, color: "#059669" },
  { name: "Từ chối (REJECTED)", value: 19, color: "#dc2626" },
];

// Time Period Datasets
const MESSAGES_PRESETS = {
  THIS_WEEK: [
    { date: "T2 (15/07)", groupMessages: 3400, privateMessages: 1800, total: 5200 },
    { date: "T3 (16/07)", groupMessages: 4100, privateMessages: 2100, total: 6200 },
    { date: "T4 (17/07)", groupMessages: 3900, privateMessages: 1950, total: 5850 },
    { date: "T5 (18/07)", groupMessages: 4800, privateMessages: 2400, total: 7200 },
    { date: "T6 (19/07)", groupMessages: 5200, privateMessages: 2700, total: 7900 },
    { date: "T7 (20/07)", groupMessages: 6100, privateMessages: 3100, total: 9200 },
    { date: "CN (21/07)", groupMessages: 5800, privateMessages: 2900, total: 8700 },
  ],
  THIS_MONTH: [
    { date: "Tuần 1 (01-07)", groupMessages: 24500, privateMessages: 12200, total: 36700 },
    { date: "Tuần 2 (08-14)", groupMessages: 28900, privateMessages: 14100, total: 43000 },
    { date: "Tuần 3 (15-21)", groupMessages: 33300, privateMessages: 16950, total: 50250 },
    { date: "Tuần 4 (22-28)", groupMessages: 31000, privateMessages: 15500, total: 46500 },
  ],
  ALL_TIME: [
    { date: "Tháng 1", groupMessages: 45000, privateMessages: 22000, total: 67000 },
    { date: "Tháng 2", groupMessages: 58000, privateMessages: 29000, total: 87000 },
    { date: "Tháng 3", groupMessages: 72000, privateMessages: 36000, total: 108000 },
    { date: "Tháng 4", groupMessages: 89000, privateMessages: 44000, total: 133000 },
    { date: "Tháng 5", groupMessages: 105000, privateMessages: 52000, total: 157000 },
    { date: "Tháng 6", groupMessages: 122000, privateMessages: 61000, total: 183000 },
    { date: "Tháng 7", groupMessages: 118000, privateMessages: 58750, total: 176750 },
  ],
};

const NEW_USERS_PRESETS = {
  THIS_WEEK: [
    { date: "T2 (15/07)", newUsers: 45 },
    { date: "T3 (16/07)", newUsers: 52 },
    { date: "T4 (17/07)", newUsers: 49 },
    { date: "T5 (18/07)", newUsers: 68 },
    { date: "T6 (19/07)", newUsers: 84 },
    { date: "T7 (20/07)", newUsers: 95 },
    { date: "CN (21/07)", newUsers: 78 },
  ],
  THIS_MONTH: [
    { date: "Tuần 1", newUsers: 310 },
    { date: "Tuần 2", newUsers: 385 },
    { date: "Tuần 3", newUsers: 471 },
    { date: "Tuần 4", newUsers: 420 },
  ],
  ALL_TIME: [
    { date: "Tháng 1", newUsers: 650 },
    { date: "Tháng 2", newUsers: 820 },
    { date: "Tháng 3", newUsers: 1100 },
    { date: "Tháng 4", newUsers: 1450 },
    { date: "Tháng 5", newUsers: 1890 },
    { date: "Tháng 6", newUsers: 2340 },
    { date: "Tháng 7", newUsers: 2845 },
  ],
};

const STUDY_DURATION_PRESETS = {
  THIS_WEEK: [
    { date: "T2 (15/07)", totalHours: 142, onlineSessions: 85, offlineSessions: 57 },
    { date: "T3 (16/07)", totalHours: 168, onlineSessions: 98, offlineSessions: 70 },
    { date: "T4 (17/07)", totalHours: 155, onlineSessions: 92, offlineSessions: 63 },
    { date: "T5 (18/07)", totalHours: 189, onlineSessions: 115, offlineSessions: 74 },
    { date: "T6 (19/07)", totalHours: 210, onlineSessions: 130, offlineSessions: 80 },
    { date: "T7 (20/07)", totalHours: 245, onlineSessions: 155, offlineSessions: 90 },
    { date: "CN (21/07)", totalHours: 230, onlineSessions: 140, offlineSessions: 90 },
  ],
  THIS_MONTH: [
    { date: "Tuần 1", totalHours: 980, onlineSessions: 580, offlineSessions: 400 },
    { date: "Tuần 2", totalHours: 1150, onlineSessions: 690, offlineSessions: 460 },
    { date: "Tuần 3", totalHours: 1339, onlineSessions: 815, offlineSessions: 524 },
    { date: "Tuần 4", totalHours: 1240, onlineSessions: 750, offlineSessions: 490 },
  ],
  ALL_TIME: [
    { date: "Tháng 1", totalHours: 2800, onlineSessions: 1650, offlineSessions: 1150 },
    { date: "Tháng 2", totalHours: 3600, onlineSessions: 2100, offlineSessions: 1500 },
    { date: "Tháng 3", totalHours: 4900, onlineSessions: 2900, offlineSessions: 2000 },
    { date: "Tháng 4", totalHours: 6200, onlineSessions: 3700, offlineSessions: 2500 },
    { date: "Tháng 5", totalHours: 7800, onlineSessions: 4600, offlineSessions: 3200 },
    { date: "Tháng 6", totalHours: 9400, onlineSessions: 5600, offlineSessions: 3800 },
    { date: "Tháng 7", totalHours: 8709, onlineSessions: 5235, offlineSessions: 3474 },
  ],
};

export default function AdminOverviewPage() {
  // TIME PERIOD FILTER STATE
  const [timePreset, setTimePreset] = useState<"THIS_WEEK" | "THIS_MONTH" | "ALL_TIME" | "CUSTOM">("THIS_WEEK");
  const [startDate, setStartDate] = useState<string>("2026-07-15");
  const [endDate, setEndDate] = useState<string>("2026-07-21");

  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Realtime online users state
  const [onlineCount, setOnlineCount] = useState<number>(342);
  const [lastSocketUpdate, setLastSocketUpdate] = useState<string>("Vừa xong");

  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<AdminOverviewResponse | null>(null);

  // API Integration Effect
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    getAdminOverviewData({ timePreset, startDate, endDate })
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.data) {
          setApiData(res.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch admin overview API", err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [timePreset, startDate, endDate]);

  // Summary Metrics State
  const totalUsers = apiData?.totalUsers ?? 2845;
  const pendingReportsCount = apiData?.pendingReportsCount ?? 22;

  // --- CHART 1 SORT & FILTER STATE (Top Subjects) ---
  const [subjectViewMode, setSubjectViewMode] = useState<"LEADERBOARD" | "CHART">("LEADERBOARD");
  const [subjectVisibilityFilter, setSubjectVisibilityFilter] = useState<"ALL" | "PUBLIC_ONLY" | "PRIVATE_ONLY">("ALL");
  const [subjectSortBy, setSubjectSortBy] = useState<"TOTAL_DESC" | "TOTAL_ASC" | "NAME_ASC" | "MEMBERS_DESC">("TOTAL_DESC");
  const [subjectSearch, setSubjectSearch] = useState("");

  const processedTopSubjects = useMemo(() => {
    let list = apiData?.topSubjects ? [...apiData.topSubjects] : [...MOCK_TOP_SUBJECTS_PUBLIC_PRIVATE];

    if (subjectSearch.trim()) {
      list = list.filter((item) => item.subjectName.toLowerCase().includes(subjectSearch.toLowerCase()));
    }

    list.sort((a, b) => {
      if (subjectSortBy === "TOTAL_DESC") return b.totalGroups - a.totalGroups;
      if (subjectSortBy === "TOTAL_ASC") return a.totalGroups - b.totalGroups;
      if (subjectSortBy === "NAME_ASC") return a.subjectName.localeCompare(b.subjectName);
      if (subjectSortBy === "MEMBERS_DESC") return b.totalMembers - a.totalMembers;
      return 0;
    });

    return list;
  }, [apiData, subjectSearch, subjectSortBy]);

  // --- CHART 2 SORT & FILTER STATE (Reports) ---
  const [reportTargetFilter, setReportTargetFilter] = useState<string>("ALL");
  const [reportSortBy, setReportSortBy] = useState<"TOTAL_DESC" | "PENDING_DESC" | "NAME_ASC">("TOTAL_DESC");

  const processedReportsData = useMemo(() => {
    let list = apiData?.reportsByTarget ? [...apiData.reportsByTarget] : [...MOCK_REPORTS_BY_TARGET];

    if (reportTargetFilter !== "ALL") {
      list = list.filter((item) => item.name.includes(reportTargetFilter));
    }

    list.sort((a, b) => {
      if (reportSortBy === "TOTAL_DESC") return b.total - a.total;
      if (reportSortBy === "PENDING_DESC") return b.pending - a.pending;
      if (reportSortBy === "NAME_ASC") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [apiData, reportTargetFilter, reportSortBy]);

  const reportsPieData = useMemo(() => {
    return apiData?.reportsPie ? apiData.reportsPie : MOCK_REPORTS_PIE;
  }, [apiData]);

  // --- CHART 3 SORT & FILTER STATE (Messages Timeline) ---
  const [messageTypeFilter, setMessageTypeFilter] = useState<"ALL" | "GROUP" | "PRIVATE">("ALL");
  const [messageSortBy, setMessageSortBy] = useState<"CHRONO" | "TOTAL_DESC" | "TOTAL_ASC">("CHRONO");

  const processedMessagesData = useMemo(() => {
    let list = apiData?.messagesTimeline
      ? [...apiData.messagesTimeline]
      : [...(MESSAGES_PRESETS[timePreset === "CUSTOM" ? "THIS_WEEK" : timePreset] || MESSAGES_PRESETS.THIS_WEEK)];

    if (messageSortBy === "TOTAL_DESC") {
      list.sort((a, b) => b.total - a.total);
    } else if (messageSortBy === "TOTAL_ASC") {
      list.sort((a, b) => a.total - b.total);
    }

    return list;
  }, [apiData, timePreset, messageSortBy]);

  // --- CHART 4 SORT & FILTER STATE (New Users) ---
  const [userSortBy, setUserSortBy] = useState<"CHRONO" | "NEW_DESC" | "NEW_ASC">("CHRONO");

  const processedNewUsersData = useMemo(() => {
    let list = apiData?.newUsersTimeline
      ? [...apiData.newUsersTimeline]
      : [...(NEW_USERS_PRESETS[timePreset === "CUSTOM" ? "THIS_WEEK" : timePreset] || NEW_USERS_PRESETS.THIS_WEEK)];

    if (userSortBy === "NEW_DESC") {
      list.sort((a, b) => b.newUsers - a.newUsers);
    } else if (userSortBy === "NEW_ASC") {
      list.sort((a, b) => a.newUsers - b.newUsers);
    }

    return list;
  }, [apiData, timePreset, userSortBy]);

  // --- CHART 5 SORT & FILTER STATE (Study Duration) ---
  const [studyModeFilter, setStudyModeFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
  const [studySortBy, setStudySortBy] = useState<"CHRONO" | "HOURS_DESC" | "HOURS_ASC">("CHRONO");

  const processedStudyData = useMemo(() => {
    let list = apiData?.studyDurationTimeline
      ? [...apiData.studyDurationTimeline]
      : [...(STUDY_DURATION_PRESETS[timePreset === "CUSTOM" ? "THIS_WEEK" : timePreset] || STUDY_DURATION_PRESETS.THIS_WEEK)];

    if (studySortBy === "HOURS_DESC") {
      list.sort((a, b) => b.totalHours - a.totalHours);
    } else if (studySortBy === "HOURS_ASC") {
      list.sort((a, b) => a.totalHours - b.totalHours);
    }

    return list;
  }, [apiData, timePreset, studySortBy]);

  // Realtime Socket Listener
  useEffect(() => {
    let ws = WebSocketManager.getInstance();
    let isSubscribed = true;

    ws.connect()
      .then(() => {
        if (!isSubscribed) return;

        ws.onMessage("/topic/online-users", (msg: string) => {
          try {
            const data = JSON.parse(msg);
            if (typeof data.onlineCount === "number") {
              setOnlineCount(data.onlineCount);
              setLastSocketUpdate(new Date().toLocaleTimeString("vi-VN"));
            }
          } catch {
            // parse fallback
          }
        });
      })
      .catch((err) => {
        console.warn("Realtime admin socket connection error:", err);
      });

    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = Math.max(120, prev + delta);
        return next;
      });
      setLastSocketUpdate(new Date().toLocaleTimeString("vi-VN"));
    }, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Thống kê hệ thống
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Tổng quan dữ liệu người dùng, môn học, báo cáo và thời lượng học tập.
          </p>
        </div>

        <div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? "Đang cập nhật..." : "Làm mới dữ liệu"}
          </button>
        </div>
      </div>

      {/* TIME PERIOD FILTER BAR - Minimal Neutral Slate Styling */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Khoảng thời gian thống kê
          </h3>

          <div className="text-xs font-medium text-slate-600">
            <span className="bg-slate-100 px-2.5 py-1 rounded-md">
              {timePreset === "THIS_WEEK" && "Tuần này (15/07 - 21/07)"}
              {timePreset === "THIS_MONTH" && "Tháng này (01/07 - 21/07)"}
              {timePreset === "ALL_TIME" && "Tất cả từ trước đến nay"}
              {timePreset === "CUSTOM" && `Từ ${startDate} đến ${endDate}`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="inline-flex flex-wrap items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium text-slate-600 gap-1">
            <button
              onClick={() => setTimePreset("THIS_WEEK")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                timePreset === "THIS_WEEK"
                  ? "bg-slate-900 text-white font-medium"
                  : "hover:bg-white"
              }`}
            >
              Chỉ Tuần này
            </button>

            <button
              onClick={() => setTimePreset("THIS_MONTH")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                timePreset === "THIS_MONTH"
                  ? "bg-slate-900 text-white font-medium"
                  : "hover:bg-white"
              }`}
            >
              Tháng này (30 ngày)
            </button>

            <button
              onClick={() => setTimePreset("ALL_TIME")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                timePreset === "ALL_TIME"
                  ? "bg-slate-900 text-white font-medium"
                  : "hover:bg-white"
              }`}
            >
              Từ trước đến nay (Tất cả)
            </button>

            <button
              onClick={() => setTimePreset("CUSTOM")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                timePreset === "CUSTOM"
                  ? "bg-slate-900 text-white font-medium"
                  : "hover:bg-white"
              }`}
            >
              Tùy chỉnh khoảng thời gian
            </button>
          </div>

          {/* Custom Date Range Picker Inputs */}
          {timePreset === "CUSTOM" && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-slate-400 focus:outline-none"
              />
              <span className="text-slate-500 font-medium">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-slate-400 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Core Metric Cards - Clean Neutral Layout */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Tổng số người dùng */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tổng số người dùng
          </p>
          <h3 className="text-3xl font-bold text-slate-900">
            {totalUsers.toLocaleString("vi-VN")}
          </h3>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="font-medium text-slate-700">+12.4% tháng này</span>
            <span className="text-slate-400 font-mono text-[11px]">users table</span>
          </div>
        </div>

        {/* 2. Người dùng đang Online (Realtime) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Đang Online (Realtime)
            </p>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">
            {onlineCount.toLocaleString("vi-VN")}
          </h3>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="font-medium text-slate-700">WebSocket STOMP</span>
            <span className="text-slate-400">{lastSocketUpdate}</span>
          </div>
        </div>

        {/* 3. Báo cáo đang chờ xử lý */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Báo cáo chờ xử lý
          </p>
          <h3 className="text-3xl font-bold text-slate-900">
            {pendingReportsCount}
          </h3>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Trạng thái PENDING</span>
            <span className="text-slate-400 font-mono text-[11px]">reports table</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CHART 1: Top Subjects (Ranked Leaderboard & Column Chart View) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Top Môn Học (Public & Private)
              </h2>

              {/* View Mode Toggle Button Group */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium text-slate-600">
                <button
                  onClick={() => setSubjectViewMode("LEADERBOARD")}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    subjectViewMode === "LEADERBOARD"
                      ? "bg-slate-900 text-white font-semibold"
                      : "hover:bg-white text-slate-600"
                  }`}
                >
                  Bảng Xếp Hạng
                </button>
                <button
                  onClick={() => setSubjectViewMode("CHART")}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    subjectViewMode === "CHART"
                      ? "bg-slate-900 text-white font-semibold"
                      : "hover:bg-white text-slate-600"
                  }`}
                >
                  Biểu Đồ Cột
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Thống kê môn học theo số lượng nhóm (Loại trừ nhóm Community).
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <div className="flex-1 min-w-[130px]">
              <input
                type="text"
                placeholder="Tìm môn học..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </div>

            <select
              value={subjectVisibilityFilter}
              onChange={(e) => setSubjectVisibilityFilter(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="ALL">Tất cả (Public + Private)</option>
              <option value="PUBLIC_ONLY">Chỉ Nhóm Public</option>
              <option value="PRIVATE_ONLY">Chỉ Nhóm Private</option>
            </select>

            <select
              value={subjectSortBy}
              onChange={(e) => setSubjectSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="TOTAL_DESC">Tổng nhóm (Cao → Thấp)</option>
              <option value="TOTAL_ASC">Tổng nhóm (Thấp → Cao)</option>
              <option value="MEMBERS_DESC">Số thành viên (Nhiều nhất)</option>
              <option value="NAME_ASC">Tên môn học (A → Z)</option>
            </select>
          </div>

          {/* VIEW MODE 1: RANKED LEADERBOARD LIST */}
          {subjectViewMode === "LEADERBOARD" ? (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 text-xs">
              {processedTopSubjects.map((item, index) => {
                const maxGroups = Math.max(...processedTopSubjects.map((s) => s.totalGroups), 1);
                const publicPct = Math.round((item.publicCount / item.totalGroups) * 100);
                const privatePct = 100 - publicPct;
                const totalPct = Math.round((item.totalGroups / maxGroups) * 100);

                return (
                  <div
                    key={item.subjectName}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:border-slate-200 transition-all space-y-2"
                  >
                    {/* Item Top Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-slate-900 truncate text-xs">
                          {item.subjectName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[11px]">
                        <span className="font-bold text-slate-900">{item.totalGroups} nhóm</span>
                        <span className="text-slate-400">({item.totalMembers} học viên)</span>
                      </div>
                    </div>

                    {/* Progress Bar (Public vs Private Split) */}
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 flex">
                        {subjectVisibilityFilter !== "PRIVATE_ONLY" && (
                          <div
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${(item.publicCount / maxGroups) * 100}%` }}
                            title={`Public: ${item.publicCount} nhóm`}
                          />
                        )}
                        {subjectVisibilityFilter !== "PUBLIC_ONLY" && (
                          <div
                            className="bg-slate-600 h-full transition-all duration-300"
                            style={{ width: `${(item.privateCount / maxGroups) * 100}%` }}
                            title={`Private: ${item.privateCount} nhóm`}
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Public: <strong className="text-slate-800">{item.publicCount}</strong> ({publicPct}%)</span>
                        <span>Private: <strong className="text-slate-800">{item.privateCount}</strong> ({privatePct}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW MODE 2: RECHARTS GROUPED COLUMN CHART */
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedTopSubjects}
                  margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="subjectName"
                    style={{ fontSize: "10px" }}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis style={{ fontSize: "10px" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} nhóm`,
                      name === "publicCount" ? "Nhóm Public" : "Nhóm Private",
                    ]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  {subjectVisibilityFilter !== "PRIVATE_ONLY" && (
                    <Bar dataKey="publicCount" name="Nhóm Public" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                  )}
                  {subjectVisibilityFilter !== "PUBLIC_ONLY" && (
                    <Bar dataKey="privateCount" name="Nhóm Private" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 2: Reports Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-slate-900">
              Phân tích Báo cáo Vi phạm
            </h2>
            <p className="text-xs text-slate-500">
              Phân loại trạng thái và đối tượng báo cáo.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <select
              value={reportTargetFilter}
              onChange={(e) => setReportTargetFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="ALL">Tất cả đối tượng</option>
              <option value="User">Người dùng (User)</option>
              <option value="Group">Nhóm học (Group)</option>
              <option value="Post">Bài viết (Post)</option>
              <option value="Message">Tin nhắn (Message)</option>
            </select>

            <select
              value={reportSortBy}
              onChange={(e) => setReportSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="TOTAL_DESC">Tổng vi phạm (Nhiều nhất)</option>
              <option value="PENDING_DESC">Đang chờ xử lý (Ưu tiên)</option>
              <option value="NAME_ASC">Tên đối tượng (A → Z)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
            {/* Pie Chart */}
            <div className="flex flex-col items-center w-full">
              <p className="text-center text-xs font-semibold text-slate-600 mb-1">Trạng thái Báo cáo</p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportsPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {reportsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} báo cáo`, "Số lượng"]}
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#e2e8f0" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Color Key List */}
              <div className="grid grid-cols-2 gap-1.5 w-full pt-2 border-t border-slate-100 text-xs">
                {reportsPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-slate-700 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.value} báo cáo</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stacked Bar Chart */}
            <div className="h-64 w-full">
              <p className="text-center text-xs font-semibold text-slate-600 mb-2">Đối tượng bị báo cáo</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedReportsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" style={{ fontSize: "10px" }} tickLine={false} />
                  <YAxis style={{ fontSize: "10px" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#e2e8f0" }}
                  />
                  <Bar dataKey="pending" name="Chờ xử lý" stackId="a" fill={CHART_COLORS.amber} />
                  <Bar dataKey="reviewing" name="Đang xem xét" stackId="a" fill={CHART_COLORS.primary} />
                  <Bar dataKey="resolved" name="Đã giải quyết" stackId="a" fill={CHART_COLORS.emerald} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHART 3: Lượng Tin Nhắn */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-slate-900">
              Lượng Tin Nhắn (Group vs Private Chat)
            </h2>
            <p className="text-xs text-slate-500">
              Số lượng tin nhắn trao đổi trên hệ thống chat.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <select
              value={messageTypeFilter}
              onChange={(e) => setMessageTypeFilter(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="ALL">Tất cả tin nhắn</option>
              <option value="GROUP">Chỉ Tin Nhắn Nhóm</option>
              <option value="PRIVATE">Chỉ Tin Nhắn Cá Nhân</option>
            </select>

            <select
              value={messageSortBy}
              onChange={(e) => setMessageSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="CHRONO">Theo mốc thời gian</option>
              <option value="TOTAL_DESC">Lượng tin nhắn (Nhiều nhất)</option>
              <option value="TOTAL_ASC">Lượng tin nhắn (Ít nhất)</option>
            </select>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedMessagesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGroup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrivate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" style={{ fontSize: "11px" }} tickLine={false} />
                <YAxis style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                {messageTypeFilter !== "PRIVATE" && (
                  <Area type="monotone" dataKey="groupMessages" name="Tin nhắn Nhóm" stroke={CHART_COLORS.teal} fillOpacity={1} fill="url(#colorGroup)" />
                )}
                {messageTypeFilter !== "GROUP" && (
                  <Area type="monotone" dataKey="privateMessages" name="Tin nhắn Cá nhân" stroke={CHART_COLORS.indigo} fillOpacity={1} fill="url(#colorPrivate)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Người Dùng Đăng Ký Mới */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-slate-900">
              Người Dùng Đăng Ký Mới
            </h2>
            <p className="text-xs text-slate-500">
              Tài khoản đăng ký mới (đã xác thực Email).
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <select
              value={userSortBy}
              onChange={(e) => setUserSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="CHRONO">Theo mốc thời gian</option>
              <option value="NEW_DESC">Đăng ký mới (Nhiều nhất)</option>
              <option value="NEW_ASC">Đăng ký mới (Ít nhất)</option>
            </select>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedNewUsersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" style={{ fontSize: "11px" }} tickLine={false} />
                <YAxis style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="newUsers" name="Tài khoản mới (Đã xác thực email)" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART 5: Thời Lượng Học Tập */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-slate-900">
            Thời Lượng Học Tập (Total Study Session Hours)
          </h2>
          <p className="text-xs text-slate-500">
            Tổng số giờ học tập được ghi nhận qua các buổi học Online / Offline.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <select
            value={studyModeFilter}
            onChange={(e) => setStudyModeFilter(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
          >
            <option value="ALL">Tất cả hình thức học</option>
            <option value="ONLINE">Chỉ Buổi học Online</option>
            <option value="OFFLINE">Chỉ Buổi học Offline</option>
          </select>

          <select
            value={studySortBy}
            onChange={(e) => setStudySortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
          >
            <option value="CHRONO">Theo mốc thời gian</option>
            <option value="HOURS_DESC">Thời lượng học (Nhiều nhất)</option>
            <option value="HOURS_ASC">Thời lượng học (Ít nhất)</option>
          </select>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedStudyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" style={{ fontSize: "11px" }} tickLine={false} />
              <YAxis style={{ fontSize: "11px" }} tickLine={false} axisLine={false} unit=" giờ" />
              <Tooltip formatter={(val: any) => [`${val} giờ`, "Thời lượng học"]} contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", borderColor: "#e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              {studyModeFilter === "ALL" && (
                <Bar dataKey="totalHours" name="Tổng giờ học" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
              )}
              {studyModeFilter !== "OFFLINE" && (
                <Bar dataKey="onlineSessions" name="Buổi học Online" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              )}
              {studyModeFilter !== "ONLINE" && studyModeFilter !== "ALL" && (
                <Bar dataKey="offlineSessions" name="Buổi học Offline" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
