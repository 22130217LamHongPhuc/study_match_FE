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
    <div className="p-6 overflow-y-auto">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Tổng quan hệ thống
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Chào mừng trở lại, phiên làm việc hiện tại của bạn là 2026-05-11.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-[12px] font-bold bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm transition-all">
            Xuất dữ liệu
          </button>
          <button className="px-3 py-1.5 text-[12px] font-bold bg-gray-900 text-white rounded hover:bg-gray-800 shadow-sm transition-all">
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
        <div className="lg:col-span-2 rounded border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-800">
              Biểu đồ tăng trưởng (12 tháng)
            </h3>
            <MoreHorizontal
              size={16}
              className="text-gray-400 cursor-pointer"
            />
          </div>
          <div className="flex h-44 items-end gap-2 px-1">
            {[35, 55, 45, 85, 60, 95, 75, 80, 50, 70, 90, 65].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-100 rounded-t-sm relative group transition-all hover:bg-blue-600"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-500 opacity-0 group-hover:opacity-100">
                  {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 border-t border-gray-50 pt-3">
            {["T1", "T3", "T6", "T9", "T12"].map((m) => (
              <span key={m} className="text-[10px] font-bold text-gray-400">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Hiệu quả Matching
            </h3>
            <p className="text-[11px] text-gray-400 uppercase font-bold">
              Tháng 5, 2026
            </p>
          </div>

          <div className="py-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-black text-gray-900">68.4%</span>
              <TrendingUp size={20} className="text-emerald-500 mb-1" />
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[68%]" />
            </div>
            <p className="text-[11px] text-gray-500 mt-3 font-medium">
              Tỷ lệ sinh viên chấp nhận gợi ý từ AI Matching tăng 4.2% so với
              tháng trước.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Hợp lệ
              </p>
              <p className="text-sm font-bold text-gray-800">2.1k</p>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Từ chối
              </p>
              <p className="text-sm font-bold text-gray-800">942</p>
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
    <div className="rounded border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          {card.title}
        </span>
        <div
          className={`${card.warning ? "text-orange-500" : "text-blue-600"}`}
        >
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
          {card.value}
        </h3>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
          {card.change}
        </span>
      </div>
    </div>
  );
}
