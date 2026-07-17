import { Lock, MoreHoriz, People, Public, Description, Send, Reply } from "@mui/icons-material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addPostComment,
  deletePost,
  loadPostComments,
  PostComment,
  SocialPost,
  togglePostLike,
} from "../../services/SocialPostService";
import { parsePostContent, POST_BACKGROUNDS } from "../modal/user/CreatePostDialog";
import ReportModal from "../modal/ReportModal";
import EditPostDialog from "../modal/user/EditPostDialog";
import PostMediaModal from "../modal/user/PostMediaModal";
import PostReactionsModal from "../modal/user/PostReactionsModal";
import SharePostModal from "../modal/user/SharePostModal";

const isImageUrl = (url: string) => {
  const lower = url.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") ||
    lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".svg") ||
    lower.endsWith(".bmp") || lower.endsWith(".tiff");
};

const getFileMeta = (fileName: string) => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return { label: "PDF", color: "#ef4444", bg: "#fee2e2" };
  }
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
    return { label: "Word", color: "#3b82f6", bg: "#dbeafe" };
  }
  if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) {
    return { label: "Excel", color: "#10b981", bg: "#d1fae5" };
  }
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) {
    return { label: "PowerPoint", color: "#2563eb", bg: "#dbeafe" };
  }
  if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".7z") || lower.endsWith(".tar") || lower.endsWith(".gz")) {
    return { label: "Archive", color: "#8b5cf6", bg: "#ede9fe" };
  }
  if (lower.endsWith(".txt")) {
    return { label: "Text", color: "#6b7280", bg: "#f3f4f6" };
  }
  return { label: "File", color: "#6b7280", bg: "#f3f4f6" };
};

const getFileNameFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const filenameParam = urlObj.searchParams.get("filename");
    if (filenameParam) {
      return decodeURIComponent(filenameParam);
    }
  } catch (e) {

  }

  const lastSlash = url.lastIndexOf("/");
  if (lastSlash >= 0) {
    let rawName = url.substring(lastSlash + 1);

    const qMark = rawName.indexOf("?");
    if (qMark >= 0) {
      rawName = rawName.substring(0, qMark);
    }
    const hash = rawName.indexOf("#");
    if (hash >= 0) {
      rawName = rawName.substring(0, hash);
    }

    const doubleExtMatch = rawName.match(/^(.+)\.(\w+)\.\2$/i);
    if (doubleExtMatch) {
      rawName = doubleExtMatch[1] + "." + doubleExtMatch[2];
    }

    rawName = rawName.replace(/_\d{13}(\.\w+)?$/i, "$1");

    return rawName;
  }
  return "Tài liệu học tập";
};

