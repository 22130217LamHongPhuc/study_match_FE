import React, { useEffect } from "react";
import { Alert, Avatar, Box, Button, CircularProgress, Dialog, DialogContent, Typography } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import VideocamIcon from "@mui/icons-material/Videocam";
import GroupsIcon from "@mui/icons-material/Groups";
import VideoCallRoom from "../../../components/conversation/VideoCallRoom";
import { useCall } from "../CallProvider";

export default function CallOverlay() {
  const { state, acceptCall, rejectCall, cancelCall, endCall, resetCall } = useCall();
  const isGroupCall = Boolean(state.session?.isGroupCall || state.incoming?.isGroupCall);

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
    state.status === "CREATING" ? "Đang gọi…" :
    state.status === "CONNECTING" ? "Đang kết nối…" :
    state.status === "REJECTED" ? "Cuộc gọi đã bị từ chối" :
    state.status === "CANCELLED" ? "Cuộc gọi đã hủy" :
    state.status === "EXPIRED" ? "Không có người trả lời" :
    state.status === "FAILED" ? state.error || "Cuộc gọi thất bại" :
    incoming ? "Bạn có cuộc gọi đến" : "Đang gọi…";

  return (
    <Dialog open fullWidth maxWidth="xs">
      <DialogContent sx={{ textAlign: "center", py: 4 }}>
        {state.status === "FAILED" ? (
          <Alert severity="error" sx={{ mb: 2 }}>{label}</Alert>
        ) : (
          <>
            <Avatar
              src={state.incoming?.avatar || undefined}
              sx={{
                width: 88,
                height: 88,
                mx: "auto",
                mb: 2,
                bgcolor: isGroupCall && !state.incoming?.avatar
                  ? "#3b82f6"
                  : undefined,
              }}
            >
              {isGroupCall && !state.incoming?.avatar
                ? <GroupsIcon sx={{ fontSize: 44, color: "#fff" }} />
                : state.incoming?.name?.charAt(0)}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>{state.incoming?.name || "Cuộc gọi"}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>{label}</Typography>
          </>
        )}
        {working && <CircularProgress size={24} sx={{ mt: 2 }} />}
        {!terminal && !working && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
            <Button variant="contained" color="error" onClick={incoming ? rejectCall : cancelCall} sx={{ borderRadius: 99, minWidth: 64 }}>
              <CallEndIcon />
            </Button>
            {incoming && (
              <Button variant="contained" color="success" onClick={acceptCall} sx={{ borderRadius: 99, minWidth: 64 }}>
                {state.session?.callType === "VIDEO" ? <VideocamIcon /> : <CallIcon />}
              </Button>
            )}
          </Box>
        )}
        {terminal && <Button onClick={resetCall} sx={{ mt: 2 }}>Đóng</Button>}
      </DialogContent>
    </Dialog>
  );
}
