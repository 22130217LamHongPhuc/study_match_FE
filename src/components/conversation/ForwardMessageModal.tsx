import CloseIcon from "@mui/icons-material/Close";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchIcon from "@mui/icons-material/Search";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { MessageInterface } from "../../model/Conversation";
import { forwardMessage, loadConversation, loadGroupConversation } from "../../services/ChatService";
import { FriendUser, loadAllFriendsService } from "../../services/FriendService";
import { getGroupsByUserId, StudyGroupDetailResponse } from "../../services/GroupService";

type RecipientType = "friend" | "group";

type Recipient = {
    key: string;
    type: RecipientType;
    id: number;
    name: string;
    avatarUrl?: string | null;
    subtitle: string;
};

type ForwardMessageModalProps = {
    open: boolean;
    message: MessageInterface | null;
    currentUserId: number;
    onClose: () => void;
};

const appFontFamily = '"Noto Sans", "Inter", "Roboto", "Arial", sans-serif';

const getMessagePreview = (message: MessageInterface | null) => {
    if (!message) return "";
    if (message.isDeleted) return "Tin nhắn đã được thu hồi";
    if (message.content?.trim()) return message.content;
    if (message.mediaURL) {
        return message.type?.startsWith("video/") ? "Video" : "Hình ảnh";
    }
    return message.fileName || "Tin nhắn";
};

