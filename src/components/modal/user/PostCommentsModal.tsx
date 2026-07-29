import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Avatar,
  Typography,
  TextField,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ImageIcon from "@mui/icons-material/Image";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import { Lock, People, Public, Description } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  loadPostComments,
  addPostComment,
  togglePostLike,
  SocialPost,
  PostComment,
} from "../../../services/SocialPostService";
import { parsePostContent, POST_BACKGROUNDS } from "./CreatePostDialog";
import PostReactionsModal from "./PostReactionsModal";

type PostCommentsModalProps = {
  open: boolean;
  onClose: () => void;
  post: SocialPost;
  currentUserId: number;
  onPostChanged: (post: SocialPost) => void;
};

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
    if (filenameParam) return decodeURIComponent(filenameParam);
  } catch (e) { }

  const lastSlash = url.lastIndexOf("/");
  if (lastSlash >= 0) {
    let rawName = url.substring(lastSlash + 1);
    const qMark = rawName.indexOf("?");
    if (qMark >= 0) rawName = rawName.substring(0, qMark);
    return rawName;
  }
  return "Tài liệu học tập";
};

const downloadFile = async (url: string, fileName?: string) => {
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
    window.open(url, "_blank");
  }
};

const visibilityOptions = [
  { value: "PUBLIC", label: "Công khai", icon: <Public sx={{ fontSize: 13, color: "#65676b" }} /> },
  { value: "FRIENDS", label: "Bạn bè", icon: <People sx={{ fontSize: 13, color: "#65676b" }} /> },
  { value: "PRIVATE", label: "Riêng tư", icon: <Lock sx={{ fontSize: 13, color: "#65676b" }} /> },
];

const getVisibilityOption = (value?: string) =>
  visibilityOptions.find((option) => option.value === value) || visibilityOptions[0];

const formatTime = (value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60000) return "Vừa xong";
  const minutes = Math.floor(diffMs / 60000);
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

