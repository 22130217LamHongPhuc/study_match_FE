import React, { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ImageIcon from "@mui/icons-material/Image";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { MessageInterface } from "../../../model/Conversation";
import { loadMediaAndFiles } from "../../../services/ChatService";
import { FriendUser, loadFriendListService, loadFriendProfilesService, normalizeAvatarUrl } from "../../../services/FriendService";
import { getGroupById, getActiveGroupMemberIds, getActiveGroupMembers, getGroupInvitations, GroupInvitationResponse, kickGroupMember, sendGroupInvitation } from "../../../services/GroupService";

type GroupMemberProfile = FriendUser & {
    role?: string | null;
    status?: string | null;
};

type InvitationStatusByUserId = Record<number, GroupInvitationResponse>;

type MediaFilesModalProps = {
    open: boolean;
    onClose: () => void;
    fullName: string;
    conversationId: number | null;
    currentUserId: number;
    getPinnedSenderName: (message: MessageInterface) => string;
    formatDateTime: (value?: string | null) => string;
    isGroupConversation?: boolean;
    groupId?: number | null;
};

const appFontFamily = '"Noto Sans", "Inter", "Roboto", "Arial", sans-serif';

const canManageMembers = (role?: string | null) => {
    const normalizedRole = role?.toUpperCase();
    return normalizedRole === "OWNER" || normalizedRole === "ADMIN";
};

const getRoleLabel = (role?: string | null, isOwnerByGroupDetail = false) => {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === "OWNER" || isOwnerByGroupDetail) return "Trưởng nhóm";
    if (normalizedRole === "ADMIN") return "Quản trị nhóm";
    return "Thành viên";
};

