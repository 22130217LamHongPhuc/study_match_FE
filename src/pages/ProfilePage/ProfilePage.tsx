import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EditProfileModal from "../../components/modal/user/EditProfileModal";
import { ProfileStatus } from "../../enum/Profile";
import { UserProfile } from "../../model/UserModel";
import { getProfileByUserId } from "../../services/ProfileService";
import { ProfileApiResponse } from "../MyProfile/types";

import { loadProfileService, requestFriendService, unfriendService } from "../../services/FriendService";
import { matchingItemApi } from "../../services/matchingItemApi";
import {
  Achievement,
  createPost,
  loadAchievements,
  loadProfilePosts,
  loadProfileSocialStats,
  ProfileSocialStats,
  SocialPost,
  uploadPostMedia,
} from "../../services/SocialPostService";
import Post from "./Post";

const MAX_POST_MEDIA = 10;

type PostVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

const visibilityOptions: { value: PostVisibility; label: string; icon: React.ReactNode }[] = [
  { value: "PUBLIC", label: "Công khai", icon: <PublicIcon sx={{ fontSize: 15 }} /> },
  { value: "FRIENDS", label: "Bạn bè", icon: <PeopleIcon sx={{ fontSize: 15 }} /> },
  { value: "PRIVATE", label: "Riêng tư", icon: <LockIcon sx={{ fontSize: 15 }} /> },
];

type SelectedMediaItem = {
  file: File;
  preview: string;
};
type RecommendationState = {
  fromRecommendation?: boolean;
  finalScore?: number;
  reasonText?: string;
};

const profileTheme = createTheme({
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
});

