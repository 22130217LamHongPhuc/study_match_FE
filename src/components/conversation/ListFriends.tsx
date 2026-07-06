import SearchIcon from "@mui/icons-material/Search";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import MarkEmailUnreadRoundedIcon from "@mui/icons-material/MarkEmailUnreadRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { Avatar, Badge, Box, Button, CircularProgress, InputAdornment, Skeleton, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";
import { updateCurrentConverId, setUnreads, upsertGroupMemberProfiles } from "../../redux/ChatReducer";
import { loadAcceptedDirectConversations, loadConversation, loadGroupConversation, loadGroupConversationPins, loadMessageRequests, MessageRequestItem } from "../../services/ChatService";
import { FriendUser, loadAllFriendsService, loadFriendOnlineStatusesService, loadFriendProfilesService } from "../../services/FriendService";
import { getGroupsByUserId, StudyGroupDetailResponse } from "../../services/GroupService";

type GroupConversationItem = StudyGroupDetailResponse & {
    conversationId?: number | null;
    isPinned?: boolean;
    lastMessage?: any;
};

const getLastMessageTime = (conversation: MessageRequestItem) => {
    const time = conversation.lastMessage?.createdAt
        ? new Date(conversation.lastMessage.createdAt).getTime()
        : 0;
    return Number.isFinite(time) ? time : 0;
};

const sortByLatestMessage = <T extends MessageRequestItem>(conversations: T[]) => {
    return [...conversations].sort((a, b) => getLastMessageTime(b) - getLastMessageTime(a));
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

const getLastMessagePreview = (
    request: any,
    isGroup = false,
    currentUserId?: number,
    groupMemberProfiles?: any
) => {
    const lastMessage = request.lastMessage;
    if (!lastMessage) return "Tin nhắn mới";
    if (lastMessage.isDeleted) return "Tin nhắn đã được thu hồi";

    let prefix = "";
    const effectiveUserId = currentUserId ?? Number(localStorage.getItem("userId"));

    if (isGroup && lastMessage.senderId) {
        if (Number(lastMessage.senderId) === effectiveUserId) {
            prefix = "Bạn: ";
        } else {
            const senderId = Number(lastMessage.senderId);
            const memberProfile = groupMemberProfiles?.[senderId];
            const senderName = memberProfile?.fullName || memberProfile?.username || `User ${senderId}`;
            prefix = `${senderName}: `;
        }
    } else if (!isGroup && lastMessage.senderId) {
        if (Number(lastMessage.senderId) === effectiveUserId) {
            prefix = "Bạn: ";
        }
    }

    let body = "";
    if (lastMessage.type === "CALL_AUDIO" || lastMessage.type === "CALL_VIDEO") {
        body = formatCallPreview(lastMessage);
    } else if (lastMessage.content) {
        body = lastMessage.content;
    } else if (lastMessage.type?.startsWith("image/")) {
        body = "Đã gửi một ảnh";
    } else if (lastMessage.type?.startsWith("video/")) {
        body = "Đã gửi một video";
    } else if (lastMessage.type?.startsWith("audio/")) {
        body = "Đã gửi một âm thanh";
    } else {
        body = "Đã gửi một tệp";
    }
    return prefix + body;
};

const SidebarSkeleton = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: 0.5 }}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
            <Box
                key={item}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1.5,
                    px: 1,
                    borderRadius: "8px",
                }}
            >
                <Skeleton
                    variant="circular"
                    width={45}
                    height={45}
                    animation="wave"
                    sx={{ bgcolor: "rgba(15, 23, 42, 0.06)", flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton
                        variant="rectangular"
                        width="70%"
                        height={16}
                        animation="wave"
                        sx={{ borderRadius: "4px", bgcolor: "rgba(15, 23, 42, 0.06)", mb: 1 }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width="50%"
                        height={12}
                        animation="wave"
                        sx={{ borderRadius: "4px", bgcolor: "rgba(15, 23, 42, 0.04)" }}
                    />
                </Box>
            </Box>
        ))}
    </Box>
);