export default function MediaFilesModal({
    open,
    onClose,
    fullName,
    conversationId,
    currentUserId,
    getPinnedSenderName,
    formatDateTime,
    isGroupConversation = false,
    groupId = null,
}: MediaFilesModalProps) {
    const [activeTab, setActiveTab] = useState<"media" | "files" | "members">("media");
    const [mediaAndFiles, setMediaAndFiles] = useState<MessageInterface[]>([]);
    const [loading, setLoading] = useState(false);

    const [groupMembers, setGroupMembers] = useState<GroupMemberProfile[]>([]);
    const [groupOwnerId, setGroupOwnerId] = useState<number | null>(null);
    const [membersLoading, setMembersLoading] = useState(false);
    const [kickingMemberId, setKickingMemberId] = useState<number | null>(null);
    const [friendCandidates, setFriendCandidates] = useState<FriendUser[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [invitingUserId, setInvitingUserId] = useState<number | null>(null);
    const [invitationStatusByUserId, setInvitationStatusByUserId] = useState<InvitationStatusByUserId>({});

    const currentGroupMember = useMemo(
        () => groupMembers.find((member) => member.userId === currentUserId),
        [currentUserId, groupMembers],
    );
    const currentCanManageMembers = canManageMembers(currentGroupMember?.role) || groupOwnerId === currentUserId;
    const currentCanInviteMembers = currentGroupMember?.role?.toUpperCase() === "OWNER" || groupOwnerId === currentUserId;
    const inviteCandidates = useMemo(() => {
        const memberIds = new Set(groupMembers.map((member) => member.userId));
        return friendCandidates.filter((friend) => friend.userId !== currentUserId && !memberIds.has(friend.userId));
    }, [currentUserId, friendCandidates, groupMembers]);

    useEffect(() => {
        if (!open) return;
        setActiveTab("media");
    }, [open, conversationId, groupId]);

    useEffect(() => {
        if (!open || !isGroupConversation || !groupId) return;

        let isMounted = true;
        setMembersLoading(true);

        const fetchGroupData = async () => {
            try {
                const groupRes = await getGroupById(groupId);
                if (!isMounted) return;
                let ownerId: number | null = null;
                if (groupRes.success && groupRes.data) {
                    ownerId = groupRes.data.ownerUserId;
                    setGroupOwnerId(ownerId);
                }

                const membersWithRoleRes = await getActiveGroupMembers(groupId);
                if (!isMounted) return;

                let memberIds: number[] = [];
                let memberRoles = new Map<number, { role?: string | null; status?: string | null }>();

                if (membersWithRoleRes.success && Array.isArray(membersWithRoleRes.data)) {
                    memberIds = membersWithRoleRes.data.map((member) => member.userId);
                    memberRoles = new Map(
                        membersWithRoleRes.data.map((member) => [
                            member.userId,
                            { role: member.role, status: member.status },
                        ]),
                    );

                    const ownerMember = membersWithRoleRes.data.find(
                        (member) => member.role?.toUpperCase() === "OWNER",
                    );
                    const adminMember = membersWithRoleRes.data.find(
                        (member) => member.role?.toUpperCase() === "ADMIN",
                    );
                    ownerId = ownerMember?.userId ?? adminMember?.userId ?? ownerId;
                    setGroupOwnerId(ownerId);
                } else {
                    const membersRes = await getActiveGroupMemberIds(groupId);
                    if (!isMounted) return;
                    memberIds = membersRes.data || [];
                }

                if (memberIds.length > 0) {
                    const profiles = await loadFriendProfilesService(memberIds);
                    if (!isMounted) return;

                    const profilesWithRole = profiles.map((profile) => ({
                        ...profile,
                        ...memberRoles.get(profile.userId),
                    }));

                    const sortedProfiles = [...profilesWithRole].sort((a, b) => {
                        const aCanManage = canManageMembers(a.role) || a.userId === ownerId;
                        const bCanManage = canManageMembers(b.role) || b.userId === ownerId;
                        if (aCanManage && !bCanManage) return -1;
                        if (!aCanManage && bCanManage) return 1;
                        return 0;
                    });

                    setGroupMembers(sortedProfiles);
                } else {
                    setGroupMembers([]);
                }
            } catch (err) {
                console.error("Failed to load group members:", err);
            } finally {
                if (isMounted) {
                    setMembersLoading(false);
                }
            }
        };

        fetchGroupData();

        return () => {
            isMounted = false;
        };
    }, [open, isGroupConversation, groupId]);

    useEffect(() => {
        if (!open || !isGroupConversation || !groupId || !currentCanInviteMembers || activeTab !== "members") return;

        let isMounted = true;
        setFriendsLoading(true);

        Promise.all([
            loadFriendListService(currentUserId),
            getGroupInvitations(groupId),
        ])
            .then(([friends, invitationsResponse]) => {
                if (isMounted) {
                    setFriendCandidates(friends);
                    if (invitationsResponse.success && Array.isArray(invitationsResponse.data)) {
                        setInvitationStatusByUserId(
                            invitationsResponse.data.reduce<InvitationStatusByUserId>((acc, invitation) => {
                                if (invitation.inviteeUserId && !acc[invitation.inviteeUserId]) {
                                    acc[invitation.inviteeUserId] = invitation;
                                }
                                return acc;
                            }, {}),
                        );
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to load friends or invitation statuses for group invite:", err);
            })
            .finally(() => {
                if (isMounted) {
                    setFriendsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [activeTab, currentCanInviteMembers, currentUserId, groupId, isGroupConversation, open]);

    useEffect(() => {
        const handleInvitationStatusUpdated = (event: Event) => {
            const detail = (event as CustomEvent<any>).detail;
            if (!groupId || Number(detail?.groupId) !== Number(groupId)) {
                return;
            }

            const inviteeUserId = Number(detail?.inviteeUserId);
            if (!Number.isFinite(inviteeUserId)) {
                return;
            }

            setInvitationStatusByUserId((prev) => ({
                ...prev,
                [inviteeUserId]: {
                    ...(prev[inviteeUserId] || {}),
                    invitationId: Number(detail?.invitationId || prev[inviteeUserId]?.invitationId || 0),
                    groupId,
                    groupName: detail?.groupName || fullName,
                    inviterUserId: currentUserId,
                    inviteeUserId,
                    inviterName: "",
                    status: detail?.status || "REJECTED",
                    createdAt: prev[inviteeUserId]?.createdAt || new Date().toISOString(),
                },
            }));
        };

        window.addEventListener("group_invitation_status_updated", handleInvitationStatusUpdated);
        return () => window.removeEventListener("group_invitation_status_updated", handleInvitationStatusUpdated);
    }, [currentUserId, fullName, groupId]);

    const handleKick = async (member: GroupMemberProfile) => {
        if (!groupId) return;

        try {
            setKickingMemberId(member.userId);
            const res = await kickGroupMember(groupId, member.userId);
            if (res.success) {
                setGroupMembers((prev) => prev.filter((m) => m.userId !== member.userId));
            } else {
                console.error("Cannot remove group member:", res.message);
            }
        } catch (err) {
            console.error("Error kicking member:", err);
        } finally {
            setKickingMemberId(null);
        }
    };

    const handleInvite = async (friend: FriendUser) => {
        if (!groupId) return;

        try {
            setInvitingUserId(friend.userId);
            const res = await sendGroupInvitation(groupId, friend.userId);
            if (res.success) {
                setFriendCandidates((prev) => prev.filter((item) => item.userId !== friend.userId));
                if (res.data) {
                    setInvitationStatusByUserId((prev) => ({
                        ...prev,
                        [friend.userId]: res.data,
                    }));
                }
            } else {
                console.error("Cannot invite group member:", res.message);
            }
        } catch (err) {
            console.error("Error inviting member:", err);
        } finally {
            setInvitingUserId(null);
        }
    };

    useEffect(() => {
        if (!open || !conversationId) return;

        let isMounted = true;
        setLoading(true);

        loadMediaAndFiles(conversationId, currentUserId)
            .then((data) => {
                if (isMounted) {
                    setMediaAndFiles(data);
                }
            })
            .catch((err) => {
                console.error("Failed to load media and files:", err);
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [open, conversationId, currentUserId]);

    const sharedMedia = useMemo(() => {
        return mediaAndFiles.filter((msg) => {
            if (msg.isDeleted) return false;
            const type = msg.type?.toLowerCase() || "";
            return (type.startsWith("image/") || type.startsWith("video/")) && msg.mediaURL;
        });
    }, [mediaAndFiles]);

    const sharedFiles = useMemo(() => {
        return mediaAndFiles.filter((msg) => {
            if (msg.isDeleted) return false;
            const type = msg.type?.toLowerCase() || "";
            return msg.fileName && !type.startsWith("image/") && !type.startsWith("video/");
        });
    }, [mediaAndFiles]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: "hidden",
                    fontFamily: appFontFamily,
                },
            }}
        >
            <DialogTitle
                sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid #e2e8f0",
                    position: "relative",
                }}
            >
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: appFontFamily }}>
                    {fullName}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.25, fontFamily: appFontFamily }}>
                    Ảnh, video và tài liệu trong cuộc trò chuyện
                </Typography>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 16,
                        top: 16,
                        color: "#718096",
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: "#fff", minHeight: 250 }}>
                {/* Unified Tab Bar like the screenshot */}
                <Box sx={{ display: "flex", borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                    {[
                        { id: "media" as const, label: `Hình ảnh / Video (${loading ? "..." : sharedMedia.length})`, icon: <ImageIcon sx={{ fontSize: 18 }} /> },
                        { id: "files" as const, label: `File phương tiện (${loading ? "..." : sharedFiles.length})`, icon: <AttachFileIcon sx={{ fontSize: 18 }} /> },
                        ...(isGroupConversation ? [{ id: "members" as const, label: `Thành viên (${membersLoading ? "..." : groupMembers.length})`, icon: <GroupIcon sx={{ fontSize: 18 }} /> }] : []),
                    ].map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <Button
                                key={tab.id}
                                startIcon={tab.icon}
                                onClick={() => setActiveTab(tab.id)}
                                sx={{
                                    flex: 1,
                                    py: 1.35,
                                    borderRadius: 0,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontFamily: appFontFamily,
                                    color: active ? "#1d4ed8" : "#475569",
                                    bgcolor: active ? "#fff" : "transparent",
                                    borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
                                    "&:hover": { bgcolor: active ? "#fff" : "#eef2ff" },
                                }}
                            >
                                {tab.label}
                            </Button>
                        );
                    })}
                </Box>

                {/* Content Area */}
                <Box sx={{ maxHeight: "min(560px, calc(100vh - 220px))", overflowY: "auto", p: 2.5 }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                            <CircularProgress size={36} sx={{ color: "#2563eb" }} />
                        </Box>
                    ) : activeTab === "media" ? (
                        sharedMedia.length === 0 ? (
                            <Box sx={{ border: "1px dashed #cbd5e1", borderRadius: 2, p: 4, textAlign: "center", color: "#64748b" }}>
                                Không có hình ảnh hoặc video nào được gửi trong cuộc hội thoại này.
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                                    gap: 2,
                                }}
                            >
                                {sharedMedia.map((msg) => {
                                    const isVideo = msg.type?.toLowerCase().startsWith("video/");
                                    return (
                                        <Box
                                            key={msg.messageId}
                                            onClick={() => msg.mediaURL && window.open(msg.mediaURL, "_blank")}
                                            sx={{
                                                aspectRatio: "1/1",
                                                borderRadius: 1.5,
                                                overflow: "hidden",
                                                position: "relative",
                                                cursor: "pointer",
                                                border: "1px solid #e2e8f0",
                                                transition: "all 0.2s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale(1.03)",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                },
                                            }}
                                        >
                                            {isVideo ? (
                                                <>
                                                    <Box
                                                        component="video"
                                                        src={msg.mediaURL || undefined}
                                                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            inset: 0,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            bgcolor: "rgba(0,0,0,0.2)",
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: "50%",
                                                                bgcolor: "rgba(255,255,255,0.9)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                                            }}
                                                        >
                                                            <PlayArrowRoundedIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                                                        </Box>
                                                    </Box>
                                                </>
                                            ) : (
                                                <Box
                                                    component="img"
                                                    src={msg.mediaURL || undefined}
                                                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )
                    ) : activeTab === "files" ? (
                        sharedFiles.length === 0 ? (
                            <Box sx={{ border: "1px dashed #cbd5e1", borderRadius: 2, p: 4, textAlign: "center", color: "#64748b" }}>
                                Không có file hoặc tài liệu nào được gửi trong cuộc hội thoại này.
                            </Box>
                        ) : (
                            <Box sx={{ display: "grid", gap: 1.5 }}>
                                {sharedFiles.map((msg) => (
                                    <Box
                                        key={msg.messageId}
                                        onClick={() => msg.mediaURL && window.open(msg.mediaURL, "_blank")}
                                        sx={{
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 2,
                                            p: 2,
                                            display: "flex",
                                            gap: 1.5,
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            "&:hover": {
                                                bgcolor: "#f8fafc",
                                                borderColor: "#cbd5e1",
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    width: 38,
                                                    height: 38,
                                                    borderRadius: 1,
                                                    bgcolor: "#eff6ff",
                                                    color: "#2563eb",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <InsertDriveFileIcon sx={{ fontSize: 20 }} />
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: 14.5,
                                                        fontWeight: 700,
                                                        color: "#0f172a",
                                                        fontFamily: appFontFamily,
                                                        lineHeight: 1.2,
                                                    }}
                                                    noWrap
                                                >
                                                    {msg.fileName || "Tài liệu không tên"}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: 12,
                                                        color: "#64748b",
                                                        mt: 0.5,
                                                        fontFamily: appFontFamily,
                                                    }}
                                                    noWrap
                                                >
                                                    {getPinnedSenderName(msg)} • {msg.createdAt ? formatDateTime(msg.createdAt) : "Tài liệu"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (msg.mediaURL) window.open(msg.mediaURL, "_blank");
                                            }}
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 700,
                                                color: "#2563eb",
                                                borderColor: "#bfdbfe",
                                                borderRadius: "6px",
                                                fontFamily: appFontFamily,
                                                flexShrink: 0,
                                                "&:hover": {
                                                    bgcolor: "#eff6ff",
                                                    borderColor: "#2563eb",
                                                },
                                            }}
                                            variant="outlined"
                                        >
                                            Tải xuống
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        )
                    ) : activeTab === "members" ? (
                        membersLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                                <CircularProgress size={36} sx={{ color: "#2563eb" }} />
                            </Box>
                        ) : groupMembers.length === 0 ? (
                            <Box sx={{ border: "1px dashed #cbd5e1", borderRadius: 2, p: 4, textAlign: "center", color: "#64748b" }}>
                                Không có thành viên nào trong nhóm này.
                            </Box>
                        ) : (
                            <Box sx={{ display: "grid", gap: 1.5 }}>
                                {currentCanInviteMembers && (
                                    <Box
                                        sx={{
                                            border: "1px solid #dbeafe",
                                            borderRadius: 2,
                                            p: 2,
                                            bgcolor: "#f8fbff",
                                            display: "grid",
                                            gap: 1.25,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: 14,
                                                        fontWeight: 700,
                                                        color: "#0f172a",
                                                        fontFamily: appFontFamily,
                                                    }}
                                                >
                                                    Thêm thành viên
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: 12,
                                                        color: "#64748b",
                                                        mt: 0.25,
                                                        fontFamily: appFontFamily,
                                                    }}
                                                >
                                                    Mời bạn bè chưa có trong nhóm
                                                </Typography>
                                            </Box>
                                            <PersonAddAlt1Icon sx={{ color: "#2563eb", fontSize: 22, flexShrink: 0 }} />
                                        </Box>

                                        {friendsLoading ? (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b", py: 0.5 }}>
                                                <CircularProgress size={16} sx={{ color: "#2563eb" }} />
                                                <Typography sx={{ fontSize: 13, fontFamily: appFontFamily }}>
                                                    Đang tải bạn bè...
                                                </Typography>
                                            </Box>
                                        ) : inviteCandidates.length === 0 ? (
                                            <Typography sx={{ fontSize: 13, color: "#64748b", fontFamily: appFontFamily }}>
                                                Không còn bạn bè nào để mời.
                                            </Typography>
                                        ) : (
                                            <Box sx={{ display: "grid", gap: 1, maxHeight: 180, overflowY: "auto", pr: 0.5 }}>
                                                {inviteCandidates.map((friend) => {
                                                    const invitationStatus = invitationStatusByUserId[friend.userId]?.status;
                                                    const isPending = invitationStatus === "PENDING";

                                                    return (
                                                        <Box
                                                            key={friend.userId}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                gap: 1.5,
                                                                border: "1px solid #e2e8f0",
                                                                borderRadius: 1.5,
                                                                p: 1.25,
                                                                bgcolor: "#fff",
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                                                                <Avatar
                                                                    src={normalizeAvatarUrl(friend.avatarUrl) || undefined}
                                                                    alt={friend.fullName}
                                                                    sx={{ width: 34, height: 34 }}
                                                                />
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: 13.5,
                                                                        fontWeight: 700,
                                                                        color: "#0f172a",
                                                                        fontFamily: appFontFamily,
                                                                    }}
                                                                    noWrap
                                                                >
                                                                    {friend.fullName || `User ${friend.userId}`}
                                                                </Typography>
                                                            </Box>
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleInvite(friend)}
                                                                disabled={invitingUserId === friend.userId || isPending}
                                                                sx={{
                                                                    textTransform: "none",
                                                                    fontWeight: 700,
                                                                    color: isPending ? "#64748b" : "#2563eb",
                                                                    borderColor: isPending ? "#cbd5e1" : "#bfdbfe",
                                                                    borderRadius: "6px",
                                                                    fontFamily: appFontFamily,
                                                                    flexShrink: 0,
                                                                    opacity: invitingUserId === friend.userId ? 0.7 : 1,
                                                                    "&:hover": {
                                                                        bgcolor: isPending ? "transparent" : "#eff6ff",
                                                                        borderColor: isPending ? "#cbd5e1" : "#2563eb",
                                                                    },
                                                                }}
                                                                variant="outlined"
                                                                startIcon={!isPending ? <PersonAddAlt1Icon sx={{ fontSize: 16 }} /> : undefined}
                                                            >
                                                                {isPending ? "Đang chờ xác nhận" : invitingUserId === friend.userId ? "Đang mời..." : "Mời"}
                                                            </Button>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {groupMembers.map((member) => {
                                    const isOwner = member.userId === groupOwnerId || member.role?.toUpperCase() === "OWNER";
                                    const memberCanManage = canManageMembers(member.role) || member.userId === groupOwnerId;
                                    const isCurrentUser = member.userId === currentUserId;
                                    const canKick = currentCanManageMembers && !isCurrentUser && !memberCanManage;
                                    const roleLabel = getRoleLabel(member.role, isOwner);

                                    return (
                                        <Box
                                            key={member.userId}
                                            sx={{
                                                border: "1px solid #e2e8f0",
                                                borderRadius: 2,
                                                p: 2,
                                                display: "flex",
                                                gap: 1.5,
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                transition: "all 0.15s ease",
                                                "&:hover": {
                                                    bgcolor: "#f8fafc",
                                                    borderColor: "#cbd5e1",
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                                <Avatar
                                                    src={normalizeAvatarUrl(member.avatarUrl) || undefined}
                                                    alt={member.fullName}
                                                    sx={{ width: 40, height: 40 }}
                                                />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 14.5,
                                                            fontWeight: 700,
                                                            color: "#0f172a",
                                                            fontFamily: appFontFamily,
                                                            lineHeight: 1.2,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 0.5,
                                                        }}
                                                        noWrap
                                                    >
                                                        {member.fullName} {isCurrentUser && <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(Bạn)</span>}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 12,
                                                            color: memberCanManage ? "#2563eb" : "#64748b",
                                                            fontWeight: memberCanManage ? 600 : 400,
                                                            mt: 0.5,
                                                            fontFamily: appFontFamily,
                                                        }}
                                                        noWrap
                                                    >
                                                        {roleLabel}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {canKick && (
                                                <Button
                                                    size="small"
                                                    onClick={() => handleKick(member)}
                                                    disabled={kickingMemberId === member.userId}
                                                    sx={{
                                                        textTransform: "none",
                                                        fontWeight: 700,
                                                        color: "#dc2626",
                                                        borderColor: "#fca5a5",
                                                        borderRadius: "6px",
                                                        fontFamily: appFontFamily,
                                                        flexShrink: 0,
                                                        opacity: kickingMemberId === member.userId ? 0.7 : 1,
                                                        "&:hover": {
                                                            bgcolor: "#fef2f2",
                                                            borderColor: "#dc2626",
                                                        },
                                                    }}
                                                    variant="outlined"
                                                >
                                                    {kickingMemberId === member.userId ? "Đang xóa..." : "Xóa khỏi nhóm"}
                                                </Button>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )
                    ) : null}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0" }}>
                <Button
                    onClick={onClose}
                    sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#475569",
                        fontFamily: appFontFamily,
                        borderRadius: "6px",
                        "&:hover": {
                            bgcolor: "#f1f5f9",
                        },
                    }}
                >
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
}
