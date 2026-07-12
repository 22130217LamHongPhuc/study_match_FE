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
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      label: "Tuần này",
      value: sessions.length,
      helper: "Tổng lịch trong tuần",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Chờ xác nhận",
      value: pendingCount,
      helper: "Lời mời cần phản hồi",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Lịch nhóm",
      value: groupCount,
      helper: "Buổi học theo nhóm",
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-all duration-200 hover:shadow-sm"
        >
          <div
            className="mb-4 inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200"
          >
            {item.label}
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800">{item.value}</div>
            <p className="mt-1 text-sm text-gray-500">{item.helper}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
