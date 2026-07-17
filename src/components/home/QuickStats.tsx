import React from "react";

interface QuickStatsProps {
  friendsCount?: number;
  friendRequestsCount?: number;
  groupsCount?: number;
  groupInvitesCount?: number;
  onStatClick?: (type: string) => void;
  loading?: boolean;
}

export default function QuickStats({
  friendsCount = 0,
  friendRequestsCount = 0,
  groupsCount = 0,
  groupInvitesCount = 0,
  onStatClick,
  loading = false,
}: QuickStatsProps) {
  const stats = [
    {
      id: "friends",
      title: "Bạn bè",
      value: friendsCount,
      description: "Đã kết bạn",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      id: "friendRequests",
      title: "Lời mời kết bạn",
      value: friendRequestsCount,
      description: "Chờ bạn phản hồi",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      id: "groups",
      title: "Nhóm đã tham gia",
      value: groupsCount,
      description: "Đã tham gia",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      id: "groupInvites",
      title: "Lời mời nhóm",
      value: groupInvitesCount,
      description: "Chờ bạn phản hồi",
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        return (
          <button
            key={stat.id}
            onClick={() => onStatClick?.(stat.id)}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-all duration-200 hover:shadow-sm cursor-pointer"
          >
            <div
              className="mb-4 inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200"
            >
              {stat.title}
            </div>
            {loading ? (
              <div className="flex flex-col gap-1.5 w-full animate-pulse">
                <span className="h-9 w-12 bg-gray-200 rounded" />
                <span className="h-4 w-24 bg-gray-100 rounded" />
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {stat.description}
                </p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
