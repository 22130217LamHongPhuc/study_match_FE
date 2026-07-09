import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Search, Users, GraduationCap, RefreshCw } from "lucide-react";

import { RootState } from "../../redux/store";
import { getRecommendedUsers } from "../../services/RecommendationService";
import { browseGroups, joinMemberIntoGroup, BrowseGroupResponse } from "../../services/GroupService";
import { requestFriendService } from "../../services/FriendService";

import RecommendationCard from "../StudyConnection/components/RecommendationCard";
import CommunityGroupCard, { CommunityGroup } from "../StudyConnection/components/CommunityGroupCard";
import { EmptyState } from "../StudyConnection/components/SharedStates";
import { SuggestedStudentSkeleton } from "../../components/home/SuggestedStudents";
import { CommunityGroupCardSkeleton } from "../StudyConnection/components/SuggestedGroupsSection";
import { RecommendationCardVm, RecommendationApiItem, FriendRequestVm } from "../StudyConnection/types";
import { STUDY_MODE_LABELS } from "../StudyConnection/constants";

function normalizeOptionalUserId(value: unknown): number | null {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
}

function mapToViewModel(item: RecommendationApiItem): RecommendationCardVm {
  const friendRequest = item.friend_request;

  return {
    userId: item.user_id,
    fullName: item.full_name ?? "Không xác định",
    studyGoal: item.study_goal,
    studyModeLabel: STUDY_MODE_LABELS[item.study_mode] ?? item.study_mode,
    avgScore: item.avg_score,
    studiedCredits: item.studied_credits,
    gender: item.gender,
    region: item.region,
    similarityScore: item.similarity_score,
    sharedSubjectScore: item.shared_subject_score,
    sharedSubjectCount: item.n_shared_subjects,
    finalScore: item.final_score,
    reasonText: item.reason_text ?? item.reasonText,
    matchPercentage: item.match_percentage,
    friendRequest: friendRequest
      ? {
          id: friendRequest.id,
          senderId: normalizeOptionalUserId(
            friendRequest.senderId ?? friendRequest.sender_id,
          ),
          receiverId: normalizeOptionalUserId(
            friendRequest.receiverId ?? friendRequest.receiver_id,
          ),
          status: friendRequest.status,
        }
      : null,
  };
}

