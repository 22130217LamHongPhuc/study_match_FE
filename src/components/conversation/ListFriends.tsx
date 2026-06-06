import SearchIcon from "@mui/icons-material/Search";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import MarkEmailUnreadRoundedIcon from "@mui/icons-material/MarkEmailUnreadRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { Avatar, Badge, Box, Button, CircularProgress, InputAdornment, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";
import { updateCurrentConverId } from "../../redux/ChatReducer";
import { loadAcceptedDirectConversations, loadConversation, loadGroupConversation, loadMessageRequests, MessageRequestItem } from "../../services/ChatService";
import { FriendUser, loadAllFriendsService, loadFriendOnlineStatusesService, loadFriendProfilesService } from "../../services/FriendService";
import { getGroupsByUserId, StudyGroupDetailResponse } from "../../services/GroupService";

const getLastMessageTime = (conversation: MessageRequestItem) => {
    const time = conversation.lastMessage?.createdAt
        ? new Date(conversation.lastMessage.createdAt).getTime()
        : 0;
    return Number.isFinite(time) ? time : 0;
};

const sortByLatestMessage = <T extends MessageRequestItem>(conversations: T[]) => {
    return [...conversations].sort((a, b) => getLastMessageTime(b) - getLastMessageTime(a));
};

export default function ListFriends() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [groups, setGroups] = useState<StudyGroupDetailResponse[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [messageRequests, setMessageRequests] = useState<MessageRequestItem[]>([]);
    const [requestProfiles, setRequestProfiles] = useState<Record<number, FriendUser>>({});
    const [acceptedDirectConversations, setAcceptedDirectConversations] = useState<MessageRequestItem[]>([]);
    const [directProfiles, setDirectProfiles] = useState<Record<number, FriendUser>>({});
    const [requestLoading, setRequestLoading] = useState(false);
    const [activeView, setActiveView] = useState<"main" | "requests">("main");
    const [error, setError] = useState("");

    const socketEvent = useSelector((state: RootState) => state.chat.newMess?.event);
    const socketData = useSelector((state: RootState) => state.chat.newMess?.data);

    const friendIdsKey = useMemo(() => friends.map((friend) => friend.userId).join(","), [friends]);

    useEffect(() => {
        let mounted = true;

        const loadProfilesByRequests = async (
            requests: MessageRequestItem[],
            setter: React.Dispatch<React.SetStateAction<Record<number, FriendUser>>>
        ) => {
            const otherUserIds = Array.from(new Set(
                requests
                    .map((request) => Number(request.otherUserId))
                    .filter((userId) => Number.isFinite(userId) && userId > 0)
            ));
            if (otherUserIds.length === 0) {
                setter({});
                return;
            }

            const profiles = await loadFriendProfilesService(otherUserIds);
            if (!mounted) return;
            setter(profiles.reduce<Record<number, FriendUser>>((acc, profile) => {
                acc[profile.userId] = profile;
                return acc;
            }, {}));
        };

        const loadPendingRequests = async (currentUserId: number) => {
            setRequestLoading(true);
            try {
                const [requests, acceptedDirect] = await Promise.all([
                    loadMessageRequests(currentUserId),
                    loadAcceptedDirectConversations(currentUserId),
                ]);
                if (!mounted) return;

                setMessageRequests(requests);
                setAcceptedDirectConversations(acceptedDirect);
                await Promise.all([
                    loadProfilesByRequests(requests, setRequestProfiles),
                    loadProfilesByRequests(acceptedDirect, setDirectProfiles),
                ]);
            } catch (err) {
                console.error(err);
                if (mounted) {
                    setMessageRequests([]);
                    setRequestProfiles({});
                    setAcceptedDirectConversations([]);
                    setDirectProfiles({});
                }
            } finally {
                if (mounted) setRequestLoading(false);
            }
        };

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

                if (shouldLoadGroups) {
                    void loadPendingRequests(currentUserId);
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

    useEffect(() => {
        if (socketEvent !== SocketEvent.NEW_MESSAGE && socketEvent !== SocketEvent.MESSAGE_ACK) {
            return;
        }

        const currentUserId = Number(localStorage.getItem("userId"));
        if (!Number.isFinite(currentUserId) || currentUserId <= 0) return;
        let mounted = true;

        const loadProfilesByRequests = async (
            requests: MessageRequestItem[],
            setter: React.Dispatch<React.SetStateAction<Record<number, FriendUser>>>
        ) => {
            const otherUserIds = Array.from(new Set(
                requests
                    .map((request) => Number(request.otherUserId))
                    .filter((userId) => Number.isFinite(userId) && userId > 0)
            ));
            if (otherUserIds.length === 0) {
                setter({});
                return;
            }

            const profiles = await loadFriendProfilesService(otherUserIds);
            if (!mounted) return;
            setter(profiles.reduce<Record<number, FriendUser>>((acc, profile) => {
                acc[profile.userId] = profile;
                return acc;
            }, {}));
        };

        const refreshMessageRequests = async () => {
            try {
                const [requests, acceptedDirect] = await Promise.all([
                    loadMessageRequests(currentUserId),
                    loadAcceptedDirectConversations(currentUserId),
                ]);
                if (!mounted) return;
                setMessageRequests(requests);
                setAcceptedDirectConversations(acceptedDirect);

                await Promise.all([
                    loadProfilesByRequests(requests, setRequestProfiles),
                    loadProfilesByRequests(acceptedDirect, setDirectProfiles),
                ]);
            } catch (err) {
                console.error(err);
            }
        };

        void refreshMessageRequests();
        return () => {
            mounted = false;
        };
    }, [socketEvent]);

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

    const visibleMessageRequests = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        const requests = messageRequests.map((request) => {
            const profile = requestProfiles[request.otherUserId];
            return {
                ...request,
                profile,
                displayName: profile?.fullName || profile?.email || `User ${request.otherUserId}`,
            };
        });
        const filteredRequests = keyword
            ? requests.filter((request) =>
            `${request.displayName} ${request.profile?.email ?? ""} ${request.lastMessage?.content ?? ""}`.toLowerCase().includes(keyword)
            )
            : requests;
        return sortByLatestMessage(filteredRequests);
    }, [messageRequests, requestProfiles, searchText]);

    const visibleAcceptedDirectConversations = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        const conversations = acceptedDirectConversations.map((conversation) => {
            const profile = directProfiles[conversation.otherUserId];
            return {
                ...conversation,
                profile,
                displayName: profile?.fullName || profile?.email || `User ${conversation.otherUserId}`,
            };
        });
        const filteredConversations = keyword
            ? conversations.filter((conversation) =>
            `${conversation.displayName} ${conversation.profile?.email ?? ""} ${conversation.lastMessage?.content ?? ""}`.toLowerCase().includes(keyword)
            )
            : conversations;
        return sortByLatestMessage(filteredConversations);
    }, [acceptedDirectConversations, directProfiles, searchText]);

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

    const openMessageRequest = (request: MessageRequestItem) => {
        const profile = requestProfiles[request.otherUserId];
        dispatch(updateCurrentConverId({ currentConversationId: Number(request.conversationId) }));
        navigate("/conversation", {
            state: {
                conversationKind: "PRIVATE",
                targetUserId: request.otherUserId,
                fullName: profile?.fullName || `User ${request.otherUserId}`,
                avatar: profile?.avatarUrl || null,
            },
        });
    };

    const openAcceptedDirectConversation = (conversation: MessageRequestItem) => {
        const profile = directProfiles[conversation.otherUserId];
        dispatch(updateCurrentConverId({ currentConversationId: Number(conversation.conversationId) }));
        navigate("/conversation", {
            state: {
                conversationKind: "PRIVATE",
                targetUserId: conversation.otherUserId,
                fullName: profile?.fullName || `User ${conversation.otherUserId}`,
                avatar: profile?.avatarUrl || null,
            },
        });
    };

    const formatCallPreview = (lastMessage: NonNullable<MessageRequestItem["lastMessage"]>) => {
        const callType = lastMessage.type === "CALL_AUDIO" ? "thoại" : "video";
        let detail: { status?: string; durationSeconds?: number } = {};

        try {
            detail = lastMessage.content ? JSON.parse(lastMessage.content) : {};
        } catch {
            detail = {};
        }

        if (detail.status === "MISSED") {
            return `Đã nhỡ cuộc gọi ${callType}`;
        }

        const duration = Math.max(0, Number(detail.durationSeconds || 0));
        const durationText = duration < 60 ? `${duration} giây` : `${Math.ceil(duration / 60)} phút`;
        return `Cuộc gọi ${callType} · ${durationText}`;
    };

    const getLastMessagePreview = (request: MessageRequestItem) => {
        const lastMessage = request.lastMessage;
        if (!lastMessage) return "Tin nhắn mới";
        if (lastMessage.isDeleted) return "Tin nhắn đã được thu hồi";
        if (lastMessage.type === "CALL_AUDIO" || lastMessage.type === "CALL_VIDEO") {
            return formatCallPreview(lastMessage);
        }
        if (lastMessage.content) return lastMessage.content;
        if (lastMessage.type?.startsWith("image/")) return "Đã gửi một ảnh";
        if (lastMessage.type?.startsWith("video/")) return "Đã gửi một video";
        return "Đã gửi một tệp";
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

            <Box sx={{ px: 1, mb: 1.5, display: "flex", gap: 1, flexShrink: 0 }}>
                <Button
                    fullWidth
                    size="small"
                    variant={activeView === "main" ? "contained" : "outlined"}
                    startIcon={<PeopleAltRoundedIcon />}
                    onClick={() => setActiveView("main")}
                    sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                >
                    Bạn bè
                </Button>
                <Badge
                    color="error"
                    badgeContent={messageRequests.length}
                    overlap="rectangular"
                    sx={{ flex: 1, "& .MuiBadge-badge": { right: 8, top: 4 } }}
                >
                    <Button
                        fullWidth
                        size="small"
                        variant={activeView === "requests" ? "contained" : "outlined"}
                        startIcon={<MarkEmailUnreadRoundedIcon />}
                        onClick={() => setActiveView("requests")}
                        sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                        Tin nhắn chờ
                    </Button>
                </Badge>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                {(activeView === "main" ? loading : requestLoading) && (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {activeView === "main" && !loading && error && (
                    <Typography sx={{ px: 1, py: 2, color: "#d32f2f", fontSize: 13 }}>{error}</Typography>
                )}

                {activeView === "requests" && !requestLoading && visibleMessageRequests.length === 0 && (
                    <Typography sx={{ px: 1, py: 2, color: "#8d8fa3", fontSize: 13 }}>
                        Không có tin nhắn đang chờ
                    </Typography>
                )}

                {activeView === "requests" && !requestLoading && visibleMessageRequests.map((request) => (
                    <Box
                        key={`request-${request.conversationId}`}
                        onClick={() => openMessageRequest(request)}
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
                            <Avatar src={request.profile?.avatarUrl ?? undefined} sx={{ width: 45, height: 45 }}>
                                {request.displayName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1f2a44", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {request.displayName}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: "#8d8fa3", mt: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {getLastMessagePreview(request)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}

                {activeView === "main" && !loading && !error && visibleAcceptedDirectConversations.length === 0 && visibleFriends.length === 0 && visibleGroups.length === 0 && (
                    <Typography sx={{ px: 1, py: 2, color: "#8d8fa3", fontSize: 13 }}>
                        Không có bạn bè hoặc nhóm
                    </Typography>
                )}

                {activeView === "main" && !loading && !error && visibleAcceptedDirectConversations.map((conversation) => (
                    <Box
                        key={`direct-${conversation.conversationId}`}
                        onClick={() => openAcceptedDirectConversation(conversation)}
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
                            <Avatar src={conversation.profile?.avatarUrl ?? undefined} sx={{ width: 45, height: 45 }}>
                                {conversation.displayName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1f2a44", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {conversation.displayName}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: "#8d8fa3", mt: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {getLastMessagePreview(conversation)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}

                {activeView === "main" && !loading && !error && visibleFriends.map((friend) => (
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

                {activeView === "main" && !loading && !error && visibleGroups.length > 0 && (
                    <Typography sx={{ px: 1, pt: 2, pb: 1, color: "#5f6780", fontSize: 12, fontWeight: 700 }}>
                        Nhóm của bạn
                    </Typography>
                )}

                {activeView === "main" && !loading && !error && visibleGroups.map((group) => (
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