export default function ForwardMessageModal({
    open,
    message,
    currentUserId,
    onClose,
}: ForwardMessageModalProps) {
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [groups, setGroups] = useState<StudyGroupDetailResponse[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        let mounted = true;
        const loadRecipients = async () => {
            setLoading(true);
            setError("");
            setSelectedKeys([]);

            try {
                const [friendResult, groupResult] = await Promise.allSettled([
                    loadAllFriendsService(),
                    Number.isFinite(currentUserId) && currentUserId > 0
                        ? getGroupsByUserId(currentUserId)
                        : Promise.resolve({ success: false, data: [] as StudyGroupDetailResponse[] }),
                ]);

                if (!mounted) return;

                setFriends(friendResult.status === "fulfilled" ? friendResult.value : []);
                if (groupResult.status === "fulfilled") {
                    const response = groupResult.value;
                    setGroups(response.success && Array.isArray(response.data) ? response.data : []);
                } else {
                    setGroups([]);
                }

                if (friendResult.status === "rejected" && groupResult.status === "rejected") {
                    setError("Không tải được danh sách bạn bè và nhóm.");
                }
            } catch (err) {
                console.error(err);
                if (mounted) {
                    setError("Không tải được danh sách chuyển tiếp.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadRecipients();
        return () => {
            mounted = false;
        };
    }, [currentUserId, open]);

    const recipients = useMemo<Recipient[]>(() => {
        const friendRecipients = friends.map((friend) => ({
            key: `friend:${friend.userId}`,
            type: "friend" as const,
            id: friend.userId,
            name: friend.fullName || `User ${friend.userId}`,
            avatarUrl: friend.avatarUrl,
            subtitle: friend.online ? "Đang hoạt động" : "Bạn bè",
        }));

        const groupRecipients = groups.map((group) => ({
            key: `group:${group.id}`,
            type: "group" as const,
            id: group.id,
            name: group.name || `Nhóm ${group.id}`,
            avatarUrl: null,
            subtitle: group.subjectName ? `Nhóm học: ${group.subjectName}` : "Nhóm đang tham gia",
        }));

        return [...friendRecipients, ...groupRecipients];
    }, [friends, groups]);

    const filteredRecipients = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) return recipients;
        return recipients.filter((recipient) =>
            recipient.name.toLowerCase().includes(keyword) ||
            recipient.subtitle.toLowerCase().includes(keyword)
        );
    }, [recipients, searchText]);

    const selectedRecipients = useMemo(() => {
        const selected = new Set(selectedKeys);
        return recipients.filter((recipient) => selected.has(recipient.key));
    }, [recipients, selectedKeys]);

    const toggleRecipient = (key: string) => {
        setSelectedKeys((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
        );
    };

    const handleForward = async () => {
        if (!message || message.messageId <= 0 || selectedRecipients.length === 0 || sending) return;

        setSending(true);
        setError("");

        try {
            await Promise.all(selectedRecipients.map(async (recipient) => {
                const response = recipient.type === "group"
                    ? await loadGroupConversation(currentUserId, recipient.id, 0)
                    : await loadConversation(currentUserId, recipient.id, 0);
                const targetConversationId = Number(response?.data?.conversationId);
                if (!Number.isFinite(targetConversationId) || targetConversationId <= 0) {
                    throw new Error(`Không tìm thấy cuộc trò chuyện với ${recipient.name}`);
                }
                await forwardMessage(message.messageId, targetConversationId);
            }));

            onClose();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Không thể chuyển tiếp tin nhắn.");
        } finally {
            setSending(false);
        }
    };

    const previewText = getMessagePreview(message);

    return (
        <Dialog
            open={open}
            onClose={sending ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: "8px",
                    overflow: "hidden",
                    fontFamily: appFontFamily,
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2.25,
                    py: 1.5,
                    borderBottom: "1px solid #edf0f4",
                    fontFamily: appFontFamily,
                    fontSize: 18,
                    fontWeight: 800,
                }}
            >
                Chuyển tiếp tin nhắn
                <IconButton size="small" onClick={onClose} disabled={sending}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ px: 2.25, py: 1.5, bgcolor: "#f8fafc", borderBottom: "1px solid #edf0f4" }}>
                    <Typography sx={{ mb: 0.5, color: "#667085", fontSize: 13, fontWeight: 700 }}>
                        Nội dung
                    </Typography>
                    <Typography
                        sx={{
                            color: "#1f2937",
                            fontSize: 14,
                            lineHeight: 1.5,
                            maxHeight: 42,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            wordBreak: "break-word",
                        }}
                    >
                        {previewText}
                    </Typography>
                </Box>

                <Box sx={{ px: 2.25, pt: 1.75, pb: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        value={searchText}
                        placeholder="Tìm bạn bè hoặc nhóm"
                        onChange={(event) => setSearchText(event.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {error && (
                    <Typography sx={{ px: 2.25, py: 0.75, color: "#b42318", fontSize: 13, fontWeight: 600 }}>
                        {error}
                    </Typography>
                )}

                <Box sx={{ minHeight: 280, maxHeight: 360, overflowY: "auto", px: 1 }}>
                    {loading ? (
                        <Box sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : filteredRecipients.length === 0 ? (
                        <Box sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", px: 3 }}>
                            <Typography sx={{ color: "#667085", textAlign: "center", fontSize: 14 }}>
                                Không tìm thấy bạn bè hoặc nhóm phù hợp.
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {filteredRecipients.map((recipient) => {
                                const checked = selectedKeys.includes(recipient.key);
                                return (
                                    <ListItemButton
                                        key={recipient.key}
                                        onClick={() => toggleRecipient(recipient.key)}
                                        sx={{
                                            mx: 0.75,
                                            my: 0.25,
                                            borderRadius: "8px",
                                            "&:hover": { bgcolor: "#f2f4f7" },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 42 }}>
                                            <Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple />
                                        </ListItemIcon>
                                        <Avatar src={recipient.avatarUrl || undefined} sx={{ width: 42, height: 42, mr: 1.25, bgcolor: recipient.type === "group" ? "#e8f0fe" : "#fce7e7", color: recipient.type === "group" ? "#1a73e8" : "#a40000" }}>
                                            {recipient.type === "group" ? <GroupsRoundedIcon /> : <PersonRoundedIcon />}
                                        </Avatar>
                                        <ListItemText
                                            primary={recipient.name}
                                            secondary={recipient.subtitle}
                                            primaryTypographyProps={{ fontSize: 15, fontWeight: 800, color: "#111827", noWrap: true }}
                                            secondaryTypographyProps={{ fontSize: 13, color: "#667085", noWrap: true }}
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    )}
                </Box>

                <Box
                    sx={{
                        px: 2.25,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        borderTop: "1px solid #edf0f4",
                        bgcolor: "#fff",
                    }}
                >
                    <Typography sx={{ color: "#667085", fontSize: 13, fontWeight: 700 }}>
                        Đã chọn {selectedKeys.length}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
                        disabled={sending || selectedKeys.length === 0 || !message || message.messageId <= 0}
                        onClick={handleForward}
                        sx={{
                            minWidth: 132,
                            borderRadius: "8px",
                            bgcolor: "#a40000",
                            fontWeight: 800,
                            textTransform: "none",
                            "&:hover": { bgcolor: "#8a0000" },
                        }}
                    >
                        {sending ? "Đang gửi" : "Chuyển tiếp"}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
