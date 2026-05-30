import { Avatar, Box, CircularProgress, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";
import {
    FriendUser,
    loadAllFriendsService,
    loadFriendOnlineStatusesService,
} from "../../services/FriendService";

export default function ListFriends() {
    const navigate = useNavigate();

    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const socketEvent = useSelector(
        (state: RootState) => state.chat.newMess?.event
    );

    const socketData = useSelector(
        (state: RootState) => state.chat.newMess?.data
    );

    const friendIdsKey = useMemo(() => {
        return friends.map((friend) => friend.userId).join(",");
    }, [friends]);

    useEffect(() => {
        let mounted = true;

        const loadFriends = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await loadAllFriendsService();

                if (mounted) {
                    setFriends(data);
                }
            } catch (err) {
                console.error(err);

                if (mounted) {
                    setError("Không tải được danh sách bạn bè");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void loadFriends();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!friendIdsKey) return;

        let mounted = true;

        const refreshStatuses = async () => {
            try {
                const friendIds = friendIdsKey
                    .split(",")
                    .map(Number)
                    .filter(Boolean);

                const statuses = await loadFriendOnlineStatusesService(friendIds);

                if (!mounted) return;

                setFriends((prev) =>
                    prev.map((friend) => ({
                        ...friend,
                        online: Boolean(statuses[String(friend.userId)]),
                    }))
                );
            } catch (err) {
                console.error(err);
            }
        };

        void refreshStatuses();

        const intervalId = window.setInterval(() => {
            void refreshStatuses();
        }, 10000);

        return () => {
            mounted = false;
            window.clearInterval(intervalId);
        };
    }, [friendIdsKey]);

    useEffect(() => {
        if (
            socketEvent !== SocketEvent.USER_PRESENCE ||
            !socketData ||
            typeof socketData !== "object"
        ) {
            return;
        }

        const presence = socketData as {
            userId?: number;
            online?: boolean;
        };

        if (!presence.userId) return;

        setFriends((prev) =>
            prev.map((friend) =>
                friend.userId === Number(presence.userId)
                    ? { ...friend, online: Boolean(presence.online) }
                    : friend
            )
        );
    }, [socketEvent, socketData]);

    const visibleFriends = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();

        if (!keyword) return friends;

        return friends.filter((friend) =>
            `${friend.fullName ?? ""} ${friend.email ?? ""}`
                .toLowerCase()
                .includes(keyword)
        );
    }, [friends, searchText]);

    const openConversation = (friend: FriendUser) => {
        navigate("/conversation", {
            state: {
                targetUserId: friend.userId,
                fullName: friend.fullName,
                avatar: friend.avatarUrl,
            },
        });
    };

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
            }}
        >
            <TextField
                fullWidth
                placeholder="Tìm kiếm bạn bè"
                variant="outlined"
                size="small"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
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
                {loading && (
                    <Box
                        sx={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 3,
                        }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                )}

                {!loading && error && (
                    <Typography sx={{ px: 1, py: 2, color: "#d32f2f", fontSize: 13 }}>
                        {error}
                    </Typography>
                )}

                {!loading && !error && visibleFriends.length === 0 && (
                    <Typography sx={{ px: 1, py: 2, color: "#8d8fa3", fontSize: 13 }}>
                        Không có bạn bè
                    </Typography>
                )}

                {!loading &&
                    !error &&
                    visibleFriends.map((friend) => (
                        <Box
                            key={friend.userId}
                            onClick={() => openConversation(friend)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                py: 1.5,
                                px: 1,
                                borderRadius: "8px",
                                "&:hover": {
                                    bgcolor: "#f0f2f8",
                                    cursor: "pointer",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    minWidth: 0,
                                }}
                            >
                                <Box sx={{ position: "relative", flexShrink: 0 }}>
                                    <Avatar
                                        src={friend.avatarUrl ?? undefined}
                                        sx={{ width: 45, height: 45 }}
                                    >
                                        {friend.fullName?.charAt(0)?.toUpperCase()}
                                    </Avatar>

                                    <Box
                                        title={friend.online ? "Online" : "Offline"}
                                        sx={{
                                            position: "absolute",
                                            right: -2,
                                            bottom: -2,
                                            width: 14,
                                            height: 14,
                                            borderRadius: "50%",
                                            bgcolor: friend.online ? "#48d26d" : "#a7adba",
                                            border: "2px solid white",
                                        }}
                                    />
                                </Box>

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontSize: 15,
                                            fontWeight: 600,
                                            color: "#1f2a44",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {friend.fullName || friend.email || `User ${friend.userId}`}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            color: friend.online ? "#2fa84f" : "#8d8fa3",
                                            mt: "2px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {friend.online ? "Đang online" : "Offline"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ))}
            </Box>
        </Box>
    );
}