import React, { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Box, Button, Modal, Typography } from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import { VideoCallInfo, VideoCallPeerInfo } from "../../model/VideoCall";

interface VideoCallRoomProps {
  call: VideoCallInfo;
  peer?: VideoCallPeerInfo | null;
  onClose: () => void;
  onEnd?: () => void | Promise<void>;
  remoteEnded?: boolean;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
};

export default function VideoCallRoom({
  call,
  peer,
  onClose,
  onEnd,
  remoteEnded = false,
}: VideoCallRoomProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const closedRef = useRef(false);
  const [duration, setDuration] = useState(0);
  const [frameError, setFrameError] = useState<string | null>(null);
  const frameUrlRef = useRef(
    `/call-frame?session=${encodeURIComponent(String(call.sessionId))}&instance=${Date.now()}`,
  );

  const displayPeer = useMemo(() => {
    if (peer) return peer;
    try {
      const raw = localStorage.getItem(`videoCallPeer:${call.sessionId}`);
      return raw ? JSON.parse(raw) as VideoCallPeerInfo : null;
    } catch {
      return null;
    }
  }, [call.sessionId, peer]);

  const isGroupCall = Boolean(
    call.isGroupCall ||
    displayPeer?.isGroupCall ||
    call.conversationType === 0 ||
    call.groupId,
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDuration((previous) => previous + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleFrameMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return;
      }

      if (event.data?.type === "STUDYMATCH_CALL_READY") {
        console.info("[VideoCallRoom][frame-ready]", {
          sessionId: call.sessionId,
          frameUrl: frameUrlRef.current,
        });
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "STUDYMATCH_CALL_INIT",
            call,
            isGroupCall,
          },
          window.location.origin,
        );
      } else if (event.data?.type === "STUDYMATCH_CALL_JOINED") {
        console.info("[VideoCallRoom][frame-joined]", {
          sessionId: call.sessionId,
        });
      } else if (event.data?.type === "STUDYMATCH_CALL_LEAVE") {
        if (closedRef.current) return;
        closedRef.current = true;
        onClose();
        void Promise.resolve(onEnd?.());
      } else if (event.data?.type === "STUDYMATCH_CALL_ERROR") {
        console.error("[CallFrame] Zego error", {
          sessionId: call.sessionId,
          message: event.data?.message,
        });
        setFrameError(event.data?.message || "Không thể mở phòng gọi");
      }
    };

    window.addEventListener("message", handleFrameMessage);
    return () => window.removeEventListener("message", handleFrameMessage);
  }, [call, isGroupCall, onClose, onEnd]);

  useEffect(() => {
    if (!remoteEnded || closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose, remoteEnded]);

  const closeCall = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    // Removing this component removes the whole iframe document. Zego's
    // singleton, media tracks and tracer live only inside that document.
    onClose();
    void Promise.resolve(onEnd?.()).catch((error) => {
      console.error("[VideoCallRoom] Could not update ended call", error);
    });
  };

  const iframe = (
    <iframe
      ref={iframeRef}
      title={`StudyMatch call ${call.sessionId}`}
      src={frameUrlRef.current}
      allow="camera; microphone; autoplay; display-capture"
      style={{
        width: "100%",
        height: "100%",
        border: 0,
        background: "#0b0f19",
      }}
    />
  );

  if (call.callType === "VIDEO") {
    return (
      <Box sx={{ position: "fixed", inset: 0, zIndex: 2000, bgcolor: "#0b0f19" }}>
        {iframe}
        <Button
          onClick={closeCall}
          variant="contained"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            minWidth: 48,
            height: 48,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.14)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
          }}
        >
          <CloseIcon />
        </Button>
        {frameError && (
          <Typography
            sx={{
              position: "absolute",
              left: "50%",
              bottom: 24,
              transform: "translateX(-50%)",
              color: "#fff",
              bgcolor: "rgba(220,38,38,.9)",
              px: 2,
              py: 1,
              borderRadius: 2,
            }}
          >
            {frameError}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Modal open>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          bgcolor: "rgba(11, 15, 25, 0.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Box
          sx={{
            position: "fixed",
            left: -10000,
            top: 0,
            width: 320,
            height: 240,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {iframe}
        </Box>

        <Box
          sx={{
            width: "min(380px, 100%)",
            borderRadius: 3,
            bgcolor: "#fff",
            boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
            px: 3,
            py: 3,
            textAlign: "center",
          }}
        >
          <Avatar
            src={displayPeer?.avatar || undefined}
            sx={{
              width: 104,
              height: 104,
              mx: "auto",
              mb: 2,
              border: "4px solid #e0f2fe",
              bgcolor: isGroupCall && !displayPeer?.avatar ? "#3b82f6" : undefined,
            }}
          >
            {isGroupCall && !displayPeer?.avatar
              ? <GroupsIcon sx={{ fontSize: 52, color: "#fff" }} />
              : displayPeer?.fullName?.charAt(0)}
          </Avatar>
          <Typography sx={{ fontSize: 21, fontWeight: 700, color: "#111827" }}>
            {displayPeer?.fullName}
          </Typography>
          <Box
            sx={{
              mt: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              color: "#2563eb",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <MicIcon sx={{ fontSize: 18 }} />
            <Box component="span">Đang gọi...</Box>
          </Box>
          <Typography sx={{ mt: 0.75, fontSize: 14, color: "#64748b" }}>
            {formatDuration(duration)}
          </Typography>
          {frameError && (
            <Typography sx={{ mt: 1, fontSize: 13, color: "#dc2626" }}>
              {frameError}
            </Typography>
          )}
          <Button
            onClick={closeCall}
            variant="contained"
            sx={{
              mt: 3,
              minWidth: 86,
              height: 52,
              borderRadius: 999,
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            <CallEndIcon />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
