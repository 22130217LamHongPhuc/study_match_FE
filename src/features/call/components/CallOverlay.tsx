import React, { useEffect } from "react";
import { Alert, Avatar, Box, Button, CircularProgress, Dialog, DialogContent, Typography, IconButton } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import VideocamIcon from "@mui/icons-material/Videocam";
import GroupsIcon from "@mui/icons-material/Groups";
import VideoCallRoom from "../../../components/conversation/VideoCallRoom";
import { useCall } from "../CallProvider";
import noFriend2Img from "../../../assets/img/no-friend-2.png";

const pulseAnimation = {
  "@keyframes pulseRing": {
    "0%": {
      boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.4)",
    },
    "70%": {
      boxShadow: "0 0 0 16px rgba(59, 130, 246, 0)",
    },
    "100%": {
      boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
    },
  },
  animation: "pulseRing 2s infinite ease-in-out",
};

export default function CallOverlay() {
  const { state, acceptCall, rejectCall, cancelCall, endCall, resetCall } = useCall();
  const isGroupCall = Boolean(state.session?.isGroupCall || state.incoming?.isGroupCall);
  const isUserOffline = state.status === "FAILED" && state.error === "Không thể liên lạc với người dùng";

  useEffect(() => {
    if (state.status === "ENDED") {
      resetCall();
      return;
    }
    if (!["ENDED", "REJECTED", "CANCELLED", "EXPIRED"].includes(state.status)) return;
    const timer = window.setTimeout(resetCall, 1800);
    return () => window.clearTimeout(timer);
  }, [resetCall, state.status]);

  if (state.status === "IDLE") return null;
  if (state.status === "ENDED") return null;
  if (state.status === "CONNECTED" && state.session) {
    return (
      <VideoCallRoom
        call={state.session}
        peer={state.incoming ? {
          userId: state.incoming.userId,
          fullName: state.incoming.name,
          avatar: state.incoming.avatar,
          isGroupCall: state.session.isGroupCall,
        } : null}
        onClose={resetCall}
        onEnd={endCall}
        remoteEnded={state.reason === "REMOTE_ENDED"}
      />
    );
  }

  const incoming = state.status === "INCOMING_RINGING";
  const working = ["CREATING", "CONNECTING", "ENDING"].includes(state.status);
  const terminal = ["ENDED", "REJECTED", "CANCELLED", "EXPIRED", "FAILED"].includes(state.status);
  
  const label =
    state.status === "CREATING" ? "Đang kết nối thiết bị…" :
    state.status === "CONNECTING" ? "Đang thiết lập cuộc gọi…" :
    state.status === "REJECTED" ? "Cuộc gọi đã bị từ chối" :
    state.status === "CANCELLED" ? "Cuộc gọi đã hủy" :
    state.status === "EXPIRED" ? "Không có người trả lời" :
    state.status === "FAILED" ? (state.error === "Không thể liên lạc với người dùng" ? "User hiện tại không online" : state.error || "Cuộc gọi thất bại") :
    incoming ? "Bạn có cuộc gọi đến" : "Đang đổ chuông…";

  const isRinging = state.status === "OUTGOING_RINGING" || state.status === "INCOMING_RINGING";

  return (
    <Dialog 
      open 
      fullWidth 
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "28px",
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          p: 3,
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(15, 23, 42, 0.3)",
            backdropFilter: "blur(6px)",
          },
        },
      }}
    >
      <DialogContent sx={{ textAlign: "center", py: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {state.status === "FAILED" ? (
          isUserOffline ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, my: 2 }}>
              <Box
                component="img"
                src={noFriend2Img}
                alt="User offline"
                sx={{ 
                  width: 150, 
                  height: 150, 
                  objectFit: "contain", 
                  mx: "auto", 
                  mb: 2,
                  animation: "scaleIn 0.3s ease-out",
                  "@keyframes scaleIn": {
                    "0%": { transform: "scale(0.8)", opacity: 0 },
                    "100%": { transform: "scale(1)", opacity: 1 }
                  }
                }}
              />
              <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b", fontSize: "1.15rem" }}>
                User hiện tại không online
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", maxWidth: "80%", mx: "auto" }}>
                Người dùng không trực tuyến hoặc không thể nhận cuộc gọi lúc này.
              </Typography>
            </Box>
          ) : (
            <Alert severity="error" sx={{ width: "100%", borderRadius: "16px", mb: 2, textAlign: "left" }}>
              {label}
            </Alert>
          )
        ) : (
          <>
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                mb: 3,
                mt: 1,
                borderRadius: "50%",
                p: 0.5,
                bgcolor: "background.paper",
                ...(isRinging ? pulseAnimation : {}),
              }}
            >
              <Avatar
                src={state.incoming?.avatar || undefined}
                sx={{
                  width: 96,
                  height: 96,
                  border: "4px solid #fff",
                  boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.1)",
                  bgcolor: isGroupCall && !state.incoming?.avatar ? "#3b82f6" : "#e2e8f0",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "2rem"
                }}
              >
                {isGroupCall && !state.incoming?.avatar ? (
                  <GroupsIcon sx={{ fontSize: 48, color: "#fff" }} />
                ) : (
                  state.incoming?.name?.charAt(0)
                )}
              </Avatar>
            </Box>
            <Typography variant="h5" fontWeight={750} sx={{ color: "#1e293b", mb: 1, fontSize: "1.35rem" }}>
              {state.incoming?.name || "Cuộc gọi"}
            </Typography>
            <Typography color="#64748b" fontWeight={500} sx={{ mb: 2, fontSize: "0.95rem" }}>
              {label}
            </Typography>
          </>
        )}

        {working && <CircularProgress size={28} sx={{ mt: 2, color: "#3b82f6" }} />}

        {!terminal && !working && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 3, mb: 1 }}>
            <IconButton
              onClick={incoming ? rejectCall : cancelCall}
              sx={{
                width: 60,
                height: 60,
                bgcolor: "#ef4444",
                color: "#fff",
                boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#dc2626",
                  transform: "scale(1.08)",
                  boxShadow: "0 12px 20px -3px rgba(239, 68, 68, 0.4)",
                },
              }}
            >
              <CallEndIcon sx={{ fontSize: 28 }} />
            </IconButton>

            {incoming && (
              <IconButton
                onClick={acceptCall}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "#10b981",
                  color: "#fff",
                  boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "#059669",
                    transform: "scale(1.08)",
                    boxShadow: "0 12px 20px -3px rgba(16, 185, 129, 0.4)",
                  },
                }}
              >
                {state.session?.callType === "VIDEO" ? (
                  <VideocamIcon sx={{ fontSize: 28 }} />
                ) : (
                  <CallIcon sx={{ fontSize: 28 }} />
                )}
              </IconButton>
            )}
          </Box>
        )}

        {terminal && (
          <Button
            fullWidth
            variant="contained"
            onClick={resetCall}
            sx={{
              mt: 2,
              py: 1.25,
              borderRadius: "14px",
              bgcolor: "#3b82f6",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "#2563eb",
                boxShadow: "0 6px 16px rgba(59, 130, 246, 0.3)",
              },
            }}
          >
            Đóng
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
