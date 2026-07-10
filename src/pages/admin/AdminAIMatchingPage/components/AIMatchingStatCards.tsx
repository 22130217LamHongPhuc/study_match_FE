import React from "react";
import {
  Lightbulb,
  Eye,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  BrainCircuit,
  Star,
} from "lucide-react";
import type { MatchingStatisticsResponse } from "../types";
import { formatPercentage } from "../utils";

interface StatCardConfig {
  key: keyof MatchingStatisticsResponse;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  format: (value: number) => string;
  sub: (stats: MatchingStatisticsResponse) => string;
}

const cardConfigs: StatCardConfig[] = [
  {
    key: "totalViewed",
    label: "Đã xem",
    icon: Eye,
    format: (v) => v.toLocaleString("vi-VN"),
    sub: (s) =>
      `Tỷ lệ xem ${formatPercentage(s.totalViewed, s.totalRecommendationItems)}`,
  },
  {
    key: "totalFriendRequestSent",
    label: "Gửi lời mời",
    icon: UserPlus,
    format: (v) => v.toLocaleString("vi-VN"),
    sub: (s) =>
      `Tỷ lệ gửi ${formatPercentage(s.totalFriendRequestSent, s.totalViewed)}`,
  },
  {
    key: "totalAccepted",
    label: "Đã chấp nhận",
    icon: UserCheck,
    format: (v) => v.toLocaleString("vi-VN"),
    sub: (s) =>
      `Tỷ lệ chấp nhận ${formatPercentage(s.totalAccepted, s.totalFriendRequestSent)}`,
  },
  {
    key: "totalRejected",
    label: "Đã từ chối",
    icon: UserX,
    format: (v) => v.toLocaleString("vi-VN"),
    sub: (s) =>
      `Tỷ lệ từ chối ${formatPercentage(s.totalRejected, s.totalFriendRequestSent)}`,
  },
  {
    key: "totalFeedbacks",
    label: "Tổng phản hồi",
    icon: MessageSquare,
    format: (v) => v.toLocaleString("vi-VN"),
    sub: () => "Phản hồi sau học tập",
  },
  {
    key: "averageFinalScore",
    label: "Điểm AI trung bình",
    icon: BrainCircuit,
    format: (v) => v.toFixed(2),
    sub: () => "Điểm tương thích AI",
  },
  {
    key: "averageRating",
    label: "Điểm đánh giá TB",
    icon: Star,
    format: (v) => v.toFixed(1),
    sub: () => "Trung bình sao đánh giá",
  },
];

export function AIMatchingStatCards({
  stats,
  loading,
}: {
  stats: MatchingStatisticsResponse;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardConfigs.map((cfg) => (
          <div
            key={cfg.key}
            className="rounded-lg border border-sand-200 bg-white p-5 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-sand-200 rounded" />
              <div className="h-4 w-4 bg-sand-200 rounded" />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <div className="h-8 w-16 bg-sand-200 rounded" />
              <div className="h-4 w-24 bg-sand-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardConfigs.map((cfg) => {
        const Icon = cfg.icon;
        const value = stats[cfg.key];
        return (
          <div
            key={cfg.key}
            className="rounded-lg border border-sand-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-sand-500">
                {cfg.label}
              </span>
              <div className="text-sand-500">
                <Icon size={16} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold tracking-tight text-sand-900">
                {cfg.format(value)}
              </h3>
              <span className="rounded-md bg-sage-50 px-1.5 py-0.5 text-xs font-medium text-sage-700">
                {cfg.sub(stats)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
