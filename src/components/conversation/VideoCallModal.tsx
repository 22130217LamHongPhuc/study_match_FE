import React from "react"
import { Avatar, Box, Button, Modal, Typography } from "@mui/material"
import CallEndIcon from "@mui/icons-material/CallEnd"
import CallIcon from "@mui/icons-material/Call"
import VideocamIcon from "@mui/icons-material/Videocam"

interface VideoCallModalProps {
    open: boolean
    mode: "outgoing" | "incoming" | "rejected"
    name: string
    avatar?: string | null
    callType?: "AUDIO" | "VIDEO"
    loading?: boolean
    onAccept?: () => void
    onReject: () => void
}

const statusText = (mode: VideoCallModalProps["mode"], callType: VideoCallModalProps["callType"]) => {
    const label = callType === "VIDEO" ? "video call" : "cuoc goi thoai"
    if (mode === "outgoing") return `Dang cho nhan ${label}...`
    if (mode === "incoming") return `Dang ${label} cho ban`
    return `${label} da bi tu choi`
}

export default function VideoCallModal({
    open,
    mode,
    name,
    avatar,
    callType = "AUDIO",
    loading,
    onAccept,
    onReject,
}: VideoCallModalProps) {
    return (
        <Modal open={open}>
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1900,
                    bgcolor: "rgba(11, 15, 25, 0.72)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                }}
            >
                <Box
                    sx={{
                        width: "min(360px, 100%)",
                        borderRadius: 3,
                        bgcolor: "#fff",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
                        px: 3,
                        py: 3,
                        textAlign: "center",
                    }}
                >
                    <Avatar
                        src={avatar || undefined}
                        sx={{
                            width: 92,
                            height: 92,
                            mx: "auto",
                            mb: 2,
                            border: "4px solid #f1f5f9",
                        }}
                    />
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
                        {name }
                    </Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 14, color: "#64748b" }}>
                        {statusText(mode, callType)}
                    </Typography>

                    <Box
                        sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "center",
                            gap: 2,
                        }}
                    >
                        {mode === "rejected" ? (
                            <Button
                                onClick={onReject}
                                variant="contained"
                                sx={{
                                    minWidth: 120,
                                    height: 44,
                                    borderRadius: 999,
                                    bgcolor: "#111827",
                                    textTransform: "none",
                                    fontWeight: 700,
                                    "&:hover": { bgcolor: "#020617" },
                                }}
                            >
                                Dong
                            </Button>
                        ) : (
                            <Button
                                onClick={onReject}
                                disabled={loading}
                                variant="contained"
                                sx={{
                                    minWidth: 76,
                                    height: 48,
                                    borderRadius: 999,
                                    bgcolor: "#ef4444",
                                    "&:hover": { bgcolor: "#dc2626" },
                                }}
                            >
                                <CallEndIcon />
                            </Button>
                        )}
                        {mode === "incoming" && (
                            <Button
                                onClick={onAccept}
                                disabled={loading}
                                variant="contained"
                                sx={{
                                    minWidth: 76,
                                    height: 48,
                                    borderRadius: 999,
                                    bgcolor: "#22c55e",
                                    "&:hover": { bgcolor: "#16a34a" },
                                }}
                            >
                                {callType === "VIDEO" ? <VideocamIcon /> : <CallIcon />}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        </Modal>
    )
}
