import type { ActionDistributionItem, MatchingTrendItem } from "../types";
import { ActionDistributionChart } from "./ActionDistributionChart";
import { MatchingTrendChart } from "./MatchingTrendChart";

type AIMatchingChartsProps = {
  distributionData: ActionDistributionItem[];
  trendData: MatchingTrendItem[];
  loading?: boolean;
};

export function AIMatchingCharts({
  distributionData,
  trendData,
  loading,
}: AIMatchingChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-sand-200 bg-white p-5 animate-pulse">
          <div className="h-4 w-48 bg-sand-200 rounded" />
          <div className="mt-2 h-3.5 w-32 bg-sand-100 rounded" />
          <div className="mt-8 flex h-[240px] items-center justify-center">
            <div className="h-32 w-32 rounded-full border-[6px] border-sand-100 border-t-sand-200 animate-spin" />
          </div>
        </div>
        <div className="rounded-lg border border-sand-200 bg-white p-5 animate-pulse">
          <div className="h-4 w-48 bg-sand-200 rounded" />
          <div className="mt-2 h-3.5 w-32 bg-sand-100 rounded" />
          <div className="mt-8 flex h-[240px] items-end justify-between px-4">
            <div className="h-20 w-8 bg-sand-100 rounded" />
            <div className="h-28 w-8 bg-sand-200 rounded" />
            <div className="h-12 w-8 bg-sand-100 rounded" />
            <div className="h-36 w-8 bg-sand-200 rounded" />
            <div className="h-24 w-8 bg-sand-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ActionDistributionChart data={distributionData} />
      <MatchingTrendChart data={trendData} />
    </div>
  );
}
