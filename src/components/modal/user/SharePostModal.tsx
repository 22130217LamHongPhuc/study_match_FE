import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { sharePost, SocialPost } from "../../../services/SocialPostService";
import { parsePostContent, POST_BACKGROUNDS } from "./CreatePostDialog";

interface SharePostModalProps {
  open: boolean;
  onClose: () => void;
  post: SocialPost;
  currentUserId: number;
  authorName?: string;
  authorAvatarUrl?: string | null;
  onPostShared: (newPost: SocialPost) => void;
}

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Công khai", icon: <PublicIcon sx={{ fontSize: 16 }} /> },
  { value: "FRIENDS", label: "Bạn bè", icon: <PeopleIcon sx={{ fontSize: 16 }} /> },
  { value: "PRIVATE", label: "Riêng tư", icon: <LockIcon sx={{ fontSize: 16 }} /> },
];

const PostPreviewCard = ({ post }: { post: SocialPost }) => {
  const { backgroundId, content: parsedContent } = parsePostContent(post.content ?? "");
  const hasBg = backgroundId !== "none";
  const bg = POST_BACKGROUNDS.find((b) => b.id === backgroundId);
  const mediaCount = (post.media ?? []).length;

  return (
    <Box
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        bgcolor: "white",
        mt: 1.5,
      }}
    >
      {/* Author row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, pt: 1.5, pb: 1 }}>
        <Avatar src={post.authorAvatarUrl || undefined} sx={{ width: 36, height: 36 }}>
          {post.authorName?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
            {post.authorName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
            {post.visibility === "PUBLIC" ? "Công khai" : post.visibility === "FRIENDS" ? "Bạn bè" : "Riêng tư"}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      {hasBg ? (
        <Box
          sx={{
            mx: 2,
            mb: 1,
            borderRadius: "8px",
            minHeight: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: bg?.style.background,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 16,
              color: bg?.style.color || "white",
              textAlign: "center",
              p: 1.5,
            }}
          >
            {parsedContent}
          </Typography>
        </Box>
      ) : parsedContent ? (
        <Typography
          sx={{
            px: 2,
            pb: 1,
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {parsedContent}
        </Typography>
      ) : null}

      {/* Media grid preview */}
      {mediaCount > 0 && (
        <Box sx={{ position: "relative", mx: 2, mb: 1.5, borderRadius: "8px", overflow: "hidden" }}>
          {mediaCount === 1 ? (
            <Box
              sx={{
                height: "160px",
                bgcolor: "#111",
                backgroundImage: post.media[0].mediaType === "IMAGE" ? `url(${post.media[0].mediaUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {post.media[0].mediaType === "VIDEO" && (
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "20px", marginLeft: "3px" }}>▶</span>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: "2px", height: "120px" }}>
              {post.media.slice(0, Math.min(mediaCount, 3)).map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    bgcolor: "#111",
                    backgroundImage: m.mediaType === "IMAGE" ? `url(${m.mediaUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {m.mediaType === "VIDEO" && (
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "12px", marginLeft: "2px" }}>▶</span>
                    </Box>
                  )}
                  {i === 2 && mediaCount > 3 && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ color: "white", fontWeight: 700, fontSize: 20 }}>
                        +{mediaCount - 3}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default function SharePostModal({
  open,
  onClose,
  post,
  currentUserId,
  authorName = "Người dùng",
  authorAvatarUrl,
  onPostShared,
}: SharePostModalProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [sharing, setSharing] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const selectedOption = VISIBILITY_OPTIONS.find((v) => v.value === visibility)!;

  const handleShare = async () => {
    setSharing(true);
    try {
      const newPost = await sharePost(
        post.id,
        { authorId: currentUserId, content: content.trim() || undefined, visibility },
        currentUserId,
      );
      onPostShared(newPost);
      setContent("");
      setVisibility("PUBLIC");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Không thể chia sẻ bài viết. Vui lòng thử lại.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!sharing ? onClose : undefined}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          maxWidth: 540,
          width: "95%",
          overflow: "visible",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: 800,
          py: 2,
          color: "#0f172a",
          position: "relative",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        Chia sẻ
        <IconButton
          onClick={onClose}
          disabled={sharing}
          sx={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "#f1f5f9",
            "&:hover": { bgcolor: "#e2e8f0" },
          }}
          size="small"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        {/* Author row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Avatar src={authorAvatarUrl || undefined} sx={{ width: 44, height: 44, border: "1px solid #e2e8f0" }}>
            {authorName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#0f172a", lineHeight: 1.2 }}>
              {authorName}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, mt: 0.5 }}>
              {/* Destination chip (Feed) */}
              <Chip
                label="Bảng feed"
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: 12,
                  height: 26,
                  borderRadius: "8px",
                }}
              />
              {/* Visibility selector */}
              <Chip
                label={selectedOption.label}
                icon={selectedOption.icon as React.ReactElement}
                deleteIcon={<KeyboardArrowDownIcon sx={{ fontSize: "16px !important" }} />}
                onDelete={(e) => setMenuAnchor(e.currentTarget as HTMLElement)}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: 12,
                  height: 26,
                  borderRadius: "8px",
                  cursor: "pointer",
                  "& .MuiChip-icon": { color: "#475569", ml: "6px" },
                  "& .MuiChip-deleteIcon": { color: "#475569" },
                }}
              />
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } }}
              >
                {VISIBILITY_OPTIONS.map((opt) => (
                  <MenuItem
                    key={opt.value}
                    selected={opt.value === visibility}
                    onClick={() => {
                      setVisibility(opt.value);
                      setMenuAnchor(null);
                    }}
                    sx={{ gap: 1, fontSize: 14, fontWeight: 600 }}
                  >
                    {opt.icon}
                    {opt.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Box>

        {/* Comment input */}
        <Box sx={{ mt: 1.5, position: "relative" }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Hãy nói gì đó về nội dung này..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="standard"
            disabled={sharing}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: 15, color: "#1e293b", lineHeight: 1.5 },
            }}
          />
          <Box sx={{ position: "absolute", right: 0, bottom: 0 }}>
            <EmojiEmotionsOutlinedIcon sx={{ fontSize: 22, color: "#94a3b8" }} />
          </Box>
        </Box>

        {/* Shared post preview */}
        <PostPreviewCard post={post} />

        <Divider sx={{ my: 2 }} />

        {/* Share button */}
        <Button
          fullWidth
          variant="contained"
          disabled={sharing}
          onClick={handleShare}
          sx={{
            borderRadius: "8px",
            bgcolor: "#1877f2",
            fontWeight: 700,
            fontSize: 15,
            py: 1.1,
            textTransform: "none",
            boxShadow: "0 2px 8px rgba(24,119,242,0.3)",
            "&:hover": { bgcolor: "#166fe5" },
            "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
          }}
        >
          {sharing ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} sx={{ color: "#94a3b8" }} />
              Đang chia sẻ...
            </Box>
          ) : (
            "Chia sẻ ngay"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
