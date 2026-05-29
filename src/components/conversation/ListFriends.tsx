import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Avatar,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import {
  FriendListItem,
  getFriendsListService,
} from "../../services/FriendService";

export default function ListFriends() {
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFriends = async () => {
      try {
        const response = await getFriendsListService();
        if (isMounted) {
          setFriends(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        if (isMounted) {
          setFriends([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFriends();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFriends = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return friends;
    }

    return friends.filter((friend) =>
      friend.full_name.toLowerCase().includes(keyword),
    );
  }, [friends, searchTerm]);

  return (
    <Box
      sx={{
        width: "25%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: "10px",
        overflow: "hidden",
        borderLeft: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: "10px",
          mb: 2,
          flexShrink: 0,
        }}
      >
        <ArrowForwardIcon sx={{ color: "#8d8fa3" }} />
        <Typography sx={{ fontWeight: 700 }}>Bạn bè</Typography>
        <Box sx={{ width: 24 }} />
      </Box>

      <TextField
        fullWidth
        placeholder="Tìm kiếm bạn bè"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        variant="outlined"
        size="small"
        sx={{
          mb: 2,
          flexShrink: 0,
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            bgcolor: "#f4f6fb",
          },
          "& .MuiOutlinedInput-input": {
            padding: "10px",
          },
        }}
      />

      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : filteredFriends.length === 0 ? (
          <Box
            sx={{
              py: 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ color: "#8d8fa3", fontSize: 14 }}>
              Chưa có bạn bè
            </Typography>
          </Box>
        ) : (
          filteredFriends.map((friend) => (
            <Box
              key={friend.user_id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1.5,
                px: 1,
                borderRadius: "14px",
                "&:hover": {
                  bgcolor: "#f0f2f8",
                  cursor: "pointer",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  src={friend.avatar_url ?? undefined}
                  sx={{ width: 45, height: 45 }}
                />
                <Box>
                  <Typography
                    sx={{ fontSize: 15, fontWeight: 600, color: "#1f2a44" }}
                  >
                    {friend.full_name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#8d8fa3",
                      mt: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "160px",
                    }}
                  >
                    Bạn bè
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
