import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tabs,
  Tab,
  Box,
  Avatar,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckIcon from "@mui/icons-material/Check";
import { loadPostReactions, PostReactionUser } from "../../../services/SocialPostService";
import { requestFriendService } from "../../../services/FriendService";
import { useNavigate } from "react-router-dom";

type PostReactionsModalProps = {
  open: boolean;
  onClose: () => void;
  postId: number;
  currentUserId: number;
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

export default function PostReactionsModal({
  open,
  onClose,
  postId,
  currentUserId,
}: PostReactionsModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reactions, setReactions] = useState<PostReactionUser[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [sentRequests, setSentRequests] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (open && postId) {
      void fetchReactions();
    }
  }, [open, postId]);

  const fetchReactions = async () => {
    setLoading(true);
    try {
      const data = await loadPostReactions(postId, currentUserId);
      setReactions(data);
    } catch (e) {
      console.error("Failed to load post reactions", e);
    } finally {
      setLoading(false);
    }
  };

  // Group reactions by type
  const reactionGroups = React.useMemo(() => {
    const groups: Record<string, PostReactionUser[]> = {};
    reactions.forEach((r) => {
      const type = r.reactionType.toUpperCase();
      if (!groups[type]) groups[type] = [];
      groups[type].push(r);
    });
    return groups;
  }, [reactions]);

  // Tab configurations
  const tabConfigs = React.useMemo(() => {
    const configs = [{ label: "Tất cả", count: reactions.length, users: reactions }];
    Object.entries(reactionGroups).forEach(([type, users]) => {
      configs.push({
        label: `${getReactionEmoji(type)} ${users.length}`,
        count: users.length,
        users,
      });
    });
    return configs;
  }, [reactions, reactionGroups]);

  const handleAddFriend = async (targetUserId: number) => {
    try {
      await requestFriendService(targetUserId);
      setSentRequests((prev) => ({ ...prev, [targetUserId]: true }));
    } catch (e) {
      console.error("Failed to send friend request", e);
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const activeUsers = tabConfigs[activeTab]?.users || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1.5,
          minHeight: "400px",
          maxHeight: "600px",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5 }}>
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: "1px solid #e2e8f0",
              minHeight: "auto",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "14px",
                minWidth: "auto",
                px: 2,
                py: 1,
              },
            }}
          >
            {tabConfigs.map((tab, idx) => (
              <Tab key={idx} label={tab.label} />
            ))}
          </Tabs>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#64748b",
            bgcolor: "#f1f5f9",
            ml: 2,
            "&:hover": { bgcolor: "#e2e8f0" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 1.5, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : activeUsers.length === 0 ? (
          <Typography sx={{ color: "#64748b", textAlign: "center", py: 8, fontSize: "14px" }}>
            Không có lượt tương tác nào
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {activeUsers.map((user) => {
              const isOwn = user.userId === currentUserId;
              const hasSent = sentRequests[user.userId];
              
              return (
                <Box
                  key={user.userId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "4px 8px",
                  }}
                >
                  <Box
                    onClick={() => handleUserClick(user.userId)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar src={user.avatarUrl || undefined} sx={{ width: 44, height: 44, border: "1px solid #e2e8f0" }}>
                        {user.fullName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: "white",
                          boxShadow: "0 1px-3px rgba(0,0,0,0.15)",
                          fontSize: "12px",
                          zIndex: 2,
                        }}
                      >
                        {getReactionEmoji(user.reactionType)}
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", "&:hover": { textDecoration: "underline" } }}>
                        {user.fullName}
                      </Typography>
                      {user.mutualFriends > 0 && (
                        <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>
                          {user.mutualFriends} bạn chung
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