function mapBrowseGroupToCommunityGroup(item: BrowseGroupResponse): CommunityGroup {
  return {
    id: item.id,
    name: item.name,
    subjectName: item.subjectName ?? "-",
    memberCount: item.memberCount ?? 0,
    status: item.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    visibility: (item.visibility as any) || "COMMUNITY",
    createdAt: item.createdAt,
    isMember: item.member || false,
  };
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query")?.trim() || "";

  const profileVm = useSelector((state: RootState) => state.profile.profileVm);
  const currentUserId = profileVm?.userId ?? Number(localStorage.getItem("userId") ?? 0);

  const [activeTab, setActiveTab] = useState<"classmates" | "groups">("classmates");
  const [localQuery, setLocalQuery] = useState(query);

  // Classmates state
  const [classmates, setClassmates] = useState<RecommendationCardVm[]>([]);
  const [loadingClassmates, setLoadingClassmates] = useState(false);
  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);

  // Groups state
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

  // Sync search parameter to local input
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Load classmates
  const fetchClassmates = useCallback(async () => {
    if (!currentUserId) return;
    setLoadingClassmates(true);
    try {
      const response = await getRecommendedUsers(currentUserId, 1, 100);
      if (response.success) {
        const mapped = response.recommendations.map(mapToViewModel);
        mapped.sort((a, b) => b.matchPercentage - a.matchPercentage);
        setClassmates(mapped);
      }
    } catch (err) {
      console.error("Error loading search classmates:", err);
    } finally {
      setLoadingClassmates(false);
    }
  }, [currentUserId]);

  // Load groups
  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const response = await browseGroups(undefined, undefined, 0, 100);
      if (response.success) {
        const content = response.data?.content ?? [];
        setGroups(content.map(mapBrowseGroupToCommunityGroup));
      }
    } catch (err) {
      console.error("Error loading search groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    fetchClassmates();
    fetchGroups();
  }, [fetchClassmates, fetchGroups]);

  // Filter classmates locally
  const filteredClassmates = useMemo(() => {
    if (!query) return classmates;
    const queryLower = query.toLowerCase();
    return classmates.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(queryLower) ||
        c.studyGoal?.toLowerCase().includes(queryLower) ||
        c.studyModeLabel?.toLowerCase().includes(queryLower) ||
        c.region?.toLowerCase().includes(queryLower)
    );
  }, [classmates, query]);

  // Filter groups locally
  const filteredGroups = useMemo(() => {
    const publicOrCommunityGroups = groups.filter((g) => g.visibility !== "PRIVATE");
    if (!query) return publicOrCommunityGroups;
    const queryLower = query.toLowerCase();
    return publicOrCommunityGroups.filter(
      (g) =>
        g.name?.toLowerCase().includes(queryLower) ||
        g.subjectName?.toLowerCase().includes(queryLower)
    );
  }, [groups, query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(localQuery.trim())}`);
  };

  const handleConnect = useCallback(
    async (targetUserId: number) => {
      if (!currentUserId) {
        toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }
      if (connectingUserId === targetUserId) return;
      setConnectingUserId(targetUserId);
      try {
        const response = await requestFriendService(targetUserId);
        const codeNum = Number(response.code);
        const isSuccess = codeNum >= 200 && codeNum < 300;
        if (!isSuccess) {
          toast.error(response.message || "Gửi lời mời kết bạn thất bại.");
          return;
        }
        toast.success("Đã gửi lời mời kết bạn!");
        setClassmates((prev) =>
          prev.map((item) => {
            if (item.userId === targetUserId) {
              return {
                ...item,
                friendRequest: {
                  id: (response.data as any)?.id || Date.now(),
                  senderId: currentUserId,
                  receiverId: targetUserId,
                  status: "FRIEND_REQUEST_SENT",
                },
              };
            }
            return item;
          })
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setConnectingUserId(null);
      }
    },
    [connectingUserId, currentUserId]
  );

  const handleJoinGroup = useCallback(
    async (groupId: number) => {
      if (!currentUserId) {
        toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }
      if (joiningGroupId === groupId) return;
      setJoiningGroupId(groupId);
      try {
        const response = await joinMemberIntoGroup(groupId, currentUserId);
        if (!response.success) {
          toast.error(response.message || "Tham gia nhóm thất bại.");
          return;
        }
        toast.success("Tham gia nhóm thành công!");
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, isMember: true, memberCount: g.memberCount + 1 }
              : g
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setJoiningGroupId(null);
      }
    },
    [currentUserId, joiningGroupId]
  );

  const handleViewProfile = useCallback(
    (recommendation: RecommendationCardVm) => {
      navigate(`/profile/${recommendation.userId}`);
    },
    [navigate]
  );

  return (
    <main className="min-h-full bg-orange-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          {/* Search header container */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Kết quả tìm kiếm</h1>
            {query && (
              <p className="text-sm text-gray-500 mt-1">
                Tìm thấy {activeTab === "classmates" ? filteredClassmates.length : filteredGroups.length} kết quả phù hợp cho từ khóa &ldquo;<span className="font-semibold text-orange-600">{query}</span>&rdquo;
              </p>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Tìm bạn học, nhóm học..."
              className="w-full h-10 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("classmates")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "classmates"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap size={16} />
            Bạn học ({filteredClassmates.length})
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "groups"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={16} />
            Nhóm học cộng đồng ({filteredGroups.length})
          </button>
        </div>

        {/* Search contents */}
        {activeTab === "classmates" ? (
          <div>
            {loadingClassmates ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <SuggestedStudentSkeleton />
                <SuggestedStudentSkeleton />
                <SuggestedStudentSkeleton />
                <SuggestedStudentSkeleton />
                <SuggestedStudentSkeleton />
                <SuggestedStudentSkeleton />
              </div>
            ) : filteredClassmates.length === 0 ? (
              <EmptyState
                title="Không tìm thấy bạn học"
                description=""
                imageUrl="https://app.studystream.live/assets/images/onboarding-slides/explanation-slide.png"
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredClassmates.map((item) => (
                  <RecommendationCard
                    key={item.userId}
                    recommendation={item}
                    onViewProfile={handleViewProfile}
                    onConnect={handleConnect}
                    isConnecting={connectingUserId === item.userId}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingGroups ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <CommunityGroupCardSkeleton />
                <CommunityGroupCardSkeleton />
                <CommunityGroupCardSkeleton />
              </div>
            ) : filteredGroups.length === 0 ? (
              <EmptyState
                title="Không tìm thấy nhóm học"
                description=""
                imageUrl="https://app.studystream.live/assets/images/onboarding-slides/result-slide.png"
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredGroups.map((group) => (
                  <CommunityGroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
