import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
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
import { createPost, uploadPostMedia, SocialPost } from "../../../services/SocialPostService";

type PostVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

type SelectedMediaItem = {
  file: File;
  preview: string;
};

const visibilityOptions: { value: PostVisibility; label: string; icon: React.ReactNode }[] = [
  { value: "PUBLIC", label: "Công khai", icon: <PublicIcon sx={{ fontSize: 15 }} /> },
  { value: "FRIENDS", label: "Bạn bè", icon: <PeopleIcon sx={{ fontSize: 15 }} /> },
  { value: "PRIVATE", label: "Riêng tư", icon: <LockIcon sx={{ fontSize: 15 }} /> },
];

const getVisibilityOption = (value: string) =>
  visibilityOptions.find((option) => option.value === value) || visibilityOptions[0];

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

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  currentUserId: number;
  authorName?: string;
  authorAvatarUrl?: string | null;
  showSubjectSelect?: boolean;
  onPostCreated: (post: SocialPost) => void;
  onPostingChange?: (posting: boolean) => void;
}

export default function CreatePostDialog({
  open,
  onClose,
  currentUserId,
  authorName = "Người dùng",
  authorAvatarUrl,
  showSubjectSelect = false,
  onPostCreated,
  onPostingChange,
}: CreatePostDialogProps) {
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState<PostVisibility>("PUBLIC");
  const [postSubject, setPostSubject] = useState("Toán cao cấp");
  const [visibilityAnchorEl, setVisibilityAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMediaItems, setSelectedMediaItems] = useState<SelectedMediaItem[]>([]);
  const [posting, setPosting] = useState(false);

  const selectedVisibility = getVisibilityOption(postVisibility);

  useEffect(() => {
    if (!open) {
      setPostContent("");
      setPostVisibility("PUBLIC");
      setPostSubject("Toán cao cấp");
      setSelectedMediaItems([]);
      setPosting(false);
    }
  }, [open]);

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
        ...filesToAdd.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        })),
      ];
    });
  };

  const handleCloseCreatePost = () => {
    if (posting) return;
    clearSelectedMedia();
    onClose();
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedMediaItems.length === 0) return;
    setPosting(true);
    onPostingChange?.(true);
    try {
      let uploadedMedia: any[] = [];
      if (selectedMediaItems.length > 0) {
        uploadedMedia = await Promise.all(selectedMediaItems.map((item) => uploadPostMedia(item.file)));
      }

      const payload: any = {
        authorId: currentUserId,
        content: postContent.trim(),
        visibility: postVisibility,
        media: uploadedMedia,
      };

      if (showSubjectSelect) {
        payload.subject = postSubject;
      }

      const post = await createPost(payload);
      onPostCreated(post);
      handleCloseCreatePost();
    } catch (error) {
      console.error(error);
      alert("Không thể tạo bài viết");
    } finally {
      setPosting(false);
      onPostingChange?.(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseCreatePost}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
    >
      <DialogTitle sx={{ textAlign: "center", fontSize: 24, fontWeight: 700, position: "relative", py: 2.5 }}>
        Tạo bài viết
        <IconButton
          onClick={handleCloseCreatePost}
          sx={{ position: "absolute", right: 18, top: 16, bgcolor: "#e5e7eb", "&:hover": { bgcolor: "#d1d5db" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 4, pt: 3, pb: 3.5 }}>
        {posting ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, py: 2 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" sx={{ fontSize: "1.2rem", width: "40%" }} />
                <Skeleton variant="text" sx={{ fontSize: "0.9rem", width: "25%" }} />
              </Box>
            </Box>
            <Skeleton variant="text" sx={{ fontSize: "1.5rem", width: "90%" }} />
            <Skeleton variant="text" sx={{ fontSize: "1.5rem", width: "70%" }} />
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: "12px", mt: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2, gap: 1.5 }}>
              <CircularProgress size={20} sx={{ color: "#3b82f6" }} />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#4b5563" }}>
                Đang tải tệp lên
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
              <Avatar src={authorAvatarUrl || undefined} sx={{ width: 56, height: 56 }}>
                {authorName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{authorName}</Typography>
                <Button
                  size="small"
                  onClick={(event) => setVisibilityAnchorEl(event.currentTarget)}
                  startIcon={selectedVisibility.icon}
                  sx={{
                    mt: 0.5,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: "#e5e7eb",
                    borderRadius: "8px",
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
              minRows={6}
              placeholder={`${authorName} ơi, bạn đang nghĩ gì thế?`}
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
              variant="standard"
              InputProps={{ disableUnderline: true, sx: { fontSize: 20, color: "#4b5563", lineHeight: 1.35 } }}
            />

            {selectedMediaItems.length > 0 && (
              <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1.5 }}>
                {selectedMediaItems.map((item, index) => {
                  const isImage = item.file.type.startsWith("image/");
                  const isVideo = item.file.type.startsWith("video/");

                  if (!isImage && !isVideo) {
                    const meta = getFileMeta(item.file.name);
                    return (
                      <Box
                        key={item.preview}
                        sx={{
                          position: "relative",
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          p: 1.5,
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
                        <DescriptionIcon sx={{ fontSize: 28, color: meta.color, mb: 0.5 }} />
                        <Typography
                          noWrap
                          sx={{
                            width: "100%",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#1f2937",
                            px: 0.5,
                          }}
                        >
                          {item.file.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: meta.color, fontWeight: 700 }}>
                          {meta.label}
                        </Typography>
                        <IconButton
                          onClick={() => removeSelectedMedia(index)}
                          sx={{
                            position: "absolute",
                            right: 6,
                            top: 6,
                            bgcolor: "rgba(255,255,255,0.9)",
                            "&:hover": { bgcolor: "#f3f4f6" },
                            width: 24,
                            height: 24,
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
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
                        border: "1px solid #e5e7eb",
                        aspectRatio: "1 / 1",
                        bgcolor: "#f3f4f6",
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
                          right: 6,
                          top: 6,
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "white" },
                          width: 24,
                          height: 24,
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}

            <Box sx={{ mt: 3.5, p: 2, border: "1px solid #e5e7eb", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Thêm đính kèm ({selectedMediaItems.length}/{MAX_POST_MEDIA})</Typography>
              <Button
                component="label"
                startIcon={<ImageIcon />}
                disabled={selectedMediaItems.length >= MAX_POST_MEDIA}
                sx={{ textTransform: "none", fontWeight: 700 }}
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
              onClick={handleCreatePost}
              sx={{ mt: 3.5, py: 1.5, textTransform: "none", fontWeight: 700, fontSize: 16, borderRadius: "10px", bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
            >
              Đăng
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
