import { Lock, MoreHoriz, People, Public, Description } from "@mui/icons-material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ShareIcon from "@mui/icons-material/Share";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Skeleton,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import {
  addPostComment,
  deletePost,
  loadPostComments,
  PostComment,
  SocialPost,
  togglePostLike,
  updatePost,
} from "../../services/SocialPostService";

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
    return { label: "PowerPoint", color: "#f97316", bg: "#ffedd5" };
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
  onPostChanged: (post: SocialPost) => void;
  onPostDeleted: (postId: number) => void;
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

export default function Post({ post, currentUserId, onPostChanged, onPostDeleted }: PostProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editVisibilityAnchorEl, setEditVisibilityAnchorEl] = useState<null | HTMLElement>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [editVisibility, setEditVisibility] = useState<PostVisibility>(getVisibilityOption(post.visibility).value);
  const isOwner = currentUserId === post.authorId;
  const mediaItems = post.media || [];
  const visibility = getVisibilityOption(post.visibility);
  const selectedEditVisibility = getVisibilityOption(editVisibility);

  useEffect(() => {
    setEditContent(post.content || "");
    setEditVisibility(getVisibilityOption(post.visibility).value);
  }, [post.content, post.visibility]);

  const sortedComments = useMemo(() => comments, [comments]);

  const handleToggleLike = async () => {
    const next = await togglePostLike(post.id, currentUserId);
    onPostChanged(next);
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

  const handleSaveEdit = async () => {
    const next = await updatePost(post.id, {
      actorId: currentUserId,
      content: editContent,
      visibility: editVisibility,
      media: post.media?.map((item) => ({ mediaUrl: item.mediaUrl, mediaType: item.mediaType })),
    });
    onPostChanged(next);
    setEditing(false);
  };

  const handleDelete = async () => {
    await deletePost(post.id, currentUserId);
    onPostDeleted(post.id);
    setAnchorEl(null);
  };

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
        {isOwner && (
          <>
            <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
              <MoreHoriz />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => { setEditing(true); setAnchorEl(null); }}>Sửa bài</MenuItem>
              <MenuItem onClick={handleDelete}>Xóa bài</MenuItem>
            </Menu>
          </>
        )}
      </Box>

      <Box sx={{ px: 2, pb: 1 }}>
        {editing ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              multiline
              minRows={3}
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
            />
            <Box sx={{ display: "flex", justifycontent: "space-between", gap: 1, alignItems: "center" }}>
              <Button
                size="small"
                onClick={(event) => setEditVisibilityAnchorEl(event.currentTarget)}
                startIcon={selectedEditVisibility.icon}
                sx={{ textTransform: "none", color: "#111827", bgcolor: "#e5e7eb", "&:hover": { bgcolor: "#d1d5db" } }}
              >
                {selectedEditVisibility.label}
              </Button>
              <Menu anchorEl={editVisibilityAnchorEl} open={Boolean(editVisibilityAnchorEl)} onClose={() => setEditVisibilityAnchorEl(null)}>
                {visibilityOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    selected={option.value === editVisibility}
                    onClick={() => {
                      setEditVisibility(option.value);
                      setEditVisibilityAnchorEl(null);
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={() => setEditing(false)}>Hủy</Button>
                <Button variant="contained" onClick={handleSaveEdit}>Lưu</Button>
              </Box>
            </Box>
          </Box>
        ) : (
          post.content && <Typography sx={{ whiteSpace: "pre-wrap", color: "#333" }}>{post.content}</Typography>
        )}
      </Box>

      {mediaItems.length > 0 && (
        <Box
          sx={{
            bgcolor: "#fdf4e3",
            display: "grid",
            gridTemplateColumns: mediaItems.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
            gap: mediaItems.length === 1 ? 0 : "3px",
            overflow: "hidden",
          }}
        >
          {mediaItems.map((media, index) => {
            const isVideo = media.mediaType === "VIDEO";
            const isImage = isImageUrl(media.mediaUrl);
            const isDoc = !isVideo && !isImage;
            return (
              <Box
                key={media.id ?? `${media.mediaUrl}-${index}`}
                sx={{
                  minHeight: mediaItems.length === 1 ? 260 : 180,
                  maxHeight: mediaItems.length === 1 ? 520 : 320,
                  bgcolor: "#111",
                  overflow: "hidden",
                }}
              >
                {isDoc ? (
                  <Box
                    onClick={() => downloadFile(media.mediaUrl, getFileNameFromUrl(media.mediaUrl))}
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      bgcolor: getFileMeta(media.mediaUrl).bg,
                      p: 2,
                      textAlign: "center",
                      gap: 1,
                      "&:hover": { bgcolor: "#e5e7eb" },
                    }}
                  >
                    <Description sx={{ fontSize: 44, color: getFileMeta(media.mediaUrl).color }} />
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
                      {getFileNameFromUrl(media.mediaUrl)}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Tải xuống ({getFileMeta(media.mediaUrl).label})
                    </Typography>
                  </Box>
                ) : isVideo ? (
                  <Box component="video" src={media.mediaUrl} controls sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <Box component="img" src={media.mediaUrl} alt={`post media ${index + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={{ p: "10px 16px", display: "flex", alignItems: "center", justifycontent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2.5 }}>
          <Box onClick={handleToggleLike} sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer" }}>
            <ThumbUpIcon sx={{ fontSize: 22, color: post.likedByViewer ? "#1877f2" : "#65676b" }} />
            <Typography sx={{ fontSize: "0.9rem", color: "#65676b", fontWeight: 500 }}>{post.likeCount}</Typography>
          </Box>

          <Box onClick={handleToggleComments} sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer" }}>
            <ChatBubbleIcon sx={{ fontSize: 22, color: "#65676b" }} />
            <Typography sx={{ fontSize: "0.9rem", color: "#65676b", fontWeight: 500 }}>{post.commentCount}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer" }}>
            <ShareIcon sx={{ fontSize: 24, color: "#65676b", transform: "scaleX(-1)" }} />
            <Typography sx={{ fontSize: "0.9rem", color: "#65676b", fontWeight: 500 }}>0</Typography>
          </Box>
        </Box>
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
          <Box sx={{ display: "flex", gap: 1 }}>
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
            />
            <Button variant="contained" onClick={handleAddComment}>Gửi</Button>
          </Box>
        </Box>
      )}
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