export default function ListFriends() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [groups, setGroups] = useState<GroupConversationItem[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [messageRequests, setMessageRequests] = useState<MessageRequestItem[]>([]);
    const [requestProfiles, setRequestProfiles] = useState<Record<number, FriendUser>>({});
    const [acceptedDirectConversations, setAcceptedDirectConversations] = useState<MessageRequestItem[]>([]);
    const [directProfiles, setDirectProfiles] = useState<Record<number, FriendUser>>({});
    const [requestLoading, setRequestLoading] = useState(false);
    const [activeView, setActiveView] = useState<"main" | "requests">("main");
    const [error, setError] = useState("");
    const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);

    const socketEvent = useSelector((state: RootState) => state.chat.newMess?.event);
    const socketData = useSelector((state: RootState) => state.chat.newMess?.data);
    const unreadByConversation = useSelector((state: RootState) => state.chat.unreadByConversation) ?? {};
    const groupMemberProfiles = useSelector((state: RootState) => state.chat.groupMemberProfiles) ?? {};

    const currentUserId = Number(localStorage.getItem("userId"));
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

        const loadPendingRequests = async (currentUserId: number, finalGroups: GroupConversationItem[] = []) => {
            setRequestLoading(true);
            try {
                const [requests, acceptedDirect] = await Promise.all([
                    loadMessageRequests(currentUserId),
                    loadAcceptedDirectConversations(currentUserId),
                ]);
                if (!mounted) return;

                setMessageRequests(requests);
                setAcceptedDirectConversations(acceptedDirect);

                const unreads: Record<number, number> = {};
                acceptedDirect.forEach((c) => {
                    if (c.conversationId && typeof c.unreadCount === "number") {
                        unreads[c.conversationId] = c.unreadCount;
                    }
                });
                requests.forEach((r) => {
                    if (r.conversationId && typeof r.unreadCount === "number") {
                        unreads[r.conversationId] = r.unreadCount;
                    }
                });
                finalGroups.forEach((g) => {
                    if (g.conversationId && typeof (g as any).unreadCount === "number") {
                        unreads[g.conversationId] = (g as any).unreadCount;
                    }
                });
                if (Object.keys(unreads).length > 0) {
                    dispatch(setUnreads(unreads));
                }

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

                let finalGroups: GroupConversationItem[] = [];
                if (groupResult.status === "fulfilled") {
                    const groupResponse = groupResult.value;
                    const loadedGroups = groupResponse.success && Array.isArray(groupResponse.data)
                        ? groupResponse.data
                        : [];
                    if (loadedGroups.length > 0 && shouldLoadGroups) {
                        const pins = await loadGroupConversationPins(
                            currentUserId,
                            loadedGroups.map((group) => group.id),
                        );
                        const pinByGroupId = new Map<number, any>(pins.map((pin: any) => [pin.groupId, pin]));
                        finalGroups = loadedGroups.map((group) => {
                            const pin = pinByGroupId.get(group.id);
                            return {
                                ...group,
                                conversationId: pin?.conversationId ?? null,
                                isPinned: Boolean(pin?.pinned),
                                lastMessage: pin?.lastMessage ?? null,
                                unreadCount: pin?.unreadCount ?? 0,
                            };
                        });
                        setGroups(finalGroups);

                        // Fetch sender profiles of group last messages to prevent displaying "User X"
                        const lastMessageSenderIds = finalGroups
                            .map((g) => g.lastMessage?.senderId)
                            .filter(Boolean)
                            .map(Number);
                        const uniqueSenderIds = Array.from(new Set(lastMessageSenderIds));
                        if (uniqueSenderIds.length > 0) {
                            try {
                                const senderProfiles = await loadFriendProfilesService(uniqueSenderIds);
                                dispatch(upsertGroupMemberProfiles(senderProfiles as any));
                            } catch (err) {
                                console.error("Failed to load sender profiles for group last messages", err);
                            }
                        }
                    } else {
                        finalGroups = loadedGroups;
                        setGroups(loadedGroups);
                    }
                } else {
                    console.warn("Cannot load groups for conversation sidebar", groupResult.reason);
                    setGroups([]);
                }

                if (shouldLoadGroups) {
                    void loadPendingRequests(currentUserId, finalGroups);
                }

                if (friendResult.status === "rejected" || groupResult.status === "rejected") {
                    setError("Không tải được danh sách bạn bè và nhóm");
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

        const handleGroupListUpdate = () => {
            if (mounted) void loadSidebarData();
        };
        window.addEventListener("group_list_updated", handleGroupListUpdate);

        return () => {
            mounted = false;
            window.removeEventListener("group_list_updated", handleGroupListUpdate);
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
        if (
            socketEvent !== SocketEvent.NEW_MESSAGE &&
            socketEvent !== SocketEvent.MESSAGE_ACK &&
            socketEvent !== SocketEvent.MESSAGE_RECALL
        ) {
            return;
        }

        const socketPayload = socketData as { conversationId?: number; message?: any } | null;
        if (socketPayload?.conversationId && socketPayload?.message) {
            const convId = Number(socketPayload.conversationId);
            const msg = socketPayload.message;
            setGroups((prev) =>
                prev.map((g) =>
                    g.conversationId === convId
                        ? { ...g, lastMessage: msg, updatedAt: msg.createdAt }
                        : g
                )
            );
            setAcceptedDirectConversations((prev) =>
                prev.map((c) =>
                    c.conversationId === convId
                        ? { ...c, lastMessage: msg }
                        : c
                )
            );
            setMessageRequests((prev) =>
                prev.map((r) =>
                    r.conversationId === convId
                        ? { ...r, lastMessage: msg }
                        : r
                )
            );
        }

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

                const unreads: Record<number, number> = {};
                acceptedDirect.forEach((c) => {
                    if (c.conversationId && typeof c.unreadCount === "number") {
                        unreads[c.conversationId] = c.unreadCount;
                    }
                });
                requests.forEach((r) => {
                    if (r.conversationId && typeof r.unreadCount === "number") {
                        unreads[r.conversationId] = r.unreadCount;
                    }
                });
                if (Object.keys(unreads).length > 0) {
                    dispatch(setUnreads(unreads));
                }

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
    }, [socketEvent, socketData, currentUserId]);

    const visibleFriends = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) return friends;
        return friends.filter((friend) =>
            `${friend.fullName ?? ""} ${friend.email ?? ""}`.toLowerCase().includes(keyword)
        );
    }, [friends, searchText]);

    const visibleGroups = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        const filteredGroups = keyword
            ? groups.filter((group) =>
                `${group.name ?? ""} ${group.subjectName ?? ""}`.toLowerCase().includes(keyword)
            )
            : groups;
        return [...filteredGroups].sort((a, b) => {
            if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
                return a.isPinned ? -1 : 1;
            }
            return (a.name || "").localeCompare(b.name || "", "vi");
        });
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

    const unifiedConversations = useMemo(() => {
        const directList = visibleAcceptedDirectConversations.map((conv) => {
            const lastMsgTime = getLastMessageTime(conv);
            const friendObj = friends.find((f) => Number(f.userId) === Number(conv.otherUserId));
            const isOnline = friendObj ? Boolean(friendObj.online) : Boolean(conv.profile?.online);

            return {
                id: `direct-${conv.conversationId}`,
                type: "PRIVATE" as const,
                displayName: conv.displayName,
                avatarUrl: conv.profile?.avatarUrl ?? undefined,
                lastMessagePreview: getLastMessagePreview(conv, false, currentUserId),
                time: lastMsgTime,
                isOnline: isOnline,
                original: conv,
            };
        });

        const activeChatUserIds = new Set(
            visibleAcceptedDirectConversations.map((c) => Number(c.otherUserId)).filter(Boolean)
        );

        const inactiveFriendsList = visibleFriends
            .filter((friend) => !activeChatUserIds.has(Number(friend.userId)))
            .map((friend) => ({
                id: `friend-${friend.userId}`,
                type: "FRIEND" as const,
                displayName: friend.fullName || friend.email || `User ${friend.userId}`,
                avatarUrl: friend.avatarUrl ?? undefined,
                lastMessagePreview: "Tin nhắn mới",
                time: 0,
                isOnline: Boolean(friend.online),
                original: friend,
            }));

        const groupList = visibleGroups.map((group) => {
            const lastMsgTime = getLastMessageTime(group as any);
            const fallbackTime = new Date(group.updatedAt || group.createdAt).getTime();
            const groupTime = lastMsgTime > 0 ? lastMsgTime : (Number.isFinite(fallbackTime) ? fallbackTime : 0);

            return {
                id: `group-${group.id}`,
                type: "GROUP" as const,
                displayName: group.name || `Nhóm ${group.id}`,
                avatarUrl: undefined,
                lastMessagePreview: getLastMessagePreview(group as any, true, currentUserId, groupMemberProfiles),
                time: groupTime,
                isOnline: false,
                original: group,
            };
        });

        return [...directList, ...groupList, ...inactiveFriendsList].sort((a, b) => b.time - a.time);
    }, [visibleAcceptedDirectConversations, visibleFriends, visibleGroups, friends, groupMemberProfiles, currentUserId]);

    const openConversation = (friend: FriendUser) => {
        const currentUserId = Number(localStorage.getItem("userId"));
        const conversationKey = `private:${friend.userId}:${Date.now()}`;
        navigate("/conversation", {
            state: {
                conversationKind: "PRIVATE",
                targetUserId: friend.userId,
                fullName: friend.fullName,
                avatar: friend.avatarUrl,
                conversationKey,
            },
        });

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
                });
        }
    };

    const openGroupConversation = async (group: StudyGroupDetailResponse) => {
        const currentUserId = Number(localStorage.getItem("userId"));
        const conversationKey = `group:${group.id}:${Date.now()}`;
        navigate("/conversation", {
            state: {
                conversationKind: "GROUP",
                groupId: group.id,
                groupName: group.name,
                conversationType: 0,
                targetUserId: null,
                fullName: null,
                avatar: null,
                conversationKey,
                groupVisibility: group.visibility,
            },
        });

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
    };

    const openMessageRequest = (request: MessageRequestItem) => {
        const profile = requestProfiles[request.otherUserId];
        const conversationKey = `private:${request.otherUserId}:${request.conversationId}:${Date.now()}`;
        dispatch(updateCurrentConverId({ currentConversationId: Number(request.conversationId) }));
        navigate("/conversation", {
            state: {
                conversationKind: "PRIVATE",
                targetUserId: request.otherUserId,
                fullName: profile?.fullName || `User ${request.otherUserId}`,
                avatar: profile?.avatarUrl || null,
                conversationKey,
            },
        });
    };

    const openAcceptedDirectConversation = (conversation: MessageRequestItem) => {
        const profile = directProfiles[conversation.otherUserId];
        const conversationKey = `private:${conversation.otherUserId}:${conversation.conversationId}:${Date.now()}`;
        dispatch(updateCurrentConverId({ currentConversationId: Number(conversation.conversationId) }));
        navigate("/conversation", {
            state: {
                conversationKind: "PRIVATE",
                targetUserId: conversation.otherUserId,
                fullName: profile?.fullName || `User ${conversation.otherUserId}`,
                avatar: profile?.avatarUrl || null,
                conversationKey,
            },
        });
    };

    const routeState = location.state as { targetUserId?: any; groupId?: any; conversationKey?: any } | null;
    const hasActiveChat = Boolean(routeState?.targetUserId || routeState?.groupId || routeState?.conversationKey);

    useEffect(() => {
        if (location.pathname !== "/conversation") return;

        if (!loading && !hasActiveChat && unifiedConversations.length > 0) {
            const firstConv = unifiedConversations[0];
            setSelectedItemKey(firstConv.id);
            if (firstConv.type === "PRIVATE") {
                openAcceptedDirectConversation(firstConv.original);
            } else if (firstConv.type === "GROUP") {
                void openGroupConversation(firstConv.original);
            } else if (firstConv.type === "FRIEND") {
                openConversation(firstConv.original);
            }
        }
    }, [loading, hasActiveChat, unifiedConversations, location.pathname]);

    useEffect(() => {
        if (routeState) {
            if (routeState.groupId) {
                setSelectedItemKey(`group-${routeState.groupId}`);
            } else if (routeState.targetUserId) {
                const activeDirect = visibleAcceptedDirectConversations.find(
                    (c) => Number(c.otherUserId) === Number(routeState.targetUserId)
                );
                if (activeDirect) {
                    setSelectedItemKey(`direct-${activeDirect.conversationId}`);
                } else {
                    setSelectedItemKey(`friend-${routeState.targetUserId}`);
                }
            }
        }
    }, [routeState, visibleAcceptedDirectConversations]);

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
                                <SearchIcon sx={{ color: "#7f8aa0", fontSize: 18 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            height: 40,
                            borderRadius: "12px",
                            bgcolor: "#ffffff",
                            border: "1px solid #d2dbea",
                            boxShadow: "0 2px 8px rgba(31,42,68,0.05)",
                            transition: "all 0.2s ease",
                            "& fieldset": { border: "none" },
                            "&:hover": { borderColor: "#b9c6dd", boxShadow: "0 3px 10px rgba(31,42,68,0.08)" },
                            "&.Mui-focused": { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.16)" },
                        },
                        "& .MuiOutlinedInput-input": { py: 0, px: 0, fontSize: 14, color: "#1f2a44" },
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
                    sx={{ flex: 1, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                >
                    Bạn bè
                </Button>
                <Badge
                    color="error"
                    badgeContent={messageRequests.length}
                    overlap="rectangular"
                    sx={{ flex: 1, width: "100%", "& .MuiBadge-badge": { right: 8, top: 4 } }}
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
                    <SidebarSkeleton />
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

                {activeView === "main" && !loading && !error && unifiedConversations.length === 0 && (
                    <Typography sx={{ px: 1, py: 2, color: "#8d8fa3", fontSize: 13 }}>
                        Không có bạn bè hoặc nhóm
                    </Typography>
                )}

                {activeView === "main" && !loading && !error && unifiedConversations.map((item) => {
                    const isSelected = selectedItemKey === item.id;

                    const conversationId = item.type === "GROUP"
                        ? item.original.conversationId
                        : (item.type === "PRIVATE" ? item.original.conversationId : null);

                    const unreadCount = conversationId ? (unreadByConversation[conversationId] || 0) : 0;
                    const isUnread = unreadCount > 0;
                    const unreadLabel = unreadCount > 5 ? "5+" : String(unreadCount);

                    const handleClick = () => {
                        if (selectedItemKey === item.id) return;
                        setSelectedItemKey(item.id);
                        if (item.type === "PRIVATE") {
                            openAcceptedDirectConversation(item.original);
                        } else if (item.type === "GROUP") {
                            void openGroupConversation(item.original);
                        } else if (item.type === "FRIEND") {
                            openConversation(item.original);
                        }
                    };

                    return (
                        <Box
                            key={item.id}
                            onClick={handleClick}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                py: 1.5,
                                px: 1,
                                borderRadius: "8px",
                                bgcolor: isSelected ? "#e2e8f0" : "transparent",
                                "&:hover": { bgcolor: isSelected ? "#cbd5e1" : "#f1f5f9", cursor: "pointer" },
                                transition: "background-color 150ms ease",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
                                <Box sx={{ position: "relative", flexShrink: 0 }}>
                                    {item.type === "GROUP" ? (
                                        <Avatar sx={{ width: 45, height: 45, bgcolor: "#3b82f6" }}>
                                            <GroupsRoundedIcon sx={{ fontSize: 22 }} />
                                        </Avatar>
                                    ) : (
                                        <>
                                            <Avatar src={item.avatarUrl ?? undefined} sx={{ width: 45, height: 45 }}>
                                                {item.displayName?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            <Box
                                                title={item.isOnline ? "Online" : "Offline"}
                                                sx={{
                                                    position: "absolute",
                                                    right: -2,
                                                    bottom: -2,
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: "50%",
                                                    bgcolor: item.isOnline ? "#48d26d" : "#a7adba",
                                                    border: "2px solid white",
                                                }}
                                            />
                                        </>
                                    )}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontSize: 15, fontWeight: isUnread ? 800 : 600, color: isUnread ? "#0f172a" : "#1f2a44", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {item.displayName}
                                    </Typography>
                                    {item.lastMessagePreview && (
                                        <Typography sx={{ fontSize: 13, fontWeight: isUnread ? 700 : 400, color: isUnread ? "#1e293b" : "#8d8fa3", mt: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {item.lastMessagePreview}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            {isUnread && (
                                <Box
                                    sx={{
                                        minWidth: 16,
                                        height: 16,
                                        borderRadius: "8px",
                                        bgcolor: "#94a3b8",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        px: unreadCount > 5 ? 0.6 : 0,
                                        ml: 1.5,
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: "#ffffff",
                                            fontSize: 9,
                                            fontWeight: 700,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {unreadLabel}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
