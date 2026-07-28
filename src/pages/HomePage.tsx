import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import WelcomeBanner from "../components/home/WelcomeBanner";
import QuickStats from "../components/home/QuickStats";
import SuggestedStudents, { SuggestedStudentVm } from "../components/home/SuggestedStudents";
import StudyPosts from "../components/home/StudyPosts";
import UpcomingScheduleCard from "../components/home/UpcomingScheduleCard";
import { StudySessionResponse } from "./StudySession/types";
import { getTopUpcomingSessions } from "../services/StudySessionService";
import { useNavigate } from "react-router-dom";
import CreatePostDialog from "../components/modal/user/CreatePostDialog";
import { SocialPost, loadFeedPosts } from "../services/SocialPostService";
import { useProfileData } from "./MyProfile/hooks/useProfileData";
import { getUserGroupStats } from "../services/GroupService";
import { getFriendStatsService, requestFriendService, updateFriendRequestStatusService } from "../services/FriendService";
import { getRecommendedUsers } from "../services/RecommendationService";
import { STUDY_MODE_LABELS } from "./StudyConnection/constants";

export default function HomePage() {
  const userId = Number(localStorage.getItem("userId"));
  useProfileData(userId);
  const navigate = useNavigate();

  const [hasData, setHasData] = useState(true);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [joinedGroupCount, setJoinedGroupCount] = useState(0);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [friendCount, setFriendCount] = useState(0);
  const [pendingReceivedRequestCount, setPendingReceivedRequestCount] = useState(0);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const fetchPosts = async (pageNum: number, isLoadMore: boolean = false) => {
    if (!userId) return;
    setLoadingPosts(true);
    try {
      const res = await loadFeedPosts(pageNum, 10, userId);
      if (res && res.items) {
        if (isLoadMore) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newPosts = res.items.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newPosts];
          });
        } else {
          setPosts(res.items);
        }
        setPage(pageNum);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!userId) return;
    setLoadingRecommendations(true);
    try {
      const res = await getRecommendedUsers(userId, 1, 2);
      if (res && res.success && res.recommendations) {
        const mapped = res.recommendations.map((item) => {
          const friendRequest = item.friend_request;
          const normalizeOptionalUserId = (value: unknown): number | null => {
            const normalized = Number(value);
            return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
          };
          return {
            userId: item.user_id,
            fullName: item.full_name ?? "Không xác định",
            studyModeLabel: STUDY_MODE_LABELS[item.study_mode] ?? item.study_mode,
            matchPercentage: item.match_percentage,
            avgScore: item.avg_score,
            sharedSubjectCount: item.n_shared_subjects,
            studiedCredits: item.studied_credits,
            mainSubjectName: item.main_subject_name,
            avatarUrl: item.avatar_url,
            commonGroups: item.common_groups,
            studyGoal: item.study_goal,
            region: item.region,
            friendRequest: friendRequest
              ? {
                id: friendRequest.id,
                senderId: normalizeOptionalUserId(friendRequest.senderId ?? friendRequest.sender_id),
                receiverId: normalizeOptionalUserId(friendRequest.receiverId ?? friendRequest.receiver_id),
                status: friendRequest.status,
              }
              : null,
          };
        });
        setStudents(mapped);
      }
    } catch (err) {
      console.error("Error loading recommendations:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    if (userId) {
      setLoadingStats(true);
      Promise.all([
        getUserGroupStats(userId).then((res) => {
          if (res.success && res.data) {
            setJoinedGroupCount(res.data.joinedGroupCount);
            setPendingInvitationCount(res.data.pendingInvitationCount);
          }
        }),
        getFriendStatsService(userId).then((res) => {
          if (res && res.data) {
            setFriendCount(res.data.friendCount);
            setPendingReceivedRequestCount(res.data.pendingReceivedRequestCount);
          }
        })
      ]).finally(() => {
        setLoadingStats(false);
      });
      fetchPosts(0, false);
      fetchRecommendations();
      fetchUpcomingSchedules();
    }
  }, [userId]);

  const [students, setStudents] = useState<SuggestedStudentVm[]>([]);



  const handlePostChanged = (updatedPost: SocialPost) => {
    setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handlePostCreated = () => {
    setPosts([]);
    void fetchPosts(0, false);
  };

  const [schedules, setSchedules] = useState<StudySessionResponse[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const fetchUpcomingSchedules = async () => {
    if (!userId) return;
    setLoadingSchedules(true);
    try {
      const res = await getTopUpcomingSessions(userId);
      if (res && res.success && res.data) {
        setSchedules(res.data);
      }
    } catch (err) {
      console.error("Error loading upcoming schedules:", err);
    } finally {
      setLoadingSchedules(false);
    }
  };


  const handleAcceptRequest = async (request: any) => {
    const res = await updateFriendRequestStatusService(request.id, "APPROVED");
    if (res) {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.friendRequest && student.friendRequest.id === request.id) {
            return {
              ...student,
              friendRequest: {
                ...student.friendRequest,
                status: "ACCEPTED",
              },
            };
          }
          return student;
        })
      );
    }
  };


  const handleSendRequest = async (targetUserId: number) => {
    const res = await requestFriendService(targetUserId);
    if (res) {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.userId === targetUserId) {
            return {
              ...student,
              friendRequest: {
                id: (res.data as any)?.id || Date.now(),
                senderId: userId,
                receiverId: targetUserId,
                status: "FRIEND_REQUEST_SENT",
              },
            };
          }
          return student;
        })
      );
    }
  };

  return (
    <main className="min-h-full bg-blue-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">


        <WelcomeBanner
          onFindMatch={() => {
            navigate("/recommendation")
          }}
          onPostGroup={() => {
            setShowAddPostModal(true);
          }}
        />

        <QuickStats
          friendsCount={hasData ? friendCount : 0}
          friendRequestsCount={hasData ? pendingReceivedRequestCount : 0}
          groupsCount={hasData ? joinedGroupCount : 0}
          groupInvitesCount={hasData ? pendingInvitationCount : 0}
          onStatClick={(type) => {
          }}
          loading={loadingStats}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-start">
          <div className="space-y-6 lg:col-span-3">
            <SuggestedStudents
              students={hasData ? students : []}
              onViewProfile={(student) => {
                toast.info(`Xem chi tiết hồ sơ người dùng #${student.userId}`);
              }}
              onConnect={handleSendRequest}
              onAccept={handleAcceptRequest}
              currentUserId={userId}
              loading={loadingRecommendations}
            />

            <StudyPosts
              posts={hasData ? posts : []}
              currentUserId={userId}
              onAddPost={() => {
                setShowAddPostModal(true);
              }}
              onPostChanged={handlePostChanged}
              onPostDeleted={handlePostDeleted}
              onPostCreated={handlePostCreated}
              isPosting={isPosting}
              onLoadMore={() => fetchPosts(page + 1, true)}
              hasMore={page < totalPages - 1}
              loadingMore={loadingPosts}
            />
          </div>

          <div className="space-y-6 lg:col-span-1">
            <UpcomingScheduleCard
              schedules={hasData ? schedules : []}
              onViewCalendar={() => {
                navigate("/schedule");
              }}
              onViewDetails={(session) => {
                navigate(`/schedule?sessionId=${session.id}`);
              }}
            />
          </div>
        </div>
      </div>


    </main>
  );
}
