import type { StudySessionVm } from "../types";

interface QuickStatsProps {
  sessions: StudySessionVm[];
}

export function QuickStats({ sessions }: QuickStatsProps) {
  const today = new Date().toDateString();

  const todayCount = sessions.filter(
    (session) => new Date(session.startTime).toDateString() === today,
  ).length;

  const pendingCount = sessions.filter(
    (session) => session.participantStatus === "PENDING",
  ).length;

  const groupCount = sessions.filter(
    (session) => session.sessionType === "GROUP",
  ).length;

  const stats = [
    {
      label: "Lịch hôm nay",
      value: todayCount,
      helper: "Buổi học cần tham gia",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      label: "Tuần này",
      value: sessions.length,
      helper: "Tổng lịch trong tuần",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Chờ xác nhận",
      value: pendingCount,
      helper: "Lời mời cần phản hồi",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "Lịch nhóm",
      value: groupCount,
      helper: "Buổi học theo nhóm",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div
            className={`mb-4 inline-flex rounded-2xl px-3 py-2 text-sm font-semibold ${item.bg} ${item.text}`}
          >
            {item.label}
          </div>
          <div className="text-3xl font-bold text-slate-900">{item.value}</div>
          <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
        </div>
      ))}
    </section>
  );
}