const downloadFile = async (url: string, fileName?: string | null) => {
  const safeFileName = fileName || `file-${Date.now()}`;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

type PostProps = {
  post: SocialPost;
  currentUserId: number;
  authorName?: string;
  authorAvatarUrl?: string | null;
  onPostChanged: (post: SocialPost) => void;
  onPostDeleted: (postId: number) => void;
  onImageClick?: (index: number) => void;
  onPostCreated?: (post: SocialPost) => void;
  onViewSharedPost?: (sharedPost: SocialPost, mediaIndex: number) => void;
};

type PostVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

const visibilityOptions: { value: PostVisibility; label: string; icon: React.ReactNode }[] = [
  { value: "PUBLIC", label: "Công khai", icon: <Public sx={{ fontSize: 14, color: "#65676b" }} /> },
  { value: "FRIENDS", label: "Bạn bè", icon: <People sx={{ fontSize: 14, color: "#65676b" }} /> },
  { value: "PRIVATE", label: "Riêng tư", icon: <Lock sx={{ fontSize: 14, color: "#65676b" }} /> },
];

const getVisibilityOption = (value?: string) =>
  visibilityOptions.find((option) => option.value === value) || visibilityOptions[0];

const formatTime = (value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  return date.toLocaleDateString("vi-VN");
};

const getReactionEmoji = (type: string) => {
  switch (type.toUpperCase()) {
    case "LOVE": return "❤️";
    case "HAHA": return "😆";
    case "WOW": return "😮";
    case "SAD": return "😢";
    case "ANGRY": return "😡";
    case "LIKE":
    default:
      return "👍";
  }
};

function SharedPostCard({
  sp,
  spContent,
  spHasBg,
  spBg,
  spMedia,
  spLong,
  onViewSharedPost,
}: {
  sp: SocialPost;
  spContent: string;
  spHasBg: boolean;
  spBg: ReturnType<typeof POST_BACKGROUNDS.find>;
  spMedia: SocialPost["media"];
  spLong: boolean;
  onViewSharedPost?: (sharedPost: SocialPost, mediaIndex: number) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const navigate = useNavigate();

  const goToProfile = () => navigate(`/profile/${sp.authorId}`);

  const handleMediaClick = (idx: number) => {
    if (onViewSharedPost) {
      onViewSharedPost(sp, idx);
    }
  };

  return (
    <>
      <Box
        sx={{
          mx: 2,
          mb: 1.5,
          border: "1px solid #dde3ec",
          borderRadius: "14px",
          overflow: "hidden",
          bgcolor: "#f8fafc",
        }}
      >
        {/* Author row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2, pt: 1.5, pb: 0.75 }}>
          <Avatar
            src={sp.authorAvatarUrl || undefined}
            onClick={goToProfile}
            sx={{
              width: 36,
              height: 36,
              cursor: "pointer",
              transition: "transform 0.18s, box-shadow 0.18s",
              "&:hover": {
                transform: "scale(1.08)",
                boxShadow: "0 0 0 3px #bfdbfe",
              },
            }}
          >
            {sp.authorName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography
              onClick={goToProfile}
              sx={{
                fontWeight: 700,
                fontSize: 13.5,
                color: "#1e293b",
                lineHeight: 1.2,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline", color: "#1877f2" },
              }}
            >
              {sp.authorName}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
              {sp.visibility === "PUBLIC" ? "Công khai" : sp.visibility === "FRIENDS" ? "Bạn bè" : "Riêng tư"}
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        {spHasBg ? (
          <Box
            sx={{
              mx: 2,
              mb: spMedia.length > 0 ? 1 : 1.5,
              borderRadius: "10px",
              minHeight: "90px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: spBg?.style.background,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: spBg?.style.color || "white",
                textAlign: "center",
                p: 1.5,
                lineHeight: 1.45,
              }}
            >
              {spContent}
            </Typography>
          </Box>
        ) : spContent ? (
          <Box sx={{ px: 2, pb: spMedia.length > 0 ? 1 : 1.5 }}>
            <Typography
              component="div"
              sx={{
                fontSize: 14,
                color: "#374151",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                ...(spLong && !expanded
                  ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
                  : {}),
              }}
            >
              {spContent}
            </Typography>
            {spLong && (
              <Box
                component="span"
                onClick={() => setExpanded((v) => !v)}
                sx={{
                  display: "inline-block",
                  mt: 0.5,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1877f2",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {expanded ? "Thu gọn" : "Xem thêm"}
              </Box>
            )}
          </Box>
        ) : null}

        {/* Media thumbnail — clickable */}
        {spMedia.length > 0 && (
          <Box
            onClick={() => handleMediaClick(0)}
            sx={{
              position: "relative",
              mx: 2,
              mb: 1.5,
              borderRadius: "10px",
              overflow: "hidden",
              height: 200,
              bgcolor: "#111",
              cursor: onViewSharedPost ? "pointer" : "default",
              "&:hover .media-overlay": { opacity: onViewSharedPost ? 1 : 0 },
            }}
          >
            <MediaRenderer
              item={spMedia[0]}
              alt="shared post media"
              isVideo={spMedia[0].mediaType === "VIDEO"}
              isDoc={spMedia[0].mediaType !== "VIDEO" && !isImageUrl(spMedia[0].mediaUrl)}
            />
            {/* Hover overlay */}
            <Box
              className="media-overlay"
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.18)",
                opacity: 0,
                transition: "opacity 0.2s",
                zIndex: 2,
              }}
            />
            {spMedia.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  bgcolor: "rgba(0,0,0,0.62)",
                  borderRadius: "8px",
                  px: 1.25,
                  py: 0.4,
                  zIndex: 2,
                }}
              >
                <Typography sx={{ color: "white", fontSize: 12.5, fontWeight: 700 }}>
                  +{spMedia.length - 1} ảnh/video
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}

function MediaRenderer({
  item,
  alt,
  isVideo,
  isDoc,
}: {
  item: any;
  alt?: string;
  isVideo: boolean;
  isDoc: boolean;
}) {
  const [loading, setLoading] = useState(true);

  if (isDoc) {
    return (
      <Box
        onClick={() => downloadFile(item.mediaUrl, getFileNameFromUrl(item.mediaUrl))}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          bgcolor: getFileMeta(item.mediaUrl).bg,
          p: 2,
          textAlign: "center",
          gap: 1,
          "&:hover": { bgcolor: "#e5e7eb" },
        }}
      >
        <Description sx={{ fontSize: 44, color: getFileMeta(item.mediaUrl).color }} />
        <Typography
          noWrap
          sx={{
            width: "100%",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#1f2937",
            px: 1,
          }}
        >
          {getFileNameFromUrl(item.mediaUrl)}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
          Tải xuống ({getFileMeta(item.mediaUrl).label})
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative", bgcolor: isVideo ? "#000" : "#f1f5f9" }}>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}

      {isVideo ? (
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          <Box
            component="video"
            src={item.mediaUrl}
            onLoadedData={() => setLoading(false)}
            onCanPlay={() => setLoading(false)}
            onError={() => setLoading(false)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: loading ? "none" : "block",
            }}
          />
          {!loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.15)",
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                <span style={{ fontSize: "24px", color: "#1e293b", marginLeft: "4px" }}>▶</span>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          component="img"
          src={item.mediaUrl}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: loading ? "none" : "block",
          }}
        />
      )}
    </Box>
  );
}