function MediaRenderer({ item, isVideo, isDoc }: { item: any; isVideo: boolean; isDoc: boolean }) {
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
      {isVideo ? (
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          <Box
            component="video"
            src={item.mediaUrl}
            controls
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </Box>
      ) : (
        <Box
          component="img"
          src={item.mediaUrl}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </Box>
  );
}

export default function PostCommentsModal({
  open,
  onClose,
  post,
  currentUserId,
  onPostChanged,
}: PostCommentsModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [showReactionsPopup, setShowReactionsPopup] = useState(false);
  const [reactionsModalOpen, setReactionsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const mediaItems = post.media || [];
  const visibility = getVisibilityOption(post.visibility);
  const { backgroundId, content: parsedContent } = useMemo(() => parsePostContent(post.content), [post.content]);
  const hasBackground = backgroundId !== "none" && mediaItems.length === 0;
  const currentBg = POST_BACKGROUNDS.find(bg => bg.id === backgroundId);

  useEffect(() => {
    if (open && post.id) {
      setVisibleCount(5);
      void fetchComments();
    }
  }, [open, post.id]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await loadPostComments(post.id);
      setComments(data);
    } catch (e) {
      console.error("Failed to load comments", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (reactionType?: string) => {
    try {
      const next = await togglePostLike(post.id, currentUserId, reactionType);
      onPostChanged(next);
    } catch (e) {
      console.error("Failed to toggle like", e);
    }
  };

  const handleAddComment = async () => {
    const content = commentText.trim();
    if (!content || wordCount > 40 || sendingComment) return;
    setSendingComment(true);
    try {
      const comment = await addPostComment(post.id, currentUserId, content);
      setComments((prev) => [...prev, comment]);
      setCommentText("");
      setVisibleCount((prev) => prev + 1);
      onPostChanged({ ...post, commentCount: post.commentCount + 1 });
    } catch (e) {
      console.error("Failed to add comment", e);
    } finally {
      setSendingComment(false);
    }
  };

  const countWords = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return 0;
    return cleanText.split(/\s+/).length;
  };

  const wordCount = countWords(commentText);
  const isLimitExceeded = wordCount > 40;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleAddComment();
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getReactionUI = (reactionType?: string | null) => {
    if (!reactionType) return { icon: <ThumbUpOutlinedIcon sx={{ fontSize: 20, color: "#8898aa" }} />, color: "#8898aa" };
    switch (reactionType.toUpperCase()) {
      case "LOVE":
        return { icon: <span style={{ fontSize: 20 }}>❤️</span>, color: "#f43f5e" };
      case "HAHA":
        return { icon: <span style={{ fontSize: 20 }}>😆</span>, color: "#eab308" };
      case "WOW":
        return { icon: <span style={{ fontSize: 20 }}>😮</span>, color: "#eab308" };
      case "SAD":
        return { icon: <span style={{ fontSize: 20 }}>😢</span>, color: "#3b82f6" };
      case "ANGRY":
        return { icon: <span style={{ fontSize: 20 }}>😡</span>, color: "#2563eb" };
      case "LIKE":
      default:
        return { icon: <ThumbUpIcon sx={{ fontSize: 20, color: "#1877f2" }} />, color: "#1877f2" };
    }
  };

  const rxUI = getReactionUI(post.likedByViewer ? post.reactionType : null);

  const renderTopReactions = (topReactions?: string[] | null) => {
    if (!topReactions || topReactions.length === 0) return null;
    return (
      <Box
        onClick={() => setReactionsModalOpen(true)}
        sx={{ display: "flex", alignItems: "center", cursor: "pointer", "&:hover": { opacity: 0.8 } }}
      >
        {topReactions.slice(0, 3).map((type, idx) => (
          <Box
            key={type}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              bgcolor: "#f1f5f9",
              border: "1.5px solid white",
              marginLeft: idx > 0 ? "-6px" : "0",
              zIndex: 3 - idx,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {getReactionEmoji(type)}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          height: "85vh",
          maxHeight: "750px",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          py: 2,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#0f172a", textAlign: "center" }}>
          Bài viết của {post.authorName}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 14,
            top: 10,
            color: "#64748b",
            bgcolor: "#f1f5f9",
            "&:hover": { bgcolor: "#e2e8f0" },
          }}
          size="small"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {/* Main Body */}
      <DialogContent
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
        }}
      >
        {/* Post Info Section */}
        <Box sx={{ p: 2 }}>
          {/* Author info */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <Avatar
              src={post.authorAvatarUrl || undefined}
              onClick={() => {
                navigate(`/profile/${post.authorId}`);
                onClose();
              }}
              sx={{ width: 40, height: 40, mr: 1.5, border: "1px solid #f0f2f5", cursor: "pointer" }}
            >
              {post.authorName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                onClick={() => {
                  navigate(`/profile/${post.authorId}`);
                  onClose();
                }}
                sx={{
                  fontWeight: 700,
                  color: "#050505",
                  fontSize: "14px",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {post.authorName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                <Typography sx={{ fontSize: "11px", color: "#65676b" }}>
                  {formatTime(post.createdAt)} ·
                </Typography>
                {visibility.icon}
                <Typography sx={{ fontSize: "11px", color: "#65676b" }}>{visibility.label}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Text Content */}
          {hasBackground ? (
            <Box
              sx={{
                width: "100%",
                minHeight: "180px",
                borderRadius: "12px",
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: currentBg?.style.background,
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.1)",
                textAlign: "center",
                mb: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: currentBg?.style.color || "white",
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {parsedContent}
              </Typography>
            </Box>
          ) : (
            parsedContent && (
              <Typography sx={{ whiteSpace: "pre-wrap", color: "#1e293b", fontSize: "14.5px", lineHeight: 1.5, mb: 1.5 }}>
                {parsedContent}
              </Typography>
            )
          )}

          {/* Media Items */}
          {mediaItems.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
              {mediaItems.map((item, index) => (
                <Box
                  key={item.id ?? index}
                  sx={{
                    width: "100%",
                    maxHeight: "360px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <MediaRenderer
                    item={item}
                    isVideo={item.mediaType === "VIDEO"}
                    isDoc={item.mediaType !== "VIDEO" && !isImageUrl(item.mediaUrl)}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Shared Post Info */}
          {post.sharedPost && (() => {
            const sp = post.sharedPost!;
            const { backgroundId: spBgId, content: spContent } = parsePostContent(sp.content ?? "");
            const spBg = POST_BACKGROUNDS.find(b => b.id === spBgId);
            const spHasBg = spBgId !== "none" && (sp.media ?? []).length === 0;
            return (
              <Box
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  p: 1.5,
                  bgcolor: "#f8fafc",
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Avatar src={sp.authorAvatarUrl || undefined} sx={{ width: 28, height: 28 }}>
                    {sp.authorName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontWeight: 700, fontSize: "13px" }}>{sp.authorName}</Typography>
                </Box>
                {spHasBg ? (
                  <Box sx={{ p: 2, borderRadius: "8px", background: spBg?.style.background, textAlign: "center", color: spBg?.style.color || "white" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "14px" }}>{spContent}</Typography>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "13px", whiteSpace: "pre-wrap" }}>{spContent}</Typography>
                )}
              </Box>
            );
          })()}

          {/* Reaction/Comment Counts */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1, py: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {renderTopReactions(post.topReactions)}
              <Typography sx={{ fontSize: "0.85rem", color: "#64748b", cursor: "pointer", fontWeight: 500, "&:hover": { textDecoration: "underline", color: "#1877f2" } }} onClick={() => setReactionsModalOpen(true)}>
                {post.likeCount > 0 ? post.likeCount : ""}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
              {post.commentCount} bình luận
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Action Row */}
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "space-between", py: 0.5 }}>
            {/* Like with reactions popup */}
            <Box
              onMouseEnter={() => setShowReactionsPopup(true)}
              onMouseLeave={() => setShowReactionsPopup(false)}
              sx={{ position: "relative", flex: 1, display: "flex" }}
            >
              <Box
                onClick={() => void handleToggleLike()}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  py: 1,
                  cursor: "pointer",
                  borderRadius: "30px",
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  color: rxUI.color,
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                    borderColor: "#cbd5e1",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
                    color: rxUI.color === "#8898aa" ? "#1877f2" : rxUI.color,
                  },
                  "&:active": {
                    transform: "translateY(0) scale(0.97)",
                  },
                }}
              >
                {rxUI.icon}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: "normal" }}>
                  Thích
                </Typography>
              </Box>

              {showReactionsPopup && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "white",
                    borderRadius: "30px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    border: "1px solid #e2e8f0",
                    p: "6px 12px",
                    display: "flex",
                    gap: "12px",
                    zIndex: 20,
                    mb: 1,
                    animation: "fadeInUp 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
                    "@keyframes fadeInUp": {
                      from: { opacity: 0, transform: "translateX(-50%) translateY(10px)" },
                      to: { opacity: 1, transform: "translateX(-50%) translateY(0)" },
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
                        fontSize: "22px",
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

            {/* Comment Button */}
            <Box
              onClick={focusInput}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                py: 1,
                cursor: "pointer",
                borderRadius: "30px",
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                color: "#8898aa",
                "&:hover": {
                  bgcolor: "#f1f5f9",
                  borderColor: "#cbd5e1",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
                  color: "#059669",
                  "& svg": { color: "#059669", transform: "scale(1.1)" }
                },
                "& svg": { transition: "transform 0.2s" },
                "&:active": {
                  transform: "translateY(0) scale(0.97)",
                },
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: "#8898aa" }} />
              <Typography sx={{ fontSize: "0.85rem", fontWeight: "normal" }}>
                Bình luận
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mt: 1 }} />
        </Box>

        {/* Comments List Section */}
        <Box sx={{ flex: 1, px: 2, pb: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography sx={{ color: "#64748b", fontSize: "13.5px", textAlign: "center", py: 4 }}>
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </Typography>
          ) : (
            <>
              {comments.length > visibleCount && (
                <Typography
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  sx={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1877f2",
                    cursor: "pointer",
                    mb: 2,
                    pl: 1,
                    display: "inline-block",
                    "&:hover": { textDecoration: "underline" }
                  }}
                >
                  Xem các bình luận trước...
                </Typography>
              )}
              {comments.slice(-visibleCount).map((comment) => (
                <Box key={comment.id} sx={{ display: "flex", gap: 1.25, mb: 2, alignItems: "flex-start" }}>
                  <Avatar
                    src={comment.authorAvatarUrl || undefined}
                    sx={{ width: 32, height: 32, cursor: "pointer" }}
                    onClick={() => {
                      navigate(`/profile/${comment.authorId}`);
                      onClose();
                    }}
                  >
                    {comment.authorName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ display: "flex", flexDirection: "column", maxWidth: "82%" }}>
                    <Box sx={{ bgcolor: "#f0f2f5", borderRadius: "16px", px: 1.75, py: 1 }}>
                      <Typography
                        onClick={() => {
                          navigate(`/profile/${comment.authorId}`);
                          onClose();
                        }}
                        sx={{ fontSize: 13, fontWeight: 700, mb: 0.25, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                      >
                        {comment.authorName}
                      </Typography>
                      {comment.moderationStatus === "HATE" || comment.moderationStatus === "OFFENSIVE" ? (
                        <Typography sx={{ fontSize: 13.5, fontStyle: "italic", color: "#8e8e8e" }}>
                          Bình luận đã bị ẩn do vi phạm chính sách cộng đồng
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: 13.5, color: "#1c1e21", lineHeight: 1.4, whiteSpace: "pre-wrap" }}>
                          {comment.content}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5, pl: 1 }}>
                      <Typography sx={{ fontSize: "11px", color: "#65676b" }}>
                        {formatTime(comment.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </>
          )}
        </Box>
      </DialogContent>

      {/* Pinned Bottom Input Form */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Avatar
            src={localStorage.getItem("avatarUrl") || undefined}
            sx={{ width: 36, height: 36, mt: 0.5 }}
          >
            {(localStorage.getItem("fullName") || "U").charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={4}
                size="small"
                placeholder="Viết bình luận..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sendingComment}
                InputProps={{
                  disableUnderline: true,
                  endAdornment: (
                    <Box sx={{ display: "flex", gap: 0.5, pr: 0.5, color: "#64748b" }}>
                    </Box>
                  ),
                  sx: {
                    borderRadius: "22px",
                    fontSize: "13px",
                    bgcolor: "#f1f5f9",
                    py: 1,
                    px: 2,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "transparent" },
                  },
                }}
              />
              <IconButton
                onClick={handleAddComment}
                disabled={!commentText.trim() || isLimitExceeded || sendingComment}
                sx={{
                  bgcolor: "#1877f2",
                  color: "white",
                  "&:hover": { bgcolor: "#166fe5" },
                  "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                }}
              >
                {sendingComment ? (
                  <CircularProgress size={16} sx={{ color: "white" }} />
                ) : (
                  <SendIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Box>

          </Box>
        </Box>
      </Box>

      {/* Reactions Modal */}
      <PostReactionsModal
        open={reactionsModalOpen}
        onClose={() => setReactionsModalOpen(false)}
        postId={post.id}
        currentUserId={currentUserId}
      />
    </Dialog>
  );
}
