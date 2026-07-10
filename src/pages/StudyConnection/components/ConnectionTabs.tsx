import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { loadFriendRequestsService } from "../../../services/FriendService";

export interface TabItem {
  id: string;
  label: string;
}

interface ConnectionTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TABS: TabItem[] = [
  {
    id: "suggested-friends",
    label: "Gợi ý bạn học",
  },
  {
    id: "suggested-groups",
    label: "Gợi ý nhóm học",
  },
  {
    id: "friend-requests",
    label: "Lời mời kết bạn",
  },
  {
    id: "my-friends",
    label: "Bạn bè của tôi",
  },
];

export default function ConnectionTabs({ activeTab, onTabChange }: ConnectionTabsProps) {
  const [requestCount, setRequestCount] = useState<number>(0);
  const socketEvent = useSelector((state: RootState) => state.chat.newMess?.event);

  const fetchRequestCount = useCallback(async () => {
    try {
      const data = await loadFriendRequestsService();
      if (data && Array.isArray(data.received)) {
        const pendingCount = data.received.filter((req) => req.status === "PENDING").length;
        setRequestCount(pendingCount);
      }
    } catch (error) {
      console.error("Failed to load friend request count:", error);
    }
  }, []);

  useEffect(() => {
    fetchRequestCount();
  }, [fetchRequestCount]);

  useEffect(() => {
    if (
      socketEvent === "FRIEND_REQUEST_RECEIVE" ||
      socketEvent === "FRIEND_REQUEST_CANCEL_RECEIVE" ||
      socketEvent === "FRIEND_REQUEST_ACCEPT_RECEIVE"
    ) {
      fetchRequestCount();
    }
  }, [socketEvent, fetchRequestCount]);

  return (
    <div className="flex">
      {/* Outer rounded capsule border container */}
      <div className="inline-flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-full shadow-sm">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "friend-requests" && requestCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center px-4 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer border ${
                isActive
                  ? "bg-orange-50 text-orange-600 border-orange-200 shadow-sm"
                  : "bg-transparent text-gray-500 border-transparent hover:text-orange-600"
              }`}
            >
              {tab.label}
              
              {/* Badge count indicating pending requests */}
              {showBadge && (
                <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                  {requestCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
