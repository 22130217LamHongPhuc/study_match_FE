import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import WelcomeBanner from "../components/home/WelcomeBanner";
import QuickStats from "../components/home/QuickStats";
import SuggestedStudents, { SuggestedStudentVm } from "../components/home/SuggestedStudents";
import StudyPosts from "../components/home/StudyPosts";
import UpcomingScheduleCard, { ScheduleItem } from "../components/home/UpcomingScheduleCard";
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
      if (res && res.content) {
        if (isLoadMore) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newPosts = res.content.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newPosts];
          });
        } else {
          setPosts(res.content);
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
      const res = await getRecommendedUsers(userId, 1, 3);
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
    }
  }, [userId]);

  const [students, setStudents] = useState<SuggestedStudentVm[]>([]);



  const handlePostChanged = (updatedPost: SocialPost) => {
    setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: 1,
      title: "Nhóm tự học Thuật toán & Giải thuật",
      dateTime: "Hôm nay, 19:30 - 21:30",
      isOnline: true,
      locationOrUrl: "meet.google.com/abc-xyz-jkl",
    },
    {
      id: 2,
      title: "Học nhóm Toán rời rạc tại Thư viện",
      dateTime: "Ngày mai, 09:00 - 11:30",
      isOnline: false,
      locationOrUrl: "Phòng Tự học 3, Thư viện tầng 2",
    },
  ]);


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
      toast.success("Đã đồng ý lời mời kết bạn!");
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
      toast.success("Đã gửi lời mời kết bạn!");
    }
  };

  return (
    <main className="min-h-full bg-sand-50/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">


        <WelcomeBanner
          onFindMatch={() => {
            toast.info("Đang chuyển hướng đến bộ lọc tìm bạn học...");
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
            toast.info(`Xem chi tiết chỉ số: ${type}`);
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
                toast.info("Chuyển hướng đến trang Lịch học...");
              }}
              onViewDetails={(id) => {
                toast.info("Chi tiết buổi học #" + id);
              }}
            />
          </div>
        </div>
      </div>

      <CreatePostDialog
        open={showAddPostModal}
        onClose={() => setShowAddPostModal(false)}
        currentUserId={userId}
        authorName="StudyMatching"
        showSubjectSelect={true}
        onPostCreated={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
          toast.success("Đăng bài viết học tập thành công!");
        }}
        onPostingChange={setIsPosting}
      />
    </main>
  );
}
