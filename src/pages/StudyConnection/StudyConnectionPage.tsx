import React, { useState } from "react";
import { GraduationCap } from "lucide-react";

import ConnectionTabs from "./components/ConnectionTabs";
import SuggestedFriendsSection from "./components/SuggestedFriendsSection";
import SuggestedGroupsSection from "./components/SuggestedGroupsSection";
import FriendRequestsSection from "./components/FriendRequestsSection";
import MyFriendsSection from "./components/MyFriendsSection";

export default function StudyConnectionPage() {
  const [activeTab, setActiveTab] = useState("suggested-friends");

  const renderActiveSection = () => {
    switch (activeTab) {
      case "suggested-friends":
        return <SuggestedFriendsSection />;
      case "suggested-groups":
        return <SuggestedGroupsSection />;
      case "friend-requests":
        return <FriendRequestsSection />;
      case "my-friends":
        return <MyFriendsSection />;
      default:
        return <SuggestedFriendsSection />;
    }
  };

  return (
    <main className="min-h-full bg-orange-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Kết nối học tập</h1>
              <p className="text-sm text-gray-500">
                Tìm bạn học, tham gia nhóm và quản lý các kết nối học tập của bạn
              </p>
            </div>
          </div>
        </section>

        <ConnectionTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {renderActiveSection()}
      </div>
    </main>
  );
}
