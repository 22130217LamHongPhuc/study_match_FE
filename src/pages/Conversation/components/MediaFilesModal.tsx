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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ImageIcon from "@mui/icons-material/Image";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { MessageInterface } from "../../../model/Conversation";
import { loadMediaAndFiles } from "../../../services/ChatService";

type MediaFilesModalProps = {
    open: boolean;
    onClose: () => void;
    fullName: string;
    conversationId: number | null;
    currentUserId: number;
    getPinnedSenderName: (message: MessageInterface) => string;
    formatDateTime: (value?: string | null) => string;
};

const appFontFamily = '"Noto Sans", "Inter", "Roboto", "Arial", sans-serif';

export default function MediaFilesModal({
    open,
    onClose,
    fullName,
    conversationId,
    currentUserId,
    getPinnedSenderName,
    formatDateTime,
}: MediaFilesModalProps) {
    const [activeTab, setActiveTab] = useState<"media" | "files">("media");
    const [mediaAndFiles, setMediaAndFiles] = useState<MessageInterface[]>([]);
    const [loading, setLoading] = useState(false);

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
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: appFontFamily }}>
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
                    ) : sharedFiles.length === 0 ? (
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
                    )}
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
