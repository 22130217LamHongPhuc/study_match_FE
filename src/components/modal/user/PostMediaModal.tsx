import React, { useState, useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  Box,
  IconButton,
  Modal,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  addPostComment,
  loadPostComments,
  PostComment,
  SocialPost,
  togglePostLike,
} from "../../../services/SocialPostService";
import { parsePostContent, POST_BACKGROUNDS } from "./CreatePostDialog";

type PostVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

const visibilityOptions: { [key: string]: { label: string; icon: React.ReactNode } } = {
  PUBLIC: { label: "Công khai", icon: <PublicIcon sx={{ fontSize: 14, color: "#64748b" }} /> },
  FRIENDS: { label: "Bạn bè", icon: <PeopleIcon sx={{ fontSize: 14, color: "#64748b" }} /> },
  PRIVATE: { label: "Riêng tư", icon: <LockIcon sx={{ fontSize: 14, color: "#64748b" }} /> },
};

const formatTime = (value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  return date.toLocaleDateString("vi-VN");
};

interface PostMediaModalProps {
  open: boolean;
  onClose: () => void;
  post: SocialPost;
  initialIndex: number;
  currentUserId: number;
  onPostChanged: (post: SocialPost) => void;
}

export default function PostMediaModal({
  open,
  onClose,
  post,
  initialIndex,
  currentUserId,
  onPostChanged,
}: PostMediaModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const mediaItems = post.media || [];
  const activeMedia = mediaItems[activeIndex];

  // Sync initial index
  useEffect(() => {
    if (open) {
      setActiveIndex(initialIndex);
      void loadComments();
    }
  }, [open, initialIndex, post.id]);

  // Scroll to bottom when new comment added
  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const list = await loadPostComments(post.id);
      setComments(list);
    } catch (e) {
      console.error("Failed to load comments", e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleLike = async () => {
    try {
      const next = await togglePostLike(post.id, currentUserId);
      onPostChanged(next);
    } catch (e) {
      console.error("Failed to toggle like", e);
    }
  };

  const handleAddComment = async () => {
    const content = commentText.trim();
    if (!content) return;
    try {
      const comment = await addPostComment(post.id, currentUserId, content);
      setComments((prev) => [...prev, comment]);
      setCommentText("");
      onPostChanged({ ...post, commentCount: post.commentCount + 1 });
    } catch (e) {
      console.error("Failed to add comment", e);
    }
  };

  const handleNext = () => {
    if (activeIndex < mediaItems.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  if (!open || !activeMedia) return null;

  const isVideo = activeMedia.mediaType === "VIDEO";
  const { content: parsedContent } = parsePostContent(post.content);
  const visibility = visibilityOptions[post.visibility] || visibilityOptions.PUBLIC;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          width: "100vw",
          height: "100vh",
          bgcolor: "black",
          position: "relative",
          outline: "none",
        }}
      >
        {/* Left Side: Media Container */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            bgcolor: "#000",
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          {/* Close button on Top Left over dark area */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.15)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Media Element */}
          {isVideo ? (
            <Box
              component="video"
              src={activeMedia.mediaUrl}
              controls
              autoPlay
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Box
              component="img"
              src={activeMedia.mediaUrl}
              alt="fullscreen preview"
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          )}

          {/* Navigation Arrows */}
          {activeIndex > 0 && (
            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 20,
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
                width: 48,
                height: 48,
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 32 }} />
            </IconButton>
          )}

          {activeIndex < mediaItems.length - 1 && (
            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 20,
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
                width: 48,
                height: 48,
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 32 }} />
            </IconButton>
          )}

          {/* Image indicator in dark area */}
          {mediaItems.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 20,
                color: "white",
                bgcolor: "rgba(0, 0, 0, 0.6)",
                px: 2,
                py: 0.5,
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {activeIndex + 1} / {mediaItems.length}
            </Box>
          )}
        </Box>

        {/* Right Side: Post Info & Comments */}
        <Box
          sx={{
            width: { xs: "100%", sm: "380px", md: "420px" },
            height: "100%",
            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #e2e8f0",
            boxShadow: "4px 0 16px rgba(0,0,0,0.15)",
          }}
        >
          {/* Header Area */}
          <Box sx={{ p: 2.5, borderBottom: "1px solid #f1f5f9" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                src={post.authorAvatarUrl || undefined}
                sx={{ width: 40, height: 40, mr: 1.5, border: "1px solid #f1f5f9" }}
              >
                {post.authorName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>
                  {post.authorName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    {formatTime(post.createdAt)}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#94a3b8" }}>·</Typography>
                  {visibility.icon}
                  <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                    {visibility.label}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Post text content */}
            {parsedContent && (
              <Typography
                sx={{
                  whiteSpace: "pre-wrap",
                  color: "#334155",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  maxHeight: "150px",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: "4px" },
                  "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: "4px" },
                }}
              >
                {parsedContent}
              </Typography>
            )}
          </Box>

          {/* Engagement Status Bar */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ThumbUpIcon sx={{ fontSize: 16, color: post.likedByViewer ? "#3b82f6" : "#64748b" }} />
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
                {post.likeCount} lượt thích
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
              {post.commentCount} bình luận
            </Typography>
          </Box>

          {/* Quick Buttons (Like / Comment) */}
          <Box
            sx={{
              px: 2,
              py: 1,
              display: "flex",
              gap: 1,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <Button
              fullWidth
              startIcon={<ThumbUpIcon />}
              onClick={handleToggleLike}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: post.likedByViewer ? "#3b82f6" : "#64748b",
                bgcolor: post.likedByViewer ? "#eff6ff" : "transparent",
                borderRadius: "20px",
                py: 0.75,
                "&:hover": { bgcolor: post.likedByViewer ? "#dbeafe" : "#f1f5f9" },
              }}
            >
              Thích
            </Button>
            <Button
              fullWidth
              startIcon={<ChatBubbleIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: "#64748b",
                borderRadius: "20px",
                py: 0.75,
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              Bình luận
            </Button>
          </Box>

          {/* Comments List Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "#f8fafc",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: "4px" },
            }}
          >
            {loadingComments ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ color: "#3b82f6" }} />
              </Box>
            ) : comments.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </Typography>
              </Box>
            ) : (
              comments.map((comment) => (
                <Box key={comment.id} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Avatar
                    src={comment.authorAvatarUrl || undefined}
                    sx={{ width: 32, height: 32, border: "1px solid #e2e8f0" }}
                  >
                    {comment.authorName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box
                    sx={{
                      bgcolor: "white",
                      borderRadius: "12px",
                      px: 1.5,
                      py: 1,
                      maxWidth: "85%",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <Typography sx={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", mb: 0.5 }}>
                      {comment.authorName}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#334155", lineHeight: 1.4, wordBreak: "break-word" }}>
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
            <div ref={commentsEndRef} />
          </Box>

          {/* Add Comment Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e2e8f0",
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Viết bình luận dưới tên của bạn..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddComment();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  bgcolor: "#f1f5f9",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: "transparent" },
                  "&.Mui-focused fieldset": { borderColor: "#cbd5e1" },
                },
              }}
            />
            <IconButton
              disabled={!commentText.trim()}
              onClick={handleAddComment}
              sx={{
                color: "#3b82f6",
                "&.Mui-disabled": { color: "#cbd5e1" },
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
