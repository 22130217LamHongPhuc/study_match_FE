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
      borderClass: "border-t-amber-500",
    },
    {
      id: "friendRequests",
      title: "Lời mời kết bạn",
      value: friendRequestsCount,
      description: "Chờ bạn phản hồi",
      borderClass: "border-t-blue-500",
    },
    {
      id: "groups",
      title: "Nhóm đã tham gia",
      value: groupsCount,
      description: "Đã tham gia",
      borderClass: "border-t-sage-500",
    },
    {
      id: "groupInvites",
      title: "Lời mời nhóm",
      value: groupInvitesCount,
      description: "Chờ bạn phản hồi",
      borderClass: "border-t-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        return (
          <button
            key={stat.id}
            onClick={() => onStatClick?.(stat.id)}
            className={`rounded-xl border border-gray-150 border-t-4 bg-white p-4 text-left transition-all duration-200 hover:shadow-xs cursor-pointer ${stat.borderClass}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {stat.title}
              </span>
            </div>
            {loading ? (
              <div className="mt-2.5 flex items-baseline gap-2 w-full animate-pulse">
                <span className="h-8 w-12 bg-gray-200 rounded" />
                <span className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ) : (
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-800">
                  {stat.value}
                </span>
                <span className="text-[10px] text-gray-400 line-clamp-1 font-medium">
                  {stat.description}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
