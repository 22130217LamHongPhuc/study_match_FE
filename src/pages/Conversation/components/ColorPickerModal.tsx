import React, { useState } from "react";
import { Dialog, Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CONVERSATION_THEMES, ConversationTheme } from "../../../theme/ConversationThemes";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ColorPickerModalProps {
    open: boolean;
    onClose: () => void;
    currentThemeId: string;
    onSelectTheme: (themeId: string) => void;
}

export default function ColorPickerModal({ open, onClose, currentThemeId, onSelectTheme }: ColorPickerModalProps) {
    const [previewThemeId, setPreviewThemeId] = useState<string>(currentThemeId);

    const handleSelect = () => {
        onSelectTheme(previewThemeId);
        onClose();
    };

    const currentTheme = CONVERSATION_THEMES.find((t: ConversationTheme) => t.id === previewThemeId) || CONVERSATION_THEMES[0];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e0e0e0" }}>
                <Typography sx={{ fontWeight: 700, fontSize: 18, ml: 1, textAlign: "center", flex: 1 }}>
                    Xem trước và chọn chủ đề
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: "#f0f2f5" }}>
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Box>

            <Box sx={{ display: "flex", height: 400 }}>
                {/* Left Side: Theme List */}
                <Box sx={{ flex: 1, overflowY: "auto", p: 1, borderRight: "1px solid #e0e0e0" }}>
                    {CONVERSATION_THEMES.map((theme: ConversationTheme) => {
                        const isSelected = previewThemeId === theme.id;
                        return (
                            <Box
                                key={theme.id}
                                onClick={() => setPreviewThemeId(theme.id)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    p: 1.5,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    bgcolor: isSelected ? "#f0f2f5" : "transparent",
                                    "&:hover": { bgcolor: "#f0f2f5" },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: "50%",
                                        background: theme.gradient,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.7)" }} />
                                </Box>
                                <Typography sx={{ fontWeight: isSelected ? 600 : 400, flex: 1, color: "#1c1e21" }}>
                                    {theme.name}
                                </Typography>
                                {isSelected && <CheckCircleIcon sx={{ color: "#3b82f6", fontSize: 20 }} />}
                            </Box>
                        );
                    })}
                </Box>

                {/* Right Side: Preview */}
                <Box sx={{ flex: 1.2, p: 2, bgcolor: currentTheme.background || "#ffffff", display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ alignSelf: "flex-end", maxWidth: "80%" }}>
                        <Box sx={{ p: 1.5, borderRadius: "18px", background: currentTheme.gradient, color: "#fff", fontSize: 14 }}>
                            Có rất nhiều chủ đề để bạn lựa chọn và những chủ đề này đều khác nhau đôi chút.
                        </Box>
                    </Box>
                    <Box sx={{ alignSelf: "flex-end", maxWidth: "80%" }}>
                        <Box sx={{ p: 1.5, borderRadius: "18px", background: currentTheme.gradient, color: "#fff", fontSize: 14 }}>
                            Tin nhắn mà bạn gửi cho người khác sẽ có màu này.
                        </Box>
                    </Box>
                    <Box sx={{ alignSelf: "flex-start", maxWidth: "80%" }}>
                        <Box sx={{ p: 1.5, borderRadius: "18px", bgcolor: "#f0f2f5", color: "#1c1e21", fontSize: 14 }}>
                            Tin nhắn của bạn bè sẽ tương tự như thế này.
                        </Box>
                        <Typography sx={{ fontSize: 11, color: "#65676b", mt: 0.5, textAlign: "right" }}>14:08</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 2, display: "flex", gap: 2, borderTop: "1px solid #e0e0e0" }}>
                <Button onClick={onClose} fullWidth variant="outlined" sx={{ textTransform: "none", fontWeight: 600, color: "#1c1e21", borderColor: "#ccd0d5", "&:hover": { bgcolor: "#f0f2f5", borderColor: "#ccd0d5" } }}>
                    Hủy
                </Button>
                <Button onClick={handleSelect} fullWidth variant="contained" sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#1877f2", "&:hover": { bgcolor: "#166fe5" } }}>
                    Chọn
                </Button>
            </Box>
        </Dialog>
    );
}
