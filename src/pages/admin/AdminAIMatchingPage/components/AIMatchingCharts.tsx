import type { ActionDistributionItem, MatchingTrendItem } from "../types";
import { ActionDistributionChart } from "./ActionDistributionChart";
import { MatchingTrendChart } from "./MatchingTrendChart";

type AIMatchingChartsProps = {
  distributionData: ActionDistributionItem[];
  trendData: MatchingTrendItem[];
};

export function AIMatchingCharts({
  distributionData,
  trendData,
}: AIMatchingChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ActionDistributionChart data={distributionData} />
      <MatchingTrendChart data={trendData} />
    </div>
  );
}
