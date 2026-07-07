import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { updatePost, uploadPostMedia, SocialPost } from "../../../services/SocialPostService";
import {
  POST_BACKGROUNDS,
  parsePostContent,
  visibilityOptions,
  getVisibilityOption,
  PostVisibility,
} from "./CreatePostDialog";

type SelectedMediaItem = {
  id?: number;
  file?: File;
  preview: string;
  mediaType: string;
  name: string;
};

const MAX_POST_MEDIA = 10;

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

interface EditPostDialogProps {
  open: boolean;
  onClose: () => void;
  post: SocialPost;
  currentUserId: number;
  onPostUpdated: (post: SocialPost) => void;
  onPostingChange?: (posting: boolean) => void;
}

export default function EditPostDialog({
  open,
  onClose,
  post,
  currentUserId,
  onPostUpdated,
  onPostingChange,
}: EditPostDialogProps) {
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState<PostVisibility>("PUBLIC");
  const [visibilityAnchorEl, setVisibilityAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMediaItems, setSelectedMediaItems] = useState<SelectedMediaItem[]>([]);
  const [posting, setPosting] = useState(false);
  const [selectedBgId, setSelectedBgId] = useState("none");

  const selectedVisibility = getVisibilityOption(postVisibility);

  useEffect(() => {
    if (open && post) {
      const { backgroundId, content: parsed } = parsePostContent(post.content);
      setPostContent(parsed || "");
      setPostVisibility(getVisibilityOption(post.visibility).value);
      setSelectedBgId(backgroundId || "none");

      // Pre-fill existing media items
      const existingMedia = (post.media || []).map((m) => {
        const lowerUrl = m.mediaUrl.toLowerCase();
        let name = "Tệp tin";
        try {
          const parts = m.mediaUrl.split("/");
          name = parts[parts.length - 1] || "Tệp tin";
        } catch (e) {}

        return {
          id: m.id,
          preview: m.mediaUrl,
          mediaType: m.mediaType,
          name: name,
        };
      });
      setSelectedMediaItems(existingMedia);
      setPosting(false);
    }
  }, [open, post]);

  const clearSelectedMedia = () => {
    selectedMediaItems.forEach((item) => {
      if (item.file) URL.revokeObjectURL(item.preview);
    });
    setSelectedMediaItems([]);
  };

  const removeSelectedMedia = (index: number) => {
    setSelectedMediaItems((prev) => {
      const removed = prev[index];
      if (removed && removed.file) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSelectMedia = (fileList: FileList | null) => {
    setSelectedBgId("none");
    if (!fileList) return;
    const files = Array.from(fileList);
    const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"];
    const validFiles = files.filter((file) => {
      const type = file.type;
      const name = file.name.toLowerCase();
      const isImgOrVid = type.startsWith("image/") || type.startsWith("video/");
      const isDoc = allowedExtensions.some((ext) => name.endsWith(ext));
      return isImgOrVid || isDoc;
    });

    if (validFiles.length !== files.length) {
      alert("Chỉ hỗ trợ đính kèm hình ảnh, video và tài liệu phổ biến (PDF, Word, Excel, PowerPoint, Text).");
    }

    setSelectedMediaItems((prev) => {
      const availableSlots = MAX_POST_MEDIA - prev.length;
      if (availableSlots <= 0) {
        alert(`Chỉ được thêm tối đa ${MAX_POST_MEDIA} tệp đính kèm`);
        return prev;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);
      if (validFiles.length > availableSlots) {
        alert(`Chỉ được thêm tối đa ${MAX_POST_MEDIA} tệp đính kèm`);
      }

      return [
        ...prev,
        ...filesToAdd.map((file) => {
          const type = file.type;
          const mediaType = type.startsWith("video/") ? "VIDEO" : type.startsWith("image/") ? "IMAGE" : "DOCUMENT";
          return {
            file,
            preview: URL.createObjectURL(file),
            mediaType,
            name: file.name,
          };
        }),
      ];
    });
  };

  const handleCloseEditPost = () => {
    if (posting) return;
    clearSelectedMedia();
    onClose();
  };

  const handleUpdatePost = async () => {
    if (!postContent.trim() && selectedMediaItems.length === 0) return;
    setPosting(true);
    onPostingChange?.(true);
    try {
      // 1. Upload new files and map existing ones
      const finalMediaPayload = await Promise.all(
        selectedMediaItems.map(async (item) => {
          if (item.file) {
            // New file upload
            const uploaded = await uploadPostMedia(item.file);
            return {
              mediaUrl: uploaded.mediaUrl,
              mediaType: uploaded.mediaType,
            };
          } else {
            // Existing file
            return {
              mediaUrl: item.preview,
              mediaType: item.mediaType,
            };
          }
        })
      );

      // 2. Build standard JSON if background is set
      const finalContent = selectedBgId !== "none"
        ? JSON.stringify({ text: postContent.trim(), background: selectedBgId })
        : postContent.trim();

      const payload = {
        actorId: currentUserId,
        content: finalContent,
        visibility: postVisibility,
        media: finalMediaPayload,
      };

      const updated = await updatePost(post.id, payload);
      onPostUpdated(updated);
      handleCloseEditPost();
    } catch (error) {
      console.error(error);
      alert("Không thể cập nhật bài viết");
    } finally {
      setPosting(false);
      onPostingChange?.(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseEditPost}
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", p: 0.5, width: 550, maxWidth: "92%" } }}
    >
      <DialogTitle sx={{ textAlign: "center", fontSize: 20, fontWeight: 800, position: "relative", py: 2, color: "#0f172a" }}>
        Chỉnh sửa bài viết
        <IconButton
          onClick={handleCloseEditPost}
          sx={{ position: "absolute", right: 18, top: 12, color: '#64748b', bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
          size="small"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 3, pt: 2, pb: 2.5 }}>
        {posting ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 2 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" sx={{ fontSize: "1.1rem", width: "40%" }} />
                <Skeleton variant="text" sx={{ fontSize: "0.8rem", width: "25%" }} />
              </Box>
            </Box>
            <Skeleton variant="text" sx={{ fontSize: "1.3rem", width: "90%" }} />
            <Skeleton variant="text" sx={{ fontSize: "1.3rem", width: "70%" }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "12px", mt: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2, gap: 1.5 }}>
              <CircularProgress size={18} sx={{ color: "#3b82f6" }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#4b5563" }}>
                Đang lưu thay đổi...
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
              <Avatar src={post.authorAvatarUrl || undefined} sx={{ width: 48, height: 48, border: "1px solid #e2e8f0" }}>
                {post.authorName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{post.authorName}</Typography>
                <Button
                  size="small"
                  onClick={(event) => setVisibilityAnchorEl(event.currentTarget)}
                  startIcon={selectedVisibility.icon}
                  sx={{
                    mt: 0.5,
                    px: 1.25,
                    py: 0.25,
                    bgcolor: "#f1f5f9",
                    borderRadius: "8px",
                    color: "#475569",
                    textTransform: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1px solid #e2e8f0",
                    "&:hover": { bgcolor: "#e2e8f0" },
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

            {selectedBgId === "none" ? (
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder={`${post.authorName} ơi, bạn đang nghĩ gì thế?`}
                value={postContent}
                onChange={(event) => setPostContent(event.target.value)}
                variant="standard"
                InputProps={{ disableUnderline: true, sx: { fontSize: 16, color: "#1e293b", lineHeight: 1.4 } }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  minHeight: "290px",
                  borderRadius: "12px",
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: POST_BACKGROUNDS.find(bg => bg.id === selectedBgId)?.style.background,
                  boxShadow: "inset 0 0 80px rgba(0,0,0,0.15)",
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  placeholder={`${post.authorName} ơi, bạn đang nghĩ gì thế?`}
                  value={postContent}
                  onChange={(event) => setPostContent(event.target.value)}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      fontSize: "20px",
                      fontWeight: 800,
                      color: POST_BACKGROUNDS.find(bg => bg.id === selectedBgId)?.style.color || "white",
                      textAlign: "center",
                      lineHeight: 1.4,
                      "& textarea": {
                        textAlign: "center",
                        color: POST_BACKGROUNDS.find(bg => bg.id === selectedBgId)?.style.color || "white",
                        "&::placeholder": {
                          color: POST_BACKGROUNDS.find(bg => bg.id === selectedBgId)?.style.color === "white"
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(15,23,42,0.5)",
                          opacity: 1,
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}

            {/* Background color selectors */}
            {selectedMediaItems.length === 0 && (
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, overflowX: "auto", py: 0.5, "&::-webkit-scrollbar": { display: "none" } }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: selectedBgId === "none" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    bgcolor: "#f1f5f9",
                    transition: "transform 0.1s ease",
                    "&:hover": { transform: "scale(1.08)" },
                    flexShrink: 0,
                  }}
                  onClick={() => setSelectedBgId("none")}
                >
                  <Box sx={{ width: 14, height: 14, border: "2px solid #64748b", borderRadius: "50%", position: "relative", "&::after": { content: '""', position: "absolute", top: "50%", left: 0, right: 0, height: "2px", bgcolor: "#64748b", transform: "rotate(-45deg)" } }} />
                </Box>
                {POST_BACKGROUNDS.filter(bg => bg.id !== "none").map((bg) => (
                  <Box
                    key={bg.id}
                    onClick={() => setSelectedBgId(bg.id)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      cursor: "pointer",
                      background: bg.style.background,
                      border: selectedBgId === bg.id ? "2px solid #2563eb" : "1px solid rgba(0,0,0,0.1)",
                      transition: "transform 0.1s ease",
                      "&:hover": { transform: "scale(1.08)" },
                      flexShrink: 0,
                    }}
                  />
                ))}
              </Box>
            )}

            {selectedMediaItems.length > 0 && (
              <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 1.5 }}>
                {selectedMediaItems.map((item, index) => {
                  const isImage = item.mediaType === "IMAGE";
                  const isVideo = item.mediaType === "VIDEO";

                  if (!isImage && !isVideo) {
                    const meta = getFileMeta(item.name);
                    return (
                      <Box
                        key={item.preview}
                        sx={{
                          position: "relative",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          p: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          bgcolor: meta.bg,
                          aspectRatio: "1 / 1",
                          gap: 0.5,
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: 24, color: meta.color, mb: 0.5 }} />
                        <Typography
                          noWrap
                          sx={{
                            width: "100%",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#1e293b",
                            px: 0.5,
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: meta.color, fontWeight: 700 }}>
                          {meta.label}
                        </Typography>
                        <IconButton
                          onClick={() => removeSelectedMedia(index)}
                          sx={{
                            position: "absolute",
                            right: 4,
                            top: 4,
                            bgcolor: "rgba(255,255,255,0.9)",
                            "&:hover": { bgcolor: "#f1f5f9" },
                            width: 20,
                            height: 20,
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    );
                  }

                  return (
                    <Box
                      key={item.preview}
                      sx={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        aspectRatio: "1 / 1",
                        bgcolor: "#f8fafc",
                      }}
                    >
                      {isVideo ? (
                        <Box component="video" src={item.preview} controls sx={{ width: "100%", height: "100%", objectFit: "cover", bgcolor: "#111" }} />
                      ) : (
                        <Box component="img" src={item.preview} alt={`preview ${index + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      )}
                      <IconButton
                        onClick={() => removeSelectedMedia(index)}
                        sx={{
                          position: "absolute",
                          right: 4,
                          top: 4,
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "white" },
                          width: 20,
                          height: 20,
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}

            <Box sx={{ mt: 2, p: 1.5, border: "1px solid #e2e8f0", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#475569" }}>Thêm đính kèm ({selectedMediaItems.length}/{MAX_POST_MEDIA})</Typography>
              <Button
                component="label"
                startIcon={<ImageIcon />}
                disabled={selectedMediaItems.length >= MAX_POST_MEDIA}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 13 }}
                size="small"
              >
                Chọn tệp tin
                <input
                  hidden
                  multiple
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
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
              onClick={handleUpdatePost}
              sx={{ 
                mt: 2.5, 
                py: 1, 
                textTransform: "none", 
                fontWeight: 700, 
                fontSize: 15, 
                borderRadius: "20px", 
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                "&:hover": { 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)',
                },
                "&.Mui-disabled": {
                  background: "#e2e8f0",
                  color: "#94a3b8",
                  boxShadow: "none"
                }
              }}
            >
              Lưu thay đổi
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
