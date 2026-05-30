import { Box } from "@mui/system";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigate, Outlet, replace, useNavigate } from "react-router-dom";
import SideBar from "../../components/sidebar/SideBar";
import Header from "../../components/header/Header";
import WebSocketManager from "../../socket/WebSocketManager";
import { ToastContainer, toast } from "react-toastify";
import ToastCustom from "../../components/toastComponent/ToastCustom";
import { useDispatch, useSelector } from "react-redux";
import { increaseUnread, updateNewMess } from "../../redux/ChatReducer";
import { SocketResponse } from "../../model/SocketResponse";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";
import { sendDelivered } from "../../services/ChatService";
import {
  joinVideoCall,
  rejectVideoCall,
} from "../../services/VideoCallService";
import VideoCallRoom from "../../components/conversation/VideoCallRoom";
import VideoCallModal from "../../components/conversation/VideoCallModal";
import {
  VideoCallInfo,
  VideoCallInviteData,
  VideoCallPeerInfo,
} from "../../model/VideoCall";
import StudySessionReminderToast from "../../components/toastComponent/StudySessionReminderToast";

export default function MainLayout() {
  const dispatch = useDispatch();
  const currentConverId = useSelector(
    (state: RootState) => state.chat.currentConversationId,
  );
  const currentConverIdRef = useRef<number | null>(null);
  const [activeVideoCall, setActiveVideoCall] = useState<VideoCallInfo | null>(
    null,
  );
  const [incomingVideoCall, setIncomingVideoCall] =
    useState<VideoCallInviteData | null>(null);
  const [incomingPeer, setIncomingPeer] = useState<VideoCallPeerInfo | null>(
    null,
  );
  const [callActionLoading, setCallActionLoading] = useState(false);

  useLayoutEffect(() => {
    currentConverIdRef.current = currentConverId;
  }, [currentConverId]);

  useLayoutEffect(() => {
    let ws = WebSocketManager.getInstance();

    ws.connect()
      .then(() => {
        ws.onMessage("/user/queue/chat", (msg: any) => {
          const parsed: SocketResponse = JSON.parse(msg);
          console.log("[VideoCall][FE][socket][message]", parsed);
          dispatch(updateNewMess(parsed));

          if (parsed.event === SocketEvent.VIDEO_CALL_ENDED) {
            console.log("[VideoCall][FE][socket][ended]", parsed.data);
            setActiveVideoCall(null);
            setIncomingVideoCall(null);
            return;
          }

          if (parsed.event === SocketEvent.VIDEO_CALL_REJECTED) {
            console.log("[VideoCall][FE][socket][rejected]", parsed.data);
            setActiveVideoCall(null);
            setIncomingVideoCall(null);
            return;
          }

          if (
            parsed.event === SocketEvent.VIDEO_CALL_ACCEPTED &&
            isVideoCallInfo(parsed.data)
          ) {
            console.log("[VideoCall][FE][socket][accepted]", {
              sessionId: parsed.data.sessionId,
              roomId: parsed.data.roomId,
              hasToken: !!parsed.data.token,
            });
            setActiveVideoCall(parsed.data);
            return;
          }

          if (
            parsed.event === SocketEvent.VIDEO_CALL_INVITE &&
            isVideoCallInvite(parsed.data)
          ) {
            console.log("[VideoCall][FE][socket][invite]", parsed.data);
            const currentUserId = Number(localStorage.getItem("userId"));
            if (parsed.data.callerId === currentUserId) return;

            setIncomingPeer({
              userId: parsed.data.callerId,
              fullName:
                parsed.data.callerName || `User ${parsed.data.callerId}`,
              avatar: parsed.data.callerAvatar || null,
            });
            localStorage.setItem(
              `videoCallPeer:${parsed.data.sessionId}`,
              JSON.stringify({
                userId: parsed.data.callerId,
                fullName:
                  parsed.data.callerName || `User ${parsed.data.callerId}`,
                avatar: parsed.data.callerAvatar || null,
              }),
            );
            setIncomingVideoCall(parsed.data);
            return;
          }

          if (
            parsed.event === SocketEvent.NEW_MESSAGE &&
            parsed.data &&
            "message" in parsed.data
          ) {
            const currentUserId = Number(localStorage.getItem("userId"));
            if (parsed.data.message.senderId !== currentUserId) {
              sendDelivered(parsed.data.conversationId, [
                parsed.data.message.messageId,
              ]);
            }
          }

          if (
            parsed.event === SocketEvent.NEW_MESSAGE &&
            parsed.data &&
            "message" in parsed.data &&
            parsed.data.conversationId !== Number(currentConverIdRef.current)
          ) {
            dispatch(
              increaseUnread({ conversationId: parsed.data.conversationId }),
            );
            toast(
              <ToastCustom
                message={parsed.data.message.content || ""}
                userName={parsed.data.message.senderId.toString() || ""}
              ></ToastCustom>,
              {
                position: "bottom-right",
                autoClose: 4000,
              },
            );
          }

          if (
            parsed.event === SocketEvent.STUDY_SESSION_REMINDER &&
            isStudySessionReminder(parsed.data)
          ) {
            toast(
              <StudySessionReminderToast
                title={parsed.data.title}
                startTime={parsed.data.startTime}
                groupName={parsed.data.groupName}
                subjectName={parsed.data.subjectName}
                studyMode={parsed.data.studyMode}
                location={parsed.data.location}
                minutesBefore={parsed.data.minutesBefore}
              />,
              {
                position: "top-right",
                autoClose: 7000,
                closeOnClick: true,
                hideProgressBar: false,
              },
            );
          }
        });
      })
      .catch((err) => {
        console.error("Loi connect:", err);
      });
  }, [dispatch]);

  const isVideoCallInvite = (data: unknown): data is VideoCallInviteData => {
    return (
      !!data &&
      typeof data === "object" &&
      "sessionId" in data &&
      "roomId" in data
    );
  };

  const isVideoCallInfo = (data: unknown): data is VideoCallInfo => {
    return (
      !!data &&
      typeof data === "object" &&
      "sessionId" in data &&
      "token" in data &&
      "appId" in data
    );
  };

  const isStudySessionReminder = (
    data: unknown,
  ): data is {
    sessionId: number;
    title: string;
    startTime: string;
    endTime?: string | null;
    groupName?: string | null;
    subjectName?: string | null;
    studyMode?: string | null;
    location?: string | null;
    meetingUrl?: string | null;
    minutesBefore?: number | null;
    recipientName?: string | null;
  } => {
    return (
      !!data &&
      typeof data === "object" &&
      "sessionId" in data &&
      "title" in data &&
      "startTime" in data
    );
  };

  const acceptIncomingCall = () => {
    if (!incomingVideoCall || callActionLoading) return;

    setCallActionLoading(true);
    console.log("[VideoCall][FE][modal][accept]", incomingVideoCall);
    joinVideoCall(incomingVideoCall.sessionId)
      .then((call) => {
        console.log("[VideoCall][FE][modal][accept-success]", {
          sessionId: call.sessionId,
          roomId: call.roomId,
          hasToken: !!call.token,
        });
        setIncomingVideoCall(null);
        setActiveVideoCall(call);
      })
      .catch((error) => {
        console.error("Cannot join video call", error);
        alert(
          error instanceof Error
            ? error.message
            : "Không thể tham gia cuộc gọi video",
        );
      })
      .finally(() => setCallActionLoading(false));
  };

  const rejectIncomingCall = () => {
    if (!incomingVideoCall || callActionLoading) return;

    setCallActionLoading(true);
    console.log("[VideoCall][FE][modal][reject]", incomingVideoCall);
    rejectVideoCall(incomingVideoCall.sessionId)
      .catch((error) => {
        console.error("Cannot reject video call", error);
      })
      .finally(() => {
        setIncomingVideoCall(null);
        setCallActionLoading(false);
      });
  };

  return (
    <div>
      <Box sx={{ display: "flex", minHeight: "100vh", background: "#fafaf8" }}>
        <Box sx={{ flexShrink: 0 }}>
          <SideBar />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Header />
          <Box>
            <ToastContainer />
            <Outlet />
          </Box>
        </Box>
      </Box>
      {activeVideoCall && (
        <VideoCallRoom
          call={activeVideoCall}
          peer={incomingPeer}
          onClose={() => setActiveVideoCall(null)}
        />
      )}
      <VideoCallModal
        open={!!incomingVideoCall}
        mode="incoming"
        name={incomingPeer?.fullName || "Người dùng"}
        avatar={incomingPeer?.avatar || null}
        callType={incomingVideoCall?.callType}
        loading={callActionLoading}
        onAccept={acceptIncomingCall}
        onReject={rejectIncomingCall}
      />
    </div>
  );
}