export default function ProfilePage() {
  const location = useLocation();
  const recommendation = location.state as RecommendationState | null;

  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [modalEdit, setModalEdit] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [stats, setStats] = useState<ProfileSocialStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState<PostVisibility>("PUBLIC");
  const [visibilityAnchorEl, setVisibilityAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMediaItems, setSelectedMediaItems] = useState<SelectedMediaItem[]>([]);
  const [posting, setPosting] = useState(false);
  const [unfriendConfirmOpen, setUnfriendConfirmOpen] = useState(false);
  const [studyProfile, setStudyProfile] = useState<ProfileApiResponse | null>(null);
  const [loadingStudyProfile, setLoadingStudyProfile] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const trackedViewKeyRef = useRef<string | null>(null);

  const currentUserId = Number(localStorage.getItem("userId"));
  const profileUserId = Number(id);
  const isOwnProfile = currentUserId === profileUserId;

  const selectedVisibility =
    visibilityOptions.find((option) => option.value === postVisibility) || visibilityOptions[0];

  useEffect(() => {
    if (!profileUserId) return;
    setActiveTab(0);
    loadProfileService(profileUserId)
      .then((response: UserProfile) => setProfile(response))
      .catch((error) => console.error("Cannot load profile", error));
  }, [profileUserId]);

  useEffect(() => {
    if (!profileUserId || isOwnProfile) {
      setStudyProfile(null);
      return;
    }
    setLoadingStudyProfile(true);
    getProfileByUserId(profileUserId)
      .then((data) => {
        setStudyProfile(data);
      })
      .catch((error) => {
        console.error("Cannot load study profile", error);
      })
      .finally(() => {
        setLoadingStudyProfile(false);
      });
  }, [profileUserId, isOwnProfile]);

  useEffect(() => {
    if (!currentUserId || !profileUserId) return;
    if (currentUserId === profileUserId) return;
    if (!recommendation?.fromRecommendation) return;
    if (!recommendation.finalScore || recommendation.finalScore <= 0) return;

    const viewKey = `${currentUserId}:${profileUserId}`;
    if (trackedViewKeyRef.current === viewKey) return;
    trackedViewKeyRef.current = viewKey;

    const trackProfileViewed = async () => {
      try {
        await matchingItemApi.recordAction({
          userId: currentUserId,
          recommendedUserId: profileUserId,
          actionStatus: "VIEWED",
          finalScore: recommendation.finalScore,
          reasonText: recommendation.reasonText,
        });
      } catch (error) {
        console.error("Track matching VIEWED failed", error);
      }
    };

    void trackProfileViewed();
  }, [
    currentUserId,
    profileUserId,
    recommendation?.fromRecommendation,
    recommendation?.finalScore,
    recommendation?.reasonText,
  ]);
  useEffect(() => {
    if (!profileUserId) return;
    Promise.all([
      loadProfilePosts(profileUserId, currentUserId),
      loadProfileSocialStats(profileUserId),
      loadAchievements(profileUserId),
    ])
      .then(([postList, statData, achievementList]) => {
        setPosts(postList);
        setStats(statData);
        setAchievements(achievementList);
      })
      .catch((error) => console.error("Cannot load profile social data", error));
  }, [profileUserId, currentUserId]);

  useEffect(() => {
    const handleStatusUpdate = () => {
      if (!profileUserId) return;
      loadProfileService(profileUserId)
        .then((response: UserProfile) => setProfile(response))
        .catch((error) => console.error("Cannot load profile", error));

      Promise.all([
        loadProfilePosts(profileUserId, currentUserId),
        loadProfileSocialStats(profileUserId),
        loadAchievements(profileUserId),
      ])
        .then(([postList, statData, achievementList]) => {
          setPosts(postList);
          setStats(statData);
          setAchievements(achievementList);
        })
        .catch((error) => console.error("Cannot load profile social data", error));
    };

    window.addEventListener("friend_status_updated", handleStatusUpdate);
    return () => window.removeEventListener("friend_status_updated", handleStatusUpdate);
  }, [profileUserId, currentUserId]);


  const requestFriend = async () => {
    if (!currentUserId || !profileUserId) return;
    if (currentUserId === profileUserId) return;

    const response = await requestFriendService(profileUserId);
    if (response.code !== "201" && response.code !== 201) {
      alert("Gửi lời mời thất bại");
      return;
    }

    try {
      await matchingItemApi.updateStatus({
        userId: currentUserId,
        recommendedUserId: profileUserId,
        actionStatus: "FRIEND_REQUEST_SENT",
      });
    } catch (error) {
      console.error("Track matching FRIEND_REQUEST_SENT failed", error);
    }

    setProfile((prev) => (prev ? { ...prev, statusFriend: ProfileStatus.PENDING } : prev));
  };

  const handleUnfriend = async () => {
    if (!profileUserId || !currentUserId) return;
    try {
      const response = await unfriendService(currentUserId, profileUserId);
      if (response.code === 200 || response.code === "200") {
        setProfile((prev) => prev ? { ...prev, friend: false, statusFriend: undefined } : prev);
        setUnfriendConfirmOpen(false);
        const statData = await loadProfileSocialStats(profileUserId);
        setStats(statData);
      } else {
        alert("Hủy kết bạn thất bại: " + (response.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Failed to unfriend", error);
      alert("Đã xảy ra lỗi khi hủy kết bạn.");
    }
  };


  const sendMess = () => {
    navigate("/conversation", {
      state: {
        conversationKind: "PRIVATE",
        targetUserId: profileUserId,
        avatar: profile?.avatarUrl,
        fullName: profile?.fullName,
      },
    });
  };

  const clearSelectedMedia = () => {
    selectedMediaItems.forEach((item) => URL.revokeObjectURL(item.preview));
    setSelectedMediaItems([]);
  };

  const removeSelectedMedia = (index: number) => {
    setSelectedMediaItems((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSelectMedia = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    const validFiles = files.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
    if (validFiles.length !== files.length) {
      alert("Chỉ chọn ảnh hoặc video");
    }

    setSelectedMediaItems((prev) => {
      const availableSlots = MAX_POST_MEDIA - prev.length;
      if (availableSlots <= 0) {
        alert(`Chỉ được thêm tối đa ${MAX_POST_MEDIA} ảnh/video`);
        return prev;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);
      if (validFiles.length > availableSlots) {
        alert(`Chỉ được thêm tối đa ${MAX_POST_MEDIA} ảnh/video`);
      }

      return [
        ...prev,
        ...filesToAdd.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        })),
      ];
    });
  };

  const handleCloseCreatePost = () => {
    if (posting) return;
    setCreatePostOpen(false);
    setPostContent("");
    setPostVisibility("PUBLIC");
    setVisibilityAnchorEl(null);
    clearSelectedMedia();
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedMediaItems.length === 0) return;
    setPosting(true);
    try {
      const uploadedMedia = await Promise.all(selectedMediaItems.map((item) => uploadPostMedia(item.file)));
      const post = await createPost({
        authorId: currentUserId,
        content: postContent.trim(),
        visibility: postVisibility,
        media: uploadedMedia,
      });
      setPosts((prev) => [post, ...prev]);
      setStats((prev) => (prev ? { ...prev, postCount: prev.postCount + 1 } : prev));
      handleCloseCreatePost();
    } catch (error) {
      console.error(error);
      alert("Không thể tạo bài viết");
    } finally {
      setPosting(false);
    }
  };

  const renderFeed = () => (
    <>
      {isOwnProfile && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "#fff", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setCreatePostOpen(true)}
            sx={{ py: 1.25, borderRadius: "8px", textTransform: "none", fontWeight: 800 }}
          >
            Thêm bài viết
          </Button>
        </Box>
      )}

      {posts.length === 0 ? (
        <Typography sx={{ mt: 3, color: "#6b7280" }}>Chưa có bài viết nào</Typography>
      ) : (
        posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onPostChanged={(nextPost) => {
              setPosts((prev) => prev.map((item) => (item.id === nextPost.id ? nextPost : item)));
            }}
            onPostDeleted={(postId) => {
              setPosts((prev) => prev.filter((item) => item.id !== postId));
              setStats((prev) => (prev ? { ...prev, postCount: Math.max(0, prev.postCount - 1) } : prev));
            }}
          />
        ))
      )}
    </>
  );

  const renderAchievements = () => (
    <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
      {achievements.length === 0 ? (
        <Typography sx={{ color: "#6b7280" }}>Chưa có thành tích</Typography>
      ) : (
        achievements.map((achievement) => (
          <Box key={achievement.code} sx={{ p: 2, bgcolor: "#fff", borderRadius: "8px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
            <Typography sx={{ fontWeight: 800, color: achievement.achieved ? "#1d4ed8" : "#374151" }}>
              {achievement.title}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6b7280", mt: 0.5 }}>{achievement.description}</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (achievement.progress / Math.max(1, achievement.target)) * 100)}
              sx={{ mt: 1.5, height: 8, borderRadius: 8 }}
            />
            <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.75 }}>
              {achievement.progress}/{achievement.target}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );

  const renderStats = () => (
    <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2 }}>
      {[
        ["Bài viết", stats?.postCount ?? 0],
        ["Lượt thích", stats?.likeCount ?? 0],
        ["Bình luận", stats?.commentCount ?? 0],
        ["Bạn bè", stats?.friendCount ?? 0],
      ].map(([label, value]) => (
        <Box key={label} sx={{ p: 2, bgcolor: "#fff", borderRadius: "8px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
          <Typography sx={{ color: "#6b7280" }}>{label}</Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 800 }}>{value}</Typography>
        </Box>
      ))}
    </Box>
  );

  const renderStudyProfile = () => {
    if (loadingStudyProfile) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!studyProfile) {
      return (
        <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: "8px", mt: 2 }}>
          <Typography sx={{ color: "#64748b" }}>Không có thông tin hồ sơ học tập</Typography>
        </Box>
      );
    }

    const termProfile = studyProfile.termProfiles?.[0];
    const mainSubject = termProfile?.mainSubjectName || "Chưa cập nhật";
    const rawGoal = termProfile?.studyGoal || "";
    const rawMode = termProfile?.studyMode || "";

    const studyGoalLabels: Record<string, string> = {
      Survivor: "Cần củng cố nền tảng",
      "Passive Learner": "Học ở mức cơ bản",
      "Standard Learner": "Học ổn định",
      "High Achiever": "Học tốt và định hướng điểm cao",
    };

    const studyModeLabels: Record<string, string> = {
      mutual_support: "Học cùng bạn ngang trình độ",
      peer_support: "Học cùng bạn khá hơn",
      challenge: "Học cùng bạn học tốt",
      support: "Hỗ trợ bạn khác",
    };

    const displayGoal = studyGoalLabels[rawGoal] || rawGoal || "Chưa cập nhật";
    const displayMode = studyModeLabels[rawMode] || rawMode || "Chưa cập nhật";

    const enrollments = studyProfile.enrollments || [];
    const freeTimeSlots = studyProfile.freeTimeSlots || [];

    const daysMeta = [
      { id: 0, label: "T2", fullName: "Thứ Hai" },
      { id: 1, label: "T3", fullName: "Thứ Ba" },
      { id: 2, label: "T4", fullName: "Thứ Tư" },
      { id: 3, label: "T5", fullName: "Thứ Năm" },
      { id: 4, label: "T6", fullName: "Thứ Sáu" },
      { id: 5, label: "T7", fullName: "Thứ Bảy" },
      { id: 6, label: "CN", fullName: "Chủ Nhật" },
    ];

    const slotsMap: Record<string, string> = {
      ca1: "Ca 1",
      ca2: "Ca 2",
      ca3: "Ca 3",
      ca4: "Ca 4",
      ca5: "Ca 5",
      ca6: "Ca 6",
    };

    const groupedFreeTime: Record<number, string[]> = {};
    freeTimeSlots.forEach((slot) => {
      if (slot.isAvailable) {
        if (!groupedFreeTime[slot.dayOfWeek]) {
          groupedFreeTime[slot.dayOfWeek] = [];
        }
        groupedFreeTime[slot.dayOfWeek].push(slot.slotCode);
      }
    });

    return (
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
              Môn học mong muốn
            </Typography>
            <Typography variant="body1" sx={{ color: "#2563eb", fontWeight: 700, fontSize: "15px" }}>
              {mainSubject}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              borderLeft: { xs: "none", md: "1px solid #e2e8f0" },
              borderTop: { xs: "1px solid #e2e8f0", md: "none" },
            }}
          >
            <Typography variant="subtitle2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
              Trình độ học tập
            </Typography>
            <Typography variant="body1" sx={{ color: "#1e293b", fontWeight: 700, fontSize: "15px" }}>
              {displayGoal}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              borderLeft: { xs: "none", md: "1px solid #e2e8f0" },
              borderTop: { xs: "1px solid #e2e8f0", md: "none" },
            }}
          >
            <Typography variant="subtitle2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
              Mục tiêu học tập với đối tác
            </Typography>
            <Typography variant="body1" sx={{ color: "#1e293b", fontWeight: 700, fontSize: "15px" }}>
              {displayMode}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3, borderRadius: "12px", border: "1px solid #e2e8f0", bgcolor: "#fff" }}>
          <Typography variant="subtitle2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", mb: 2 }}>
            Thời gian học rảnh trong tuần
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {daysMeta.map((day) => {
              const slots = groupedFreeTime[day.id];
              const hasSlots = slots && slots.length > 0;
              return (
                <Box
                  key={day.id}
                  sx={{
                    flex: "1 1 0px",
                    minWidth: "85px",
                    p: 1.5,
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: hasSlots ? "rgba(37, 99, 235, 0.2)" : "#f1f5f9",
                    bgcolor: hasSlots ? "rgba(37, 99, 235, 0.03)" : "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: "12px", color: hasSlots ? "#2563eb" : "#94a3b8" }}>
                    {day.fullName}
                  </Typography>
                  {hasSlots ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
                      {slots.sort().map((slotCode) => (
                        <Chip
                          key={slotCode}
                          label={slotsMap[slotCode] || slotCode}
                          size="small"
                          sx={{
                            fontSize: "10px",
                            height: "18px",
                            bgcolor: "#e0f2fe",
                            color: "#0369a1",
                            fontWeight: 700,
                            borderRadius: "4px",
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "11px", color: "#cbd5e1", fontStyle: "italic", mt: 0.5 }}>
                      Bận
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ p: 3, borderRadius: "12px", border: "1px solid #e2e8f0", bgcolor: "#fff" }}>
          <Typography variant="subtitle2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", mb: 2 }}>
            Các môn học đang tham gia đăng ký khác
          </Typography>
          {enrollments.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "14px" }}>
              Chưa đăng ký môn học nào khác
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {enrollments.map((enrollment) => (
                <Chip
                  key={enrollment.enrollmentId}
                  label={`${enrollment.subject.subjectCode} - ${enrollment.subject.subjectName}`}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontWeight: 500,
                    fontSize: "12px",
                    borderRadius: "6px",
                    borderColor: "#e2e8f0",
                    bgcolor: "#fff",
                    color: "#475569",
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

      </Box>
    );
  };

  if (profile?.statusFriend === ProfileStatus.BLOCKED) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h4" color="error">
          Bạn đã bị chặn bởi người dùng này
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={profileTheme}>
      <Box component="div" sx={{ display: "flex", mt: "20px" }}>
        <Box
          sx={{
            position: "relative",
            height: "fit-content",
            width: "30%",
            padding: "20px",
            mr: "40px",
            borderRadius: "20px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            ml: "20px",
          }}
        >
          <Box sx={{ backgroundImage: "linear-gradient(90deg, rgb(225, 193, 169) 0%, rgba(225, 193, 169, 0.314) 100%)", height: "100px" }} />
          <Box
            sx={{
              borderRadius: "50%",
              width: 115,
              height: 115,
              position: "absolute",
              top: "50px",
              ml: "10px",
              backgroundColor: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Avatar alt="avatar" src={profile?.avatarUrl || undefined} sx={{ width: "90%", height: "90%" }}>
              {profile?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Box>
          <Typography fontSize="32px" fontWeight="bold" color="black" mt="50px">
            {profile?.fullName}
          </Typography>

          <Box sx={{ mt: 2, p: 2, borderRadius: "12px", backgroundColor: "#e9edf2", color: "#6b7280" }}>
            {profile?.bio || "Chưa có giới thiệu"}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", mt: 3, mb: 3 }}>
            <Box textAlign="center">
              <Typography color="#6b7280">Bạn bè</Typography>
              <Typography fontSize="20px" fontWeight="bold">{profile?.numberFriend ?? 0}</Typography>
            </Box>
            <Box sx={{ width: "1px", height: "30px", backgroundColor: "#d1d5db" }} />
            <Box textAlign="center">
              <Typography color="#6b7280">Bạn chung</Typography>
              <Typography fontSize="20px" fontWeight="bold">{profile?.mutualFriend ?? 0}</Typography>
            </Box>
          </Box>

          {isOwnProfile ? (
            <Button
              variant="outlined"
              fullWidth
              sx={{ borderRadius: "20px", py: 1.3, textTransform: "none", fontWeight: "bold" }}
              onClick={() => setModalEdit(true)}
            >
              Chỉnh sửa hồ sơ
            </Button>
          ) : (
            <Box display="flex" mt="20px">
              {profile?.friend && (

                <Button
                  variant="outlined"
                  color="error"
                  sx={{
                    borderRadius: "20px",
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: "bold",
                    width: "50%",
                    mr: 2,
                    borderColor: "error.main",
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.04)",
                      borderColor: "error.dark",
                    }
                  }}
                  onClick={() => setUnfriendConfirmOpen(true)}
                >
                  Hủy kết bạn
                </Button>
              )}
              {!profile?.friend && profile?.statusFriend !== ProfileStatus.PENDING && (
                <Button
                  sx={{
                    borderRadius: "20px",
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: "bold",
                    background: "linear-gradient(90deg, #4f8dfd, #3b82f6)",
                    color: "white",
                    width: "50%",
                    mr: 2,
                  }}
                  onClick={requestFriend}
                >
                  Kết bạn
                </Button>
              )}
              {!profile?.friend && profile?.statusFriend === ProfileStatus.PENDING && (
                <Button disabled sx={{ borderRadius: "20px", py: 1.5, textTransform: "none", fontWeight: "bold", width: "50%", mr: 2 }}>
                  Đã gửi lời mời
                </Button>
              )}
              <Button
                variant="outlined"
                sx={{ borderRadius: "20px", py: 1.5, textTransform: "none", fontWeight: "bold", width: "50%" }}
                onClick={sendMess}
              >
                Nhắn tin
              </Button>
            </Box>

          )}
        </Box>

        <Box width="70%" sx={{ px: "20px" }}>
          <Box sx={{ backgroundColor: "#e9f0ff", "& .MuiTab-root": { fontSize: "12px", fontWeight: 700 } }}>
            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} centered>
              <Tab label="Bản tin" />
              {/* <Tab label="Thành tích" />
              <Tab label="Thống kê" /> */}
              {!isOwnProfile && <Tab label="Hồ sơ học" />}
            </Tabs>
          </Box>
          {activeTab === 0 && renderFeed()}
          {/* {activeTab === 1 && renderAchievements()}
          {activeTab === 2 && renderStats()} */}
          {activeTab === 3 && !isOwnProfile && renderStudyProfile()}
        </Box>
      </Box>

      <Dialog open={createPostOpen} onClose={handleCloseCreatePost} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign: "center", fontSize: 24, fontWeight: 800, position: "relative", py: 2 }}>
          Tạo bài viết
          <IconButton
            onClick={handleCloseCreatePost}
            sx={{ position: "absolute", right: 14, top: 12, bgcolor: "#e5e7eb", "&:hover": { bgcolor: "#d1d5db" } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3, pt: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2 }}>
            <Avatar src={profile?.avatarUrl || undefined} sx={{ width: 52, height: 52 }}>
              {profile?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800 }}>{profile?.fullName || "Bạn"}</Typography>
              <Button
                size="small"
                onClick={(event) => setVisibilityAnchorEl(event.currentTarget)}
                startIcon={selectedVisibility.icon}
                sx={{
                  mt: 0.25,
                  px: 1,
                  py: 0.25,
                  bgcolor: "#e5e7eb",
                  borderRadius: "6px",
                  color: "#111827",
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#d1d5db" },
                }}
              >
                {selectedVisibility.label}
              </Button>
              <Menu
                anchorEl={visibilityAnchorEl}
                open={Boolean(visibilityAnchorEl)}
                onClose={() => setVisibilityAnchorEl(null)}
              >
                {visibilityOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    selected={option.value === postVisibility}
                    onClick={() => {
                      setPostVisibility(option.value);
                      setVisibilityAnchorEl(null);
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={5}
            placeholder={`${profile?.fullName || "Bạn"} ơi, bạn đang nghĩ gì thế?`}
            value={postContent}
            onChange={(event) => setPostContent(event.target.value)}
            variant="standard"
            InputProps={{ disableUnderline: true, sx: { fontSize: 26, color: "#4b5563", lineHeight: 1.25 } }}
          />

          {selectedMediaItems.length > 0 && (
            <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1 }}>
              {selectedMediaItems.map((item, index) => (
                <Box key={item.preview} sx={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", aspectRatio: "1 / 1", bgcolor: "#f3f4f6" }}>
                  {item.file.type.startsWith("video/") ? (
                    <Box component="video" src={item.preview} controls sx={{ width: "100%", height: "100%", objectFit: "cover", bgcolor: "#111" }} />
                  ) : (
                    <Box component="img" src={item.preview} alt={`preview ${index + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  )}
                  <IconButton
                    onClick={() => removeSelectedMedia(index)}
                    sx={{ position: "absolute", right: 6, top: 6, bgcolor: "rgba(255,255,255,0.9)", width: 28, height: 28 }}
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ mt: 2, p: 1.5, border: "1px solid #e5e7eb", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Thêm ảnh/video ({selectedMediaItems.length}/{MAX_POST_MEDIA})</Typography>
            <Button
              component="label"
              startIcon={<ImageIcon />}
              disabled={selectedMediaItems.length >= MAX_POST_MEDIA}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Thêm hình ảnh
              <input
                hidden
                multiple
                type="file"
                accept="image/*,video/*"
                onChange={(event) => {
                  handleSelectMedia(event.target.files);
                  event.target.value = "";
                }}
              />
            </Button>
          </Box>

          <Button
            fullWidth
            disabled={posting || (!postContent.trim() && selectedMediaItems.length === 0)}
            variant="contained"
            onClick={handleCreatePost}
            sx={{ mt: 2, py: 1.2, textTransform: "none", fontWeight: 800 }}
          >
            {posting ? "Đang đăng..." : "Đăng"}
          </Button>
        </DialogContent>
      </Dialog>

      <EditProfileModal
        stateModal={modalEdit}
        setModalEdit={setModalEdit}
        profile={profile}
        onProfileUpdated={(updatedProfile) => {
          setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : updatedProfile));
          setPosts((prev) =>
            prev.map((post) =>
              post.authorId === currentUserId
                ? {
                  ...post,
                  authorName: updatedProfile.fullName,
                  authorAvatarUrl: updatedProfile.avatarUrl,
                }
                : post,
            ),
          );
        }}
      />

      <Dialog
        open={unfriendConfirmOpen}
        onClose={() => setUnfriendConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "15px",
            padding: "10px",
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          Hủy kết bạn
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center", mb: 2 }}>
            Bạn có chắc chắn muốn hủy kết bạn với <strong>{profile?.fullName}</strong> không?
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} mt={2}>
            <Button
              variant="outlined"
              onClick={() => setUnfriendConfirmOpen(false)}
              sx={{ borderRadius: "20px", px: 4, textTransform: "none" }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleUnfriend}
              sx={{ borderRadius: "20px", px: 4, textTransform: "none" }}
            >
              Đồng ý
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

