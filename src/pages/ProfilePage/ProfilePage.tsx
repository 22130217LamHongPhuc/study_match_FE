import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import SearchIcon from "@mui/icons-material/Search";
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
  Skeleton,
  InputAdornment,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EditProfileModal from "../../components/modal/user/EditProfileModal";
import { ProfileStatus } from "../../enum/Profile";
import { UserProfile } from "../../model/UserModel";
import { getProfileByUserId } from "../../services/ProfileService";
import { ProfileApiResponse } from "../MyProfile/types";

import { loadProfileService, requestFriendService, unfriendService, loadFriendListService, FriendUser } from "../../services/FriendService";
import { matchingItemApi } from "../../services/matchingItemApi";
import {
  Achievement,
  loadAchievements,
  loadProfilePosts,
  loadProfileSocialStats,
  ProfileSocialStats,
  SocialPost,
} from "../../services/SocialPostService";
import Post, { PostSkeleton } from "../../components/post/Post";
import CreatePostDialog from "../../components/modal/user/CreatePostDialog";
import noPostImg from "../../assets/img/no-post.png";
import noFriendImg from "../../assets/img/no-friend.png";
import noImgImg from "../../assets/img/no-img.png";
import noVideoImg from "../../assets/img/no-video.png";
type RecommendationState = {
  fromRecommendation?: boolean;
  finalScore?: number;
  reasonText?: string;
};

