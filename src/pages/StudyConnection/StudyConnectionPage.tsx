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
        <ConnectionTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {renderActiveSection()}
      </div>
    </main>
  );
}
