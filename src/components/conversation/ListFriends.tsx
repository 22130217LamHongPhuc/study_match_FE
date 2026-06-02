import SearchIcon from "@mui/icons-material/Search";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { Avatar, Box, CircularProgress, InputAdornment, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";
import { updateCurrentConverId } from "../../redux/ChatReducer";
import { loadConversation, loadGroupConversation } from "../../services/ChatService";
import { FriendUser, loadAllFriendsService, loadFriendOnlineStatusesService } from "../../services/FriendService";
import { getGroupsByUserId, StudyGroupDetailResponse } from "../../services/GroupService";

export default function ListFriends() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [groups, setGroups] = useState<StudyGroupDetailResponse[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const socketEvent = useSelector((state: RootState) => state.chat.newMess?.event);
    const socketData = useSelector((state: RootState) => state.chat.newMess?.data);

    const friendIdsKey = useMemo(() => friends.map((friend) => friend.userId).join(","), [friends]);

    useEffect(() => {
        let mounted = true;

        const loadSidebarData = async () => {
            try {
                setLoading(true);
                setError("");
                const currentUserId = Number(localStorage.getItem("userId"));
                const shouldLoadGroups = Number.isFinite(currentUserId) && currentUserId > 0;
                const [friendResult, groupResult] = await Promise.allSettled([
                    loadAllFriendsService(),
                    shouldLoadGroups
                        ? getGroupsByUserId(currentUserId)
                        : Promise.resolve({ success: false, data: [] as StudyGroupDetailResponse[] }),
                ]);

                if (!mounted) return;

                if (friendResult.status === "fulfilled") {
                    setFriends(friendResult.value);
                } else {
                    console.error(friendResult.reason);
                    setFriends([]);
                }

                if (groupResult.status === "fulfilled") {
                    const groupResponse = groupResult.value;
                    setGroups(groupResponse.success && Array.isArray(groupResponse.data) ? groupResponse.data : []);
                } else {
                    console.warn("Cannot load groups for conversation sidebar", groupResult.reason);
                    setGroups([]);
                }

                if (friendResult.status === "rejected" && groupResult.status === "rejected") {
                    setError("KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch báº¡n bÃ¨ vÃ  nhÃ³m");
                }
            } catch (err) {
                console.error(err);
                if (mounted) {
                    setError("Không tải được danh sách bạn bè và nhóm");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadSidebarData();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!friendIdsKey) return;
        let mounted = true;

        const refreshStatuses = async () => {
            try {
                const friendIds = friendIdsKey.split(",").map(Number).filter(Boolean);
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
        const intervalId = window.setInterval(() => void refreshStatuses(), 10000);
        return () => {
            mounted = false;
            window.clearInterval(intervalId);
        };
    }, [friendIdsKey]);

    useEffect(() => {
        if (socketEvent !== SocketEvent.USER_PRESENCE || !socketData || typeof socketData !== "object") {
            return;
        }
        const presence = socketData as { userId?: number; online?: boolean };
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
            `${friend.fullName ?? ""} ${friend.email ?? ""}`.toLowerCase().includes(keyword)
        );
    }, [friends, searchText]);

    const visibleGroups = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) return groups;
        return groups.filter((group) =>
            `${group.name ?? ""} ${group.subjectName ?? ""}`.toLowerCase().includes(keyword)
        );
    }, [groups, searchText]);

    const openConversation = (friend: FriendUser) => {
        const currentUserId = Number(localStorage.getItem("userId"));
        if (Number.isFinite(currentUserId)) {
            void loadConversation(currentUserId, friend.userId, 0)
                .then((response) => {
                    const conversationId = response?.data?.conversationId;
                    if (conversationId) {
                        dispatch(updateCurrentConverId({ currentConversationId: Number(conversationId) }));
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    navigate("/conversation", {
                        state: {
                            conversationKind: "PRIVATE",
                            targetUserId: friend.userId,
                            fullName: friend.fullName,
                            avatar: friend.avatarUrl,
                        },
                    });
                });
            return;
        }

        navigate("/conversation", {
            state: {
                conversationKind: "PRIVATE",
                targetUserId: friend.userId,
                fullName: friend.fullName,
                avatar: friend.avatarUrl,
            },
        });
    };

    const openGroupConversation = async (group: StudyGroupDetailResponse) => {
        const currentUserId = Number(localStorage.getItem("userId"));
        try {
            if (Number.isFinite(currentUserId)) {
                const response = await loadGroupConversation(currentUserId, group.id, 0);
                const conversationId = response?.data?.conversationId;
                if (conversationId) {
                    dispatch(updateCurrentConverId({ currentConversationId: Number(conversationId) }));
                }
            }
        } catch (error) {
            console.error(error);
        }

        navigate("/conversation", {
            state: {
                conversationKind: "GROUP",
                groupId: group.id,
                groupName: group.name,
                conversationType: 0,
                targetUserId: null,
                fullName: null,
                avatar: null,
            },
        });
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Box sx={{ px: 1, mb: 2, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm bạn bè"
                    variant="outlined"
                    size="small"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#7f8aa0", fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        maxWidth: 360,
                        "& .MuiOutlinedInput-root": {
                            height: 50,
                            borderRadius: "16px",
                            bgcolor: "#ffffff",
                            border: "1px solid #d2dbea",
                            boxShadow: "0 2px 8px rgba(31,42,68,0.05)",
                            transition: "all 0.2s ease",
                            "& fieldset": { border: "none" },
                            "&:hover": { borderColor: "#b9c6dd", boxShadow: "0 3px 10px rgba(31,42,68,0.08)" },
                            "&.Mui-focused": { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.16)" },
                        },
                        "& .MuiOutlinedInput-input": { py: 0, px: 0, fontSize: 16, color: "#1f2a44" },
                        "& .MuiOutlinedInput-input::placeholder": { color: "#9aa3b2", opacity: 1 },
                    }}
                />
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                {loading && (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {!loading && error && (
                    <Typography sx={{ px: 1, py: 2, color: "#d32f2f", fontSize: 13 }}>{error}</Typography>
                )}

                {!loading && !error && visibleFriends.length === 0 && visibleGroups.length === 0 && (
                    <Typography sx={{ px: 1, py: 2, color: "#8d8fa3", fontSize: 13 }}>
                        Không có bạn bè hoặc nhóm
                    </Typography>
                )}

                {!loading && !error && visibleFriends.map((friend) => (
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
                            "&:hover": { bgcolor: "#f0f2f8", cursor: "pointer" },
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                            <Box sx={{ position: "relative", flexShrink: 0 }}>
                                <Avatar src={friend.avatarUrl ?? undefined} sx={{ width: 45, height: 45 }}>
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
                                <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1f2a44", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {friend.fullName || friend.email || `User ${friend.userId}`}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: friend.online ? "#2fa84f" : "#8d8fa3", mt: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {friend.online ? "Đang online" : "Offline"}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}

                {!loading && !error && visibleGroups.length > 0 && (
                    <Typography sx={{ px: 1, pt: 2, pb: 1, color: "#5f6780", fontSize: 12, fontWeight: 700 }}>
                        Nhóm của bạn
                    </Typography>
                )}

                {!loading && !error && visibleGroups.map((group) => (
                    <Box
                        key={`group-${group.id}`}
                        onClick={() => void openGroupConversation(group)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 1.5,
                            px: 1,
                            borderRadius: "8px",
                            "&:hover": { bgcolor: "#f0f2f8", cursor: "pointer" },
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                            <Avatar sx={{ width: 45, height: 45, bgcolor: "#3b82f6" }}>
                                <GroupsRoundedIcon sx={{ fontSize: 22 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1f2a44", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {group.name || `Nhóm ${group.id}`}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: "#8d8fa3", mt: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {group.subjectName || "Nhóm học"}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
