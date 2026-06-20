import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MatchingTrendItem } from "../types";
import { formatDate } from "../utils";

const LINES = [
  { dataKey: "totalRecommendations", name: "Tổng", color: "#44403C" },
  { dataKey: "viewed", name: "Đã xem", color: "#B8B3A8" },
  { dataKey: "friendRequestSent", name: "Gửi lời mời", color: "#D97706" },
  { dataKey: "accepted", name: "Chấp nhận", color: "#6B8F71" },
  { dataKey: "rejected", name: "Từ chối", color: "#E11D48" },
];

export function MatchingTrendChart({ data }: { data: MatchingTrendItem[] }) {
  const formattedData = data.map((item) => ({
    ...item,
    dateLabel: formatDate(item.date),
  }));

  return (
    <div className="rounded-lg border border-sand-200 bg-white p-5">
      <h3 className="text-sm font-medium text-sand-800">
        Xu hướng matching theo thời gian
      </h3>
      <p className="mt-0.5 text-xs font-medium text-sand-500">
        Biến động các chỉ số matching trong 7 ngày gần nhất
      </p>

      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
            <XAxis
              dataKey="dateLabel"
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
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", fontWeight: 500 }}
            />
            {LINES.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
