import {
  AlertCircle,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  UserCheck,
  UsersRound,
} from "lucide-react";

const statCards = [
  { title: "Sinh viên", value: "1,248", change: "+12%", icon: UserCheck },
  {
    title: "Nhóm hoạt động",
    value: "86",
    change: "+8 tuần này",
    icon: UsersRound,
  },
  {
    title: "Lượt gợi ý AI",
    value: "3,420",
    change: "68% tỷ lệ",
    icon: Sparkles,
  },
  {
    title: "Phản hồi chờ",
    value: "12",
    change: "5 matching",
    icon: AlertCircle,
    warning: true,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-sand-900">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-sand-500 mt-0.5">
            Chào mừng trở lại, phiên làm việc hiện tại của bạn là 2026-05-11.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="border border-sand-300 bg-white text-sand-700 hover:bg-sand-50 rounded-lg px-4 py-2 text-sm font-medium transition-all">
            Xuất dữ liệu
          </button>
          <button className="bg-sand-900 text-white hover:bg-sand-800 rounded-lg px-4 py-2 text-sm font-medium transition-all">
            Gửi thông báo
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} card={card} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-sand-200 bg-white p-5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-medium text-sand-800">
              Biểu đồ tăng trưởng (12 tháng)
            </h3>
            <MoreHorizontal
              size={16}
              className="text-sand-400 cursor-pointer"
            />
          </div>
          <div className="flex h-44 items-end gap-2 px-1">
            {[35, 55, 45, 85, 60, 95, 75, 80, 50, 70, 90, 65].map((h, i) => (
              <div
                key={i}
                className="relative flex-1 rounded-t-sm bg-sand-200 transition-all group hover:bg-sand-800"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-medium text-sand-500 opacity-0 group-hover:opacity-100">
                  {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 border-t border-sand-100 pt-3">
            {["T1", "T3", "T6", "T9", "T12"].map((m) => (
              <span key={m} className="text-[10px] font-medium text-sand-400">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-sand-200 bg-white p-5">
          <div>
            <h3 className="text-sm font-medium text-sand-800 mb-1">
              Hiệu quả Matching
            </h3>
            <p className="text-xs text-sand-400 uppercase font-medium">
              Tháng 5, 2026
            </p>
          </div>

          <div className="py-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-semibold text-sand-900">68.4%</span>
              <TrendingUp size={20} className="text-sage-600 mb-1" />
            </div>
            <div className="h-2 w-full bg-sand-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent-600 w-[68%]" />
            </div>
            <p className="text-xs text-sand-500 mt-3 font-medium">
              Tỷ lệ sinh viên chấp nhận gợi ý từ AI Matching tăng 4.2% so với
              tháng trước.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-sand-100 pt-4">
            <div className="text-center">
              <p className="text-[10px] font-medium text-sand-400 uppercase">
                Hợp lệ
              </p>
              <p className="text-sm font-medium text-sand-800">2.1k</p>
            </div>
            <div className="text-center border-l border-sand-100">
              <p className="text-[10px] font-medium text-sand-400 uppercase">
                Từ chối
              </p>
              <p className="text-sm font-medium text-sand-800">942</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  card,
}: {
  card: {
    title: string;
    value: string;
    change: string;
    warning?: boolean;
    icon: any;
  };
}) {
  const Icon = card.icon;
  return (
    <div className="rounded-lg border border-sand-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-sand-500">
          {card.title}
        </span>
        <div
          className={`${card.warning ? "text-amber-600" : "text-sand-500"}`}
        >
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-semibold text-sand-900 tracking-tight">
          {card.value}
        </h3>
        <span className="text-xs font-medium text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md">
          {card.change}
        </span>
      </div>
    </div>
  );
}