export default function Post({ post, currentUserId, authorName, authorAvatarUrl, onPostChanged, onPostDeleted, onImageClick, onPostCreated, onViewSharedPost }: PostProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showReactionsPopup, setShowReactionsPopup] = useState(false);
  const [reactionsModalOpen, setReactionsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const isOwner = currentUserId === post.authorId;
  const mediaItems = post.media || [];
  const visibility = getVisibilityOption(post.visibility);

  const { backgroundId, content: parsedContent } = useMemo(() => parsePostContent(post.content), [post.content]);
  const hasBackground = backgroundId !== "none" && mediaItems.length === 0;
  const currentBg = POST_BACKGROUNDS.find(bg => bg.id === backgroundId);

  const shouldTruncate = useMemo(() => {
    if (!parsedContent) return false;
    const lines = parsedContent.split("\n").length;
    return parsedContent.length > 250 || lines > 4;
  }, [parsedContent]);

  const getTruncatedContent = (text: string) => {
    const lines = text.split("\n");
    if (lines.length > 4) {
      return lines.slice(0, 4).join("\n") + "...";
    }
    if (text.length > 250) {
      return text.substring(0, 220) + "...";
    }
    return text;
  };

  useEffect(() => {
    setIsExpanded(false);
  }, [post.content, post.visibility]);

  const sortedComments = useMemo(() => comments, [comments]);

  const handleToggleLike = async (reactionType?: string) => {
    const next = await togglePostLike(post.id, currentUserId, reactionType);
    onPostChanged(next);
  };

  const getReactionUI = (reactionType?: string | null) => {
    if (!reactionType) return { icon: <ThumbUpIcon sx={{ fontSize: 22, color: "#65676b" }} />, color: "#65676b" };
    switch (reactionType.toUpperCase()) {
      case "LOVE":
        return { icon: <span style={{ fontSize: 22 }}>❤️</span>, color: "#f43f5e" };
      case "HAHA":
        return { icon: <span style={{ fontSize: 22 }}>😆</span>, color: "#eab308" };
      case "WOW":
        return { icon: <span style={{ fontSize: 22 }}>😮</span>, color: "#eab308" };
      case "SAD":
        return { icon: <span style={{ fontSize: 22 }}>😢</span>, color: "#3b82f6" };
      case "ANGRY":
        return { icon: <span style={{ fontSize: 22 }}>😡</span>, color: "#2563eb" };
      case "LIKE":
      default:
        return { icon: <ThumbUpIcon sx={{ fontSize: 22, color: "#1877f2" }} />, color: "#1877f2" };
    }
  };

  const renderTopReactions = (topReactions?: string[] | null) => {
    if (!topReactions || topReactions.length === 0) return null;
    return (
      <Box
        onClick={() => setReactionsModalOpen(true)}
        sx={{ display: "flex", alignItems: "center", cursor: "pointer", "&:hover": { opacity: 0.8 } }}
      >
        {topReactions.map((type, idx) => (
          <Box
            key={type}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              bgcolor: "#f1f5f9",
              border: "1.5px solid white",
              marginLeft: idx > 0 ? "-6px" : "0",
              zIndex: 2 - idx,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {getReactionEmoji(type)}
          </Box>
        ))}
      </Box>
    );
  };

  const renderMediaGrid = () => {
    const count = mediaItems.length;
    if (count === 0) return null;

    const renderMediaItem = (item: typeof mediaItems[0], index: number, height: string | number) => {
      const isVideo = item.mediaType === "VIDEO";
      const isImage = isImageUrl(item.mediaUrl);
      const isDoc = !isVideo && !isImage;

      return (
        <Box
          key={item.id ?? `${item.mediaUrl}-${index}`}
          onClick={() => {
            if (!isDoc) {
              if (onImageClick) {
                onImageClick(index);
              } else {
                setActiveMediaIndex(index);
                setMediaModalOpen(true);
              }
            }
          }}
          sx={{
            width: "100%",
            height: height,
            bgcolor: "#111",
            overflow: "hidden",
            cursor: isDoc ? "default" : "pointer",
            position: "relative",
            "& video": {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            },
            "& img": {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            },
          }}
        >
          <MediaRenderer
            item={item}
            alt={`post media ${index + 1}`}
            isVideo={isVideo}
            isDoc={isDoc}
          />

          {/* Plus overlay for more than 5 items */}
          {count > 5 && index === 4 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <Typography sx={{ color: "white", fontSize: "28px", fontWeight: 700 }}>
                +{count - 5}
              </Typography>
            </Box>
          )}
        </Box>
      );
    };

    if (count === 1) {
      return (
        <Box sx={{ width: "100%", overflow: "hidden", borderRadius: "12px" }}>
          {renderMediaItem(mediaItems[0], 0, "400px")}
        </Box>
      );
    }

    if (count === 2) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", overflow: "hidden", borderRadius: "12px" }}>
          {renderMediaItem(mediaItems[0], 0, "240px")}
          {renderMediaItem(mediaItems[1], 1, "240px")}
        </Box>
      );
    }

    if (count === 3) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", overflow: "hidden", borderRadius: "12px" }}>
          {renderMediaItem(mediaItems[0], 0, "260px")}
          <Box sx={{ display: "flex", gap: "4px" }}>
            <Box sx={{ flex: 1 }}>{renderMediaItem(mediaItems[1], 1, "180px")}</Box>
            <Box sx={{ flex: 1 }}>{renderMediaItem(mediaItems[2], 2, "180px")}</Box>
          </Box>
        </Box>
      );
    }

    if (count === 4) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", overflow: "hidden", borderRadius: "12px" }}>
          {renderMediaItem(mediaItems[0], 0, "260px")}
          <Box sx={{ display: "flex", gap: "4px" }}>
            <Box sx={{ flex: 1 }}>{renderMediaItem(mediaItems[1], 1, "150px")}</Box>
            <Box sx={{ flex: 1 }}>{renderMediaItem(mediaItems[2], 2, "150px")}</Box>
            <Box sx={{ flex: 1 }}>{renderMediaItem(mediaItems[3], 3, "150px")}</Box>
          </Box>
        </Box>
      );
    }

    // 5 or more items
    return (
      <Box sx={{ display: "flex", gap: "4px", width: "100%", overflow: "hidden", borderRadius: "12px" }}>
        {/* Left Column (2 items) */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {renderMediaItem(mediaItems[0], 0, "200px")}
          {renderMediaItem(mediaItems[1], 1, "200px")}
        </Box>
        {/* Right Column (3 items) */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {renderMediaItem(mediaItems[2], 2, "132px")}
          {renderMediaItem(mediaItems[3], 3, "132px")}
          {renderMediaItem(mediaItems[4], 4, "132px")}
        </Box>
      </Box>
    );
  };

  const handleToggleComments = async () => {
    const nextOpen = !commentsOpen;
    setCommentsOpen(nextOpen);
    if (nextOpen && comments.length === 0) {
      setComments(await loadPostComments(post.id));
    }
  };

  const handleAddComment = async () => {
    const content = commentText.trim();
    if (!content) return;
    const comment = await addPostComment(post.id, currentUserId, content);
    setComments((prev) => [...prev, comment]);
    setCommentText("");
    onPostChanged({ ...post, commentCount: post.commentCount + 1 });
  };



  const handleDelete = async () => {
    await deletePost(post.id, currentUserId);
    onPostDeleted(post.id);
    setAnchorEl(null);
  };

  const rxUI = getReactionUI(post.likedByViewer ? post.reactionType : null);

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        my: "20px",
        bgcolor: "white",
        borderRadius: "8px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: "12px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar src={post.authorAvatarUrl || undefined} sx={{ width: 44, height: 44, mr: 1.5, border: "1px solid #f0f2f5" }}>
            {post.authorName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#050505", leadingHeight: 1.2 }}>
              {post.authorName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
              <Typography sx={{ fontSize: "0.8125rem", color: "#65676b" }}>
                {formatTime(post.createdAt)} ·
              </Typography>
              {visibility.icon}
              <Typography sx={{ fontSize: "0.8125rem", color: "#65676b" }}>{visibility.label}</Typography>
            </Box>
          </Box>
        </Box>
        {(isOwner || post.authorId !== currentUserId) && (
          <>
            <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
              <MoreHoriz />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {!isOwner && (
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    setReportModalOpen(true);
                  }}
                >
                  Báo cáo bài viết
                </MenuItem>
              )}
              {isOwner && (
                <Box sx={{ display: "contents" }}>
                  <MenuItem onClick={() => { setEditing(true); setAnchorEl(null); }}>Sửa bài</MenuItem>
                  <MenuItem onClick={handleDelete}>Xóa bài</MenuItem>
                </Box>
              )}
            </Menu>
          </>
        )}
      </Box>

      <Box sx={{ px: 2, pb: 1 }}>
        {hasBackground ? (
          <Box
            sx={{
              width: "100%",
              minHeight: "240px",
              borderRadius: "12px",
              p: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: currentBg?.style.background,
              boxShadow: "inset 0 0 80px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                color: currentBg?.style.color || "white",
                lineHeight: 1.4,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {shouldTruncate && !isExpanded ? getTruncatedContent(parsedContent) : parsedContent}
              {shouldTruncate && !isExpanded && (
                <Box
                  component="span"
                  onClick={() => setIsExpanded(true)}
                  sx={{
                    color: currentBg?.style.color || "white",
                    cursor: "pointer",
                    ml: 1.5,
                    display: "inline-block",
                    textDecoration: "underline",
                    fontSize: "16px",
                    fontWeight: "normal",
                    opacity: 0.85,
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Xem thêm
                </Box>
              )}
            </Typography>
          </Box>
        ) : (
          parsedContent && (
            <Typography sx={{ whiteSpace: "pre-wrap", color: "#1e293b", fontSize: "15px", lineHeight: 1.5 }}>
              {shouldTruncate && !isExpanded ? getTruncatedContent(parsedContent) : parsedContent}
              {shouldTruncate && !isExpanded && (
                <Box
                  component="span"
                  onClick={() => setIsExpanded(true)}
                  sx={{
                    color: "#1877f2",
                    cursor: "pointer",
                    ml: 1,
                    display: "inline-block",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Xem thêm
                </Box>
              )}
            </Typography>
          )
        )}
      </Box>

      <Box sx={{ px: 2, pb: 0.5 }}>
        {renderMediaGrid()}
      </Box>

      {post.sharedPost && (() => {
        const sp = post.sharedPost!;
        const { backgroundId: spBgId, content: spContent } = parsePostContent(sp.content ?? "");
        const spBg = POST_BACKGROUNDS.find(b => b.id === spBgId);
        const spHasBg = spBgId !== "none" && (sp.media ?? []).length === 0;
        const spMedia = sp.media ?? [];
        const CLAMP = 3;
        const spLines = (spContent ?? "").split("\n").length;
        const spLong = (spContent?.length ?? 0) > 180 || spLines > CLAMP;
        return (
          <SharedPostCard
            sp={sp}
            spContent={spContent}
            spHasBg={spHasBg}
            spBg={spBg}
            spMedia={spMedia}
            spLong={spLong}
            onViewSharedPost={onViewSharedPost}
          />
        );
      })()}

      <Box sx={{ p: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2.5 }}>
          <Box
            onMouseEnter={() => setShowReactionsPopup(true)}
            onMouseLeave={() => setShowReactionsPopup(false)}
            sx={{ position: "relative", display: "flex", alignItems: "center" }}
          >
            <Box
              onClick={() => void handleToggleLike()}
              sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer" }}
            >
              {rxUI.icon}
              <Typography sx={{ fontSize: "0.9rem", color: rxUI.color, fontWeight: 500 }}>
                {post.likeCount}
              </Typography>
            </Box>

            {showReactionsPopup && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: "85%",
                  left: 0,
                  bgcolor: "white",
                  borderRadius: "30px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  border: "1px solid #e2e8f0",
                  p: "6px 12px",
                  display: "flex",
                  gap: "12px",
                  zIndex: 20,
                  mb: 0,
                  animation: "fadeInUp 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
                  "@keyframes fadeInUp": {
                    from: { opacity: 0, transform: "translateY(10px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                {[
                  { emoji: "👍", name: "LIKE" },
                  { emoji: "❤️", name: "LOVE" },
                  { emoji: "😆", name: "HAHA" },
                  { emoji: "😮", name: "WOW" },
                  { emoji: "😢", name: "SAD" },
                  { emoji: "😡", name: "ANGRY" }
                ].map(({ emoji, name }) => (
                  <Box
                    key={name}
                    onClick={() => {
                      void handleToggleLike(name);
                      setShowReactionsPopup(false);
                    }}
                    sx={{
                      fontSize: "24px",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                      "&:hover": {
                        transform: "scale(1.35) translateY(-4px)",
                      },
                    }}
                  >
                    {emoji}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box onClick={handleToggleComments} sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer" }}>
            <ChatBubbleIcon sx={{ fontSize: 22, color: "#65676b" }} />
            <Typography sx={{ fontSize: "0.9rem", color: "#65676b", fontWeight: 500 }}>{post.commentCount}</Typography>
          </Box>

          {!isOwner && (
            <Box onClick={() => setShareModalOpen(true)} sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer", "&:hover": { color: "#1877f2" } }}>
              <Reply sx={{ fontSize: 24, color: "#65676b", transform: "scaleX(-1)" }} />
              <Typography sx={{ fontSize: "0.9rem", color: "#65676b", fontWeight: 500 }}>Chia sẻ</Typography>
            </Box>
          )}
        </Box>
        {renderTopReactions(post.topReactions)}
      </Box>

      {commentsOpen && (
        <Box sx={{ borderTop: "1px solid #edf0f3", px: 2, py: 1.5 }}>
          {sortedComments.map((comment) => (
            <Box key={comment.id} sx={{ display: "flex", gap: 1, mb: 1.25 }}>
              <Avatar src={comment.authorAvatarUrl || undefined} sx={{ width: 32, height: 32 }}>
                {comment.authorName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ bgcolor: "#f0f2f5", borderRadius: "8px", px: 1.25, py: 0.75 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{comment.authorName}</Typography>
                <Typography sx={{ fontSize: 14 }}>{comment.content}</Typography>
              </Box>
            </Box>
          ))}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Viết bình luận..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAddComment();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  fontSize: "13px",
                  bgcolor: "#f1f5f9",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: "transparent" },
                },
              }}
            />
            <IconButton
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              color="primary"
              size="small"
              sx={{
                bgcolor: "#1877f2",
                color: "white",
                "&:hover": { bgcolor: "#166fe5" },
                "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                width: 32,
                height: 32,
                flexShrink: 0,
              }}
            >
              <Send sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      )}

      <EditPostDialog
        open={editing}
        onClose={() => setEditing(false)}
        post={post}
        currentUserId={currentUserId}
        onPostUpdated={(updatedPost) => {
          onPostChanged(updatedPost);
          setEditing(false);
        }}
      />

      <PostMediaModal
        open={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        post={post}
        initialIndex={activeMediaIndex}
        currentUserId={currentUserId}
        onPostChanged={onPostChanged}
      />

      <PostReactionsModal
        open={reactionsModalOpen}
        onClose={() => setReactionsModalOpen(false)}
        postId={post.id}
        currentUserId={currentUserId}
      />

      <SharePostModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        post={post}
        currentUserId={currentUserId}
        authorName={authorName || post.authorName}
        authorAvatarUrl={authorAvatarUrl ?? post.authorAvatarUrl}
        onPostShared={(newPost) => {
          onPostCreated?.(newPost);
          setShareModalOpen(false);
        }}
      />

      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="POST"
        targetId={post.id}
        targetName={post.authorName ? `Bài viết của ${post.authorName}` : undefined}
      />
    </Box>
  );
}

export function PostSkeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        my: "20px",
        bgcolor: "white",
        borderRadius: "8px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" sx={{ fontSize: "1rem", width: "30%" }} />
          <Skeleton variant="text" sx={{ fontSize: "0.8rem", width: "20%" }} />
        </Box>
      </Box>
      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "4px" }} />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: "4px" }} />
        <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: "4px" }} />
      </Box>
    </Box>
  );
}
