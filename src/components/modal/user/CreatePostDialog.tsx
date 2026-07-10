import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import LockIcon from "@mui/icons-material/Lock";
import { toast } from "react-toastify";
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

export type PostVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

type SelectedMediaItem = {
  file: File;
  preview: string;
};

export const visibilityOptions: { value: PostVisibility; label: string; icon: React.ReactNode }[] = [
  { value: "PUBLIC", label: "Công khai", icon: <PublicIcon sx={{ fontSize: 15 }} /> },
  { value: "FRIENDS", label: "Bạn bè", icon: <PeopleIcon sx={{ fontSize: 15 }} /> },
  { value: "PRIVATE", label: "Riêng tư", icon: <LockIcon sx={{ fontSize: 15 }} /> },
];

export const getVisibilityOption = (value: string) =>
  visibilityOptions.find((option) => option.value === value) || visibilityOptions[0];

export const POST_BACKGROUNDS = [
  { id: "none", name: "none", style: { bgcolor: "white", color: "#1e293b", border: "1px solid #cbd5e1" } },
  { id: "bg-sky", name: "Bầu trời", style: { background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", color: "#0369a1" } },
  { id: "bg-lavender", name: "Oải hương", style: { background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)", color: "#6b21a8" } },
  { id: "bg-rose", name: "Hoa hồng", style: { background: "linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)", color: "#be123c" } },
  { id: "bg-mint", name: "Bạc hà", style: { background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", color: "#047857" } },
  { id: "bg-lemon", name: "Chanh vàng", style: { background: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)", color: "#a16207" } },
  { id: "bg-clay", name: "Đất sét", style: { background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", color: "#c2410c" } },
  { id: "bg-sunset", name: "Sunset", style: { background: "linear-gradient(135deg, #a21caf 0%, #3b82f6 100%)", color: "white" } },
  { id: "bg-violet-pink", name: "Violet Pink", style: { background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", color: "white" } },
  { id: "bg-orange-yellow", name: "Orange Yellow", style: { background: "linear-gradient(135deg, #f97316 0%, #facc15 100%)", color: "white" } },
  { id: "bg-purple", name: "Màu Tím", style: { background: "linear-gradient(135deg, #d904e9 0%, #70027a 100%)", color: "white" } },
  { id: "bg-red", name: "Màu Đỏ", style: { background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)", color: "white" } },
  { id: "bg-black", name: "Màu Đen", style: { background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)", color: "white" } },
];

export function parsePostContent(rawContent: string | null | undefined) {
  if (!rawContent) return { backgroundId: "none", content: "" };
  try {
    const parsed = JSON.parse(rawContent);
    if (parsed && typeof parsed === "object" && "background" in parsed) {
      return { backgroundId: parsed.background || "none", content: parsed.text || "" };
    }
  } catch (e) {
    // Not valid JSON
  }
  const match = rawContent.match(/^\[BG:([^\]]+)\](.*)$/s);
  if (match) {
    return { backgroundId: match[1], content: match[2] };
  }
  return { backgroundId: "none", content: rawContent };
}

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
  const [selectedBgId, setSelectedBgId] = useState("none");

  const selectedVisibility = getVisibilityOption(postVisibility);

  useEffect(() => {
    if (!open) {
      setPostContent("");
      setPostVisibility("PUBLIC");
      setPostSubject("Toán cao cấp");
      setSelectedMediaItems([]);
      setPosting(false);
      setSelectedBgId("none");
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
      toast.warning("Chỉ hỗ trợ đính kèm hình ảnh, video và tài liệu phổ biến (PDF, Word, Excel, PowerPoint, Text).");
    }

    setSelectedMediaItems((prev) => {
      const availableSlots = MAX_POST_MEDIA - prev.length;
      if (availableSlots <= 0) {
        toast.warning(`Chỉ được thêm tối đa ${MAX_POST_MEDIA} tệp đính kèm`);
        return prev;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);
      if (validFiles.length > availableSlots) {
        toast.warning(`Chỉ được thêm tối đa ${MAX_POST_MEDIA} tệp đính kèm`);
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

      const finalContent = selectedBgId !== "none"
        ? JSON.stringify({ text: postContent.trim(), background: selectedBgId })
        : postContent.trim();

      const payload: any = {
        authorId: currentUserId,
        content: finalContent,
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
      toast.error("Không thể tạo bài viết");
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
      PaperProps={{ sx: { borderRadius: "16px", p: 0.5, width: 550, maxWidth: "92%" } }}
    >
      <DialogTitle sx={{ textAlign: "center", fontSize: 20, fontWeight: 700, position: "relative", py: 2, color: "#0f172a" }}>
        Tạo bài viết
        <IconButton
          onClick={handleCloseCreatePost}
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
                Đang tải tệp lên
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
              <Avatar src={authorAvatarUrl || undefined} sx={{ width: 48, height: 48, border: "1px solid #e2e8f0" }}>
                {authorName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{authorName}</Typography>
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
                placeholder={`${authorName} ơi, bạn đang nghĩ gì thế?`}
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
                  placeholder={`${authorName} ơi, bạn đang nghĩ gì thế?`}
                  value={postContent}
                  onChange={(event) => setPostContent(event.target.value)}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      fontSize: "20px",
                      fontWeight: 700,
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
              <Box
                sx={{
                  position: "relative",
                  mt: 2,
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                }}
              >


                <IconButton
                  onClick={clearSelectedMedia}
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 10,
                    bgcolor: "white",
                    color: "#1e293b",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "#f1f5f9" },
                    width: 32,
                    height: 32,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>

                {/* Rich Media Grid */}
                {(() => {
                  const count = selectedMediaItems.length;

                  const renderPreviewCell = (item: SelectedMediaItem, idx: number, height: string | number) => {
                    const isVideo = item.file.type.startsWith("video/");
                    const isImage = item.file.type.startsWith("image/");
                    const isDoc = !isVideo && !isImage;

                    return (
                      <Box
                        key={item.preview}
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: height,
                          bgcolor: "#111",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {isDoc ? (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: getFileMeta(item.file.name).bg,
                              p: 2,
                              textAlign: "center",
                              gap: 1,
                            }}
                          >
                            <DescriptionIcon sx={{ fontSize: 44, color: getFileMeta(item.file.name).color }} />
                            <Typography noWrap sx={{ width: "100%", fontSize: "0.875rem", fontWeight: 700, color: "#1f2937", px: 1 }}>
                              {item.file.name}
                            </Typography>
                          </Box>
                        ) : isVideo ? (
                          <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                            <Box component="video" src={item.preview} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            {/* Centered Play Button Overlay */}
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
                          </Box>
                        ) : (
                          <Box component="img" src={item.preview} alt={`preview ${idx + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}

                        {/* Plus Overlay */}
                        {count > 5 && idx === 4 && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              bgcolor: "rgba(0,0,0,0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 2,
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
                    return renderPreviewCell(selectedMediaItems[0], 0, "360px");
                  }
                  if (count === 2) {
                    return (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {renderPreviewCell(selectedMediaItems[0], 0, "220px")}
                        {renderPreviewCell(selectedMediaItems[1], 1, "220px")}
                      </Box>
                    );
                  }
                  if (count === 3) {
                    return (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {renderPreviewCell(selectedMediaItems[0], 0, "240px")}
                        <Box sx={{ display: "flex", gap: "4px" }}>
                          <Box sx={{ flex: 1 }}>{renderPreviewCell(selectedMediaItems[1], 1, "160px")}</Box>
                          <Box sx={{ flex: 1 }}>{renderPreviewCell(selectedMediaItems[2], 2, "160px")}</Box>
                        </Box>
                      </Box>
                    );
                  }
                  if (count === 4) {
                    return (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {renderPreviewCell(selectedMediaItems[0], 0, "240px")}
                        <Box sx={{ display: "flex", gap: "4px" }}>
                          <Box sx={{ flex: 1 }}>{renderPreviewCell(selectedMediaItems[1], 1, "140px")}</Box>
                          <Box sx={{ flex: 1 }}>{renderPreviewCell(selectedMediaItems[2], 2, "140px")}</Box>
                          <Box sx={{ flex: 1 }}>{renderPreviewCell(selectedMediaItems[3], 3, "140px")}</Box>
                        </Box>
                      </Box>
                    );
                  }
                  // 5 or more
                  return (
                    <Box sx={{ display: "flex", gap: "4px" }}>
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                        {renderPreviewCell(selectedMediaItems[0], 0, "180px")}
                        {renderPreviewCell(selectedMediaItems[1], 1, "180px")}
                      </Box>
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                        {renderPreviewCell(selectedMediaItems[2], 2, "120px")}
                        {renderPreviewCell(selectedMediaItems[3], 3, "120px")}
                        {renderPreviewCell(selectedMediaItems[4], 4, "120px")}
                      </Box>
                    </Box>
                  );
                })()}
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
              onClick={handleCreatePost}
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
              Đăng
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
