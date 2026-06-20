import {
  BarChart3,
  MessageSquare,
  Star,
  UserRound,
  Users2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComponentType } from "react";
import type { StudyFeedbackStatisticsResponse } from "../types";

type StatCardItem = {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number }>;
  sub: string;
};

const PIE_COLORS = ["#44403C", "#6B8F71"];

export function FeedbackStatisticsPanel({
  stats,
}: {
  stats: StudyFeedbackStatisticsResponse;
}) {
  const percentOfTotal = (value: number) => {
    if (stats.totalFeedbacks === 0) return "0%";
    return `${Math.round((value / stats.totalFeedbacks) * 100)}%`;
  };

  const statCards: StatCardItem[] = [
    {
      label: "Tổng phản hồi",
      value: stats.totalFeedbacks.toLocaleString("vi-VN"),
      icon: MessageSquare,
      sub: "Tổng feedback sau phiên học",
    },
    {
      label: "Điểm trung bình",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      sub: "Trung bình sao đánh giá",
    },
    {
      label: "Điểm tương thích TB",
      value: stats.averageCompatibilityRating.toFixed(1),
      icon: BarChart3,
      sub: "Compatibility trung bình",
    },
    {
      label: "Phản hồi học 1-1",
      value: stats.oneToOneFeedbacks.toLocaleString("vi-VN"),
      icon: UserRound,
      sub: `${percentOfTotal(stats.oneToOneFeedbacks)} tổng phản hồi`,
    },
    {
      label: "Phản hồi học nhóm",
      value: stats.groupFeedbacks.toLocaleString("vi-VN"),
      icon: Users2,
      sub: `${percentOfTotal(stats.groupFeedbacks)} tổng phản hồi`,
    },
  ];

  const ratingChartData = ["5", "4", "3", "2", "1"].map((star) => ({
    name: `${star} sao`,
    value: stats.ratingDistribution[star] ?? 0,
  }));

  const sessionTypeData = [
    { name: "Học 1-1", value: stats.oneToOneFeedbacks },
    { name: "Học nhóm", value: stats.groupFeedbacks },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-lg border border-sand-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  {card.label}
                </span>
                <div className="text-sand-500">
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <h3 className="text-2xl font-semibold tracking-tight text-sand-900">
                  {card.value}
                </h3>
                <span className="rounded-md bg-sage-50 px-1.5 py-0.5 text-xs font-medium text-sage-700">
                  {card.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-sand-200 bg-white p-5">
          <h3 className="text-sm font-medium text-sand-800">
            Phân bổ rating
          </h3>
          <p className="mt-0.5 text-xs font-medium text-sand-500">
            Số lượng phản hồi theo mức sao đánh giá
          </p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingChartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#9C9688", fontWeight: 500 }}
                  axisLine={{ stroke: "#E8E6DF" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9C9688", fontWeight: 500 }}
                  axisLine={{ stroke: "#E8E6DF" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E8E6DF",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Số phản hồi"
                  fill="#B45309"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-sand-200 bg-white p-5">
          <h3 className="text-sm font-medium text-sand-800">
            Tỷ lệ loại phiên học
          </h3>
          <p className="mt-0.5 text-xs font-medium text-sand-500">
            So sánh phản hồi giữa học 1-1 và học nhóm
          </p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sessionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {sessionTypeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E8E6DF",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
