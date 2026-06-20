import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ActionDistributionItem } from "../types";
import { actionStatusLabel } from "../utils";

const COLORS = ["#B8B3A8", "#D97706", "#6B8F71", "#E11D48"];

export function ActionDistributionChart({
  data,
}: {
  data: ActionDistributionItem[];
}) {
  const chartData = data.map((item) => ({
    name: actionStatusLabel[item.status],
    value: item.count,
  }));

  return (
    <div className="rounded-lg border border-sand-200 bg-white p-5">
      <h3 className="text-sm font-medium text-sand-800">
        Phân bố trạng thái matching
      </h3>
      <p className="mt-0.5 text-xs font-medium text-sand-500">
        Tỷ lệ các hành động ghép đôi
      </p>

      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
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
  );
}