const isImageUrl = (url: string) => {
  const lower = url.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") ||
    lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".svg") ||
    lower.endsWith(".bmp") || lower.endsWith(".tiff");
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
  const [unfriendConfirmOpen, setUnfriendConfirmOpen] = useState(false);
  const [studyProfile, setStudyProfile] = useState<ProfileApiResponse | null>(null);
  const [loadingStudyProfile, setLoadingStudyProfile] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // New States
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const trackedViewKeyRef = useRef<string | null>(null);

  const currentUserId = Number(localStorage.getItem("userId"));
  const profileUserId = Number(id);
  const isOwnProfile = currentUserId === profileUserId;

  // Extract photos and videos from posts
  const photos = useMemo(() => {
    const list: string[] = [];
    posts.forEach((post) => {
      post.media?.forEach((m) => {
        if (m.mediaType !== "VIDEO" && isImageUrl(m.mediaUrl)) {
          list.push(m.mediaUrl);
        }
      });
    });
    return list;
  }, [posts]);

  const videos = useMemo(() => {
    const list: string[] = [];
    posts.forEach((post) => {
      post.media?.forEach((m) => {
        if (
          m.mediaType === "VIDEO" ||
          m.mediaUrl.toLowerCase().endsWith(".mp4") ||
          m.mediaUrl.toLowerCase().endsWith(".mov") ||
          m.mediaUrl.toLowerCase().endsWith(".webm")
        ) {
          list.push(m.mediaUrl);
        }
      });
    });
    return list;
  }, [posts]);

  useEffect(() => {
    if (!profileUserId) return;
    setActiveTab(0);
    loadProfileService(profileUserId)
      .then((response: UserProfile) => setProfile(response))
      .catch((error) => console.error("Cannot load profile", error));
  }, [profileUserId]);

  useEffect(() => {
    if (!profileUserId) {
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
        setStudyProfile(null);
      })
      .finally(() => {
        setLoadingStudyProfile(false);
      });
  }, [profileUserId]);

  useEffect(() => {
    if (!profileUserId) return;
    setLoadingFriends(true);
    loadFriendListService(profileUserId)
      .then((data) => {
        setFriends(data);
      })
      .catch((error) => {
        console.error("Cannot load friends list", error);
      })
      .finally(() => {
        setLoadingFriends(false);
      });
  }, [profileUserId]);

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

  const handleCloseCreatePost = () => {
    setCreatePostOpen(false);
  };

  const renderFeed = () => (
    <>
      {isOwnProfile && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "#fff", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setCreatePostOpen(true)}
            sx={{ py: 1.25, borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
          >
            Thêm bài viết
          </Button>
        </Box>
      )}

      {isPosting && <PostSkeleton />}

      {posts.length === 0 ? (
        !isPosting && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 1.5 }}>
            <Box
              component="img"
              src={noPostImg}
              alt="No posts"
              sx={{
                width: "540px",
                height: "auto",
                opacity: 0.85,
              }}
            />
            <Typography sx={{ color: "#64748b", fontWeight: 600, fontSize: "15px" }}>
              Không có bài viết nào
            </Typography>
          </Box>
        )
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

  const renderFriends = () => {
    const filteredFriends = friends.filter((friend) =>
      friend.fullName.toLowerCase().includes(friendsSearchQuery.toLowerCase())
    );

    return (
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm bạn bè..."
          value={friendsSearchQuery}
          onChange={(e) => setFriendsSearchQuery(e.target.value)}
          sx={{
            mb: 3,
            bgcolor: "#fff",
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        />

        {loadingFriends ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : friends.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 1.5 }}>
            <Box
              component="img"
              src={noFriendImg}
              alt="No friends"
              sx={{
                width: "540px",
                height: "auto",
                opacity: 0.85,
              }}
            />
            <Typography sx={{ color: "#64748b", fontWeight: 600, fontSize: "15px" }}>
              Không có bạn bè
            </Typography>
          </Box>
        ) : filteredFriends.length === 0 ? (
          <Typography sx={{ color: "#6b7280", textAlign: "center", py: 4 }}>
            Không tìm thấy bạn bè nào
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredFriends.map((friend) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={friend.userId}>
                <Card
                  onClick={() => navigate(`/profile/${friend.userId}`)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    border: "1px solid #f1f5f9",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Avatar
                    src={friend.avatarUrl || undefined}
                    sx={{ width: 56, height: 56, mr: 2, border: "2px solid #e2e8f0" }}
                  >
                    {friend.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {friend.fullName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: friend.online ? "#10b981" : "#64748b", display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: friend.online ? "#10b981" : "#cbd5e1",
                        }}
                      />
                      {friend.online ? "Đang hoạt động" : "Ngoại tuyến"}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderPhotos = () => {
    if (photos.length === 0) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 1.5 }}>
          <Box
            component="img"
            src={noImgImg}
            alt="No photos"
            sx={{
              width: "540px",
              height: "auto",
              opacity: 0.85,
            }}
          />
          <Typography sx={{ color: "#64748b", fontWeight: 600, fontSize: "15px" }}>
            Không có hình ảnh
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {photos.map((photoUrl, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
              <Box
                onClick={() => setSelectedPhoto(photoUrl)}
                sx={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "100%", // 1:1 Aspect Ratio
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  bgcolor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    "& .photo-overlay": {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Box
                  component="img"
                  src={photoUrl}
                  alt={`Gallery photo ${index + 1}`}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  className="photo-overlay"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(0,0,0,0.2)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Lightbox Dialog */}
        <Dialog
          open={Boolean(selectedPhoto)}
          onClose={() => setSelectedPhoto(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "hidden",
            },
          }}
        >
          <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <IconButton
              onClick={() => setSelectedPhoto(null)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={selectedPhoto || ""}
              alt="Full size photo"
              sx={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </Box>
        </Dialog>
      </Box>
    );
  };

  const renderVideos = () => {
    if (videos.length === 0) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 1.5 }}>
          <Box
            component="img"
            src={noVideoImg}
            alt="No videos"
            sx={{
              width: "540px",
              height: "auto",
              opacity: 0.85,
            }}
          />
          <Typography sx={{ color: "#64748b", fontWeight: 600, fontSize: "15px" }}>
            Không có video
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {videos.map((videoUrl, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Box
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  bgcolor: "#000",
                  aspectRatio: "16/9",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <video
                  src={videoUrl}
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderAchievements = () => (
    <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
      {achievements.length === 0 ? (
        <Typography sx={{ color: "#6b7280" }}>Chưa có thành tích</Typography>
      ) : (
        achievements.map((achievement) => (
          <Box key={achievement.code} sx={{ p: 2, bgcolor: "#fff", borderRadius: "8px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
            <Typography sx={{ fontWeight: 700, color: achievement.achieved ? "#1d4ed8" : "#374151" }}>
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
          <Typography sx={{ fontSize: 28, fontWeight: 700 }}>{value}</Typography>
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

  if (!profile) {
    return (
      <ThemeProvider theme={profileTheme}>
        <Box component="div" sx={{ display: "flex", mt: "20px" }}>
          {/* Left Column Skeleton */}
          <Box sx={{ width: "30%", ml: "20px", mr: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Box
              sx={{
                position: "relative",
                height: "fit-content",
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0",
                bgcolor: "white",
              }}
            >
              {/* Banner skeleton */}
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: "12px 12px 0 0", margin: "-16px -16px 0 -16px" }} />

              {/* Avatar skeleton */}
              <Box
                sx={{
                  borderRadius: "50%",
                  width: 100,
                  height: 100,
                  position: "absolute",
                  top: "30px",
                  ml: "8px",
                  backgroundColor: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Skeleton variant="circular" width="90%" height="90%" />
              </Box>

              {/* Name skeleton */}
              <Box mt="60px">
                <Skeleton variant="text" width="80%" height={32} />
              </Box>

              {/* Bio skeleton */}
              <Box sx={{ mt: 1.5, p: 1.5 }}>
                <Skeleton variant="rectangular" height={45} sx={{ borderRadius: "8px" }} />
              </Box>

              {/* Stats skeleton */}
              <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2, mb: 2 }}>
                <Box sx={{ textAlign: "center", width: "40%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="30%" height={24} />
                </Box>
                <Box sx={{ width: "1px", height: "24px", backgroundColor: "#d1d5db" }} />
                <Box sx={{ textAlign: "center", width: "40%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="30%" height={24} />
                </Box>
              </Box>

              {/* Button skeleton */}
              <Skeleton variant="rectangular" height={36} sx={{ borderRadius: "8px", width: "100%" }} />
            </Box>

            {/* Friends Preview Skeleton Card */}
            <Box
              sx={{
                width: "100%",
                bgcolor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                p: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
              <Skeleton variant="text" width="25%" height={16} sx={{ mb: 2 }} />

              <Grid container spacing={1.5}>
                {Array.from({ length: 9 }).map((_, index) => (
                  <Grid size={{ xs: 4 }} key={index} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Skeleton variant="rectangular" sx={{ width: "100%", aspectRatio: "1/1", borderRadius: "8px", mb: 0.5 }} />
                    <Skeleton variant="text" width="80%" height={14} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>

          {/* Right Column Skeleton */}
          <Box width="70%" sx={{ px: "20px" }}>
            {/* Tabs skeleton */}
            <Box sx={{ 
              display: "inline-flex",
              bgcolor: "#f1f5f9", 
              p: "4px", 
              borderRadius: "30px", 
              border: "1px solid #e2e8f0",
              gap: "4px", 
              mb: 3
            }}>
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: "20px" }} />
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: "20px" }} />
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: "20px" }} />
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: "20px" }} />
              <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: "20px" }} />
            </Box>

            {/* Content skeleton card */}
            <Box sx={{
              bgcolor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              p: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              minHeight: "450px"
            }}>
              {/* Feed skeleton */}
              <Box sx={{ mt: 1 }}>
                <Box sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: "12px", mb: 3 }}>
                  <Box display="flex" gap={2} alignItems="center" mb={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="30%" />
                      <Skeleton variant="text" width="20%" />
                    </Box>
                  </Box>
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "8px", mb: 2 }} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="80%" />
                </Box>

                <Box sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                  <Box display="flex" gap={2} alignItems="center" mb={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="15%" />
                    </Box>
                  </Box>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: "8px", mb: 2 }} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

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
        <Box sx={{ width: "30%", ml: "20px", mr: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Box
            sx={{
              position: "relative",
              height: "fit-content",
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              bgcolor: "white",
            }}
          >
            <Box
              sx={{
                backgroundImage: profile?.bannerUrl
                  ? `url(${profile.bannerUrl})`
                  : "linear-gradient(90deg, rgb(225, 193, 169) 0%, rgba(225, 193, 169, 0.314) 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "80px",
                borderRadius: "14px 14px 0 0",
                margin: "-16px -16px 0 -16px",
              }}
            />
            <Box
              sx={{
                borderRadius: "50%",
                width: 100,
                height: 100,
                position: "absolute",
                top: "30px",
                ml: "8px",
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
            <Typography fontSize="24px" fontWeight="800" color="black" mt="60px">
              {profile?.fullName}
            </Typography>

            {profile?.bio && (
              <Box sx={{ mt: 1.5, p: "10px 14px", borderRadius: "8px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13.5px" }}>
                {profile.bio}
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", mt: 2, mb: 2 }}>
              <Box textAlign="center">
                <Typography color="#64748b" fontSize="12px">Bạn bè</Typography>
                <Typography fontSize="16px" fontWeight="700" color="#0f172a">{profile?.numberFriend ?? 0}</Typography>
              </Box>
              <Box sx={{ width: "1px", height: "24px", backgroundColor: "#d1d5db" }} />
              <Box textAlign="center">
                <Typography color="#64748b" fontSize="12px">Bạn chung</Typography>
                <Typography fontSize="16px" fontWeight="700" color="#0f172a">{profile?.mutualFriend ?? 0}</Typography>
              </Box>
            </Box>

            {isOwnProfile ? (
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderRadius: "8px", py: 1, textTransform: "none", fontWeight: "bold", fontSize: "14px" }}
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
                      borderRadius: "8px",
                      py: 1,
                      textTransform: "none",
                      fontWeight: "bold",
                      width: "50%",
                      mr: 2,
                      fontSize: "14px",
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
                      borderRadius: "8px",
                      py: 1,
                      textTransform: "none",
                      fontWeight: "bold",
                      background: "linear-gradient(90deg, #4f8dfd, #3b82f6)",
                      color: "white",
                      width: "50%",
                      mr: 2,
                      fontSize: "14px",
                    }}
                    onClick={requestFriend}
                  >
                    Kết bạn
                  </Button>
                )}
                {!profile?.friend && profile?.statusFriend === ProfileStatus.PENDING && (
                  <Button disabled sx={{ borderRadius: "8px", py: 1, textTransform: "none", fontWeight: "bold", width: "50%", mr: 2, fontSize: "14px" }}>
                    Đã gửi lời mời
                  </Button>
                )}
                <Button
                  variant="outlined"
                  sx={{ borderRadius: "8px", py: 1, textTransform: "none", fontWeight: "bold", width: "50%", fontSize: "14px" }}
                  onClick={sendMess}
                >
                  Nhắn tin
                </Button>
              </Box>
            )}
          </Box>

          {/* Friends Preview Card */}
          {profile && (
            <Box
              sx={{
                width: "100%",
                bgcolor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                p: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>
                  Bạn bè
                </Typography>
                <Typography
                  onClick={() => setActiveTab(1)}
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#2563eb",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Xem tất cả bạn bè
                </Typography>
              </Box>
              <Typography sx={{ color: "#64748b", fontSize: "13px", mb: 2 }}>
                {profile.numberFriend ?? 0} người bạn
              </Typography>

              {friends.length === 0 ? (
                <Typography sx={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", py: 2 }}>
                  Chưa có bạn bè nào
                </Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {friends.slice(0, 9).map((friend) => {
                    const mockMutualCount = ((friend.userId * 7) % 12) + 1;
                    const showMockMutual = (friend.userId % 3) !== 0 && !isOwnProfile;

                    return (
                      <Grid size={{ xs: 4 }} key={friend.userId} sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }} onClick={() => navigate(`/profile/${friend.userId}`)}>
                        <Box
                          sx={{
                            width: "100%",
                            aspectRatio: "1/1",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #f1f5f9",
                            bgcolor: "#f8fafc",
                            mb: 0.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {friend.avatarUrl ? (
                            <Box
                              component="img"
                              src={friend.avatarUrl}
                              alt={friend.fullName}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "8px",
                                bgcolor: "#3b82f6",
                                fontSize: "28px",
                                fontWeight: "bold"
                              }}
                            >
                              {friend.fullName.charAt(0).toUpperCase()}
                            </Avatar>
                          )}
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "13px",
                            color: "#1e293b",
                            width: "100%",
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {friend.fullName}
                        </Typography>
                        {showMockMutual && (
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "#64748b",
                              width: "100%",
                              textAlign: "center",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {mockMutualCount} bạn chung
                          </Typography>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}
        </Box>

        <Box width="70%" sx={{ px: "20px" }}>
          <Box sx={{ 
            display: "inline-flex",
            backgroundColor: "#f1f5f9", 
            borderRadius: "30px", 
            p: "4px", 
            mb: 3, 
            border: "1px solid #e2e8f0",
            maxWidth: "100%",
            overflowX: "auto"
          }}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: "auto",
                "& .MuiTabs-indicator": {
                  display: "none",
                },
                "& .MuiTabs-flexContainer": {
                  gap: "4px",
                },
                "& .MuiTab-root": {
                  fontSize: "13.5px",
                  fontWeight: 600,
                  textTransform: "none",
                  color: "#64748b",
                  minWidth: "auto",
                  minHeight: "auto",
                  px: 2.5,
                  py: 1,
                  borderRadius: "20px",
                  transition: "all 0.2s ease",
                  "&.Mui-selected": {
                    color: "#2563eb",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                  },
                  "&:hover:not(.Mui-selected)": {
                    color: "#1e293b",
                    backgroundColor: "rgba(255,255,255,0.4)",
                  },
                },
              }}
            >
              <Tab label="Bài viết" />
              <Tab label="Bạn bè" />
              <Tab label="Ảnh" />
              <Tab label="Video" />
              <Tab label="Hồ sơ học tập" />
            </Tabs>
          </Box>
          <Box sx={{
            bgcolor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            p: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            minHeight: "450px"
          }}>
            {activeTab === 0 && renderFeed()}
            {activeTab === 1 && renderFriends()}
            {activeTab === 2 && renderPhotos()}
            {activeTab === 3 && renderVideos()}
            {activeTab === 4 && renderStudyProfile()}
          </Box>
        </Box>
      </Box>

      <CreatePostDialog
        open={createPostOpen}
        onClose={handleCloseCreatePost}
        currentUserId={currentUserId}
        authorName={profile?.fullName}
        authorAvatarUrl={profile?.avatarUrl}
        onPostCreated={(post) => {
          setPosts((prev) => [post, ...prev]);
          setStats((prev) => (prev ? { ...prev, postCount: prev.postCount + 1 } : prev));
        }}
        onPostingChange={setIsPosting}
      />

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

