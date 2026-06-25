import { Box } from "@mui/system";
import { useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../../components/sidebar/SideBar";
import Header from "../../components/header/Header";
import WebSocketManager from "../../socket/WebSocketManager";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToastCustom from "../../components/toastComponent/ToastCustom";
import { useDispatch, useSelector } from "react-redux";
import { increaseUnread, updateNewMess } from "../../redux/ChatReducer";
import { SocketResponse } from "../../model/SocketResponse";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";
import { sendDelivered } from "../../services/ChatService";
import { loadFriendProfilesService } from "../../services/FriendService";
import { joinVideoCall, rejectVideoCall } from "../../services/VideoCallService";
import VideoCallRoom from "../../components/conversation/VideoCallRoom";
import VideoCallModal from "../../components/conversation/VideoCallModal";
import {
  VideoCallInfo,
  VideoCallInviteData,
  VideoCallPeerInfo,
} from "../../model/VideoCall";


type NewMessageData = {
  conversationId: number;
  message: {
    messageId: number;
    senderId: number;
    content?: string | null;
  };
};

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
    "roomId" in data &&
    "token" in data &&
    "appId" in data &&
    "userId" in data
  );
};

const isNewMessageData = (data: unknown): data is NewMessageData => {
  if (!data || typeof data !== "object") return false;

  const value = data as Partial<NewMessageData>;

  return (
    typeof value.conversationId === "number" &&
    !!value.message &&
    typeof value.message.messageId === "number" &&
    typeof value.message.senderId === "number"
  );
};

const isZegoCreateSpanError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes("createSpan");
};


export default function MainLayout() {

  const dispatch = useDispatch();
  const location = useLocation();

  const currentConverId = useSelector(
    (state: RootState) => state.chat.currentConversationId,
  );

  const currentConverIdRef = useRef<number | null>(null);
  const isConversationPageRef = useRef(false);

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
    isConversationPageRef.current = location.pathname === "/conversation";
  }, [location.pathname]);

  useLayoutEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      if (isZegoCreateSpanError(event.error || event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn("[VideoCall][FE] Suppressed known ZegoCloud tracer runtime error");
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isZegoCreateSpanError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn("[VideoCall][FE] Suppressed known ZegoCloud tracer promise rejection");
      }
    };

    window.addEventListener("error", handleWindowError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

    return () => {
      window.removeEventListener("error", handleWindowError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
    };
  }, []);

  useLayoutEffect(() => {
    const ws = WebSocketManager.getInstance();

    let isMounted = true;
    let unsubscribeChat: (() => void) | undefined;
    let unsubscribePresence: (() => void) | undefined;

    const unsubscribeOnConnected = ws.onConnected(() => {
      ws.sendMessage("/chat/send", {
        event: SocketEvent.CLIENT_READY,
        data: {},
      });
    });

    ws.connect()
      .then(() => {
        if (!isMounted) return;

        const chatSubscription = ws.onMessage("/user/queue/chat", (msg: any) => {
          const parsed: SocketResponse = JSON.parse(msg);

          console.log("[VideoCall][FE][socket][message]", parsed);

          dispatch(updateNewMess(parsed));

          if (
            parsed.event === SocketEvent.VIDEO_CALL_INVITE &&
            isVideoCallInvite(parsed.data)
          ) {
            console.log("[VideoCall][FE][socket][invite]", parsed.data);


            const currentUserId = Number(localStorage.getItem("userId"));

            if (parsed.data.callerId === currentUserId) return;


            const isGroupCall = Boolean(
              parsed.data.isGroupCall ||
              parsed.data.groupId ||
              parsed.data.conversationType === 0,
            );

            const peerName = isGroupCall
              ? parsed.data.groupName || "Nhóm học"
              : parsed.data.callerName || `User ${parsed.data.callerId}`;

            const peerAvatar = isGroupCall
              ? parsed.data.groupAvatar || null
              : parsed.data.callerAvatar || null;

            const peer: VideoCallPeerInfo = {
              userId: isGroupCall ? null : parsed.data.callerId,
              fullName: peerName,
              avatar: peerAvatar,
              isGroupCall,
            };

            setIncomingPeer(peer);

            localStorage.setItem(
              `videoCallPeer:${parsed.data.sessionId}`,
              JSON.stringify(peer),
            );

            setIncomingVideoCall(parsed.data);

            if (!isGroupCall && parsed.data.callerId) {
              const callerId = Number(parsed.data.callerId);
              const sessionId = parsed.data.sessionId;
              void loadFriendProfilesService([callerId])
                .then((profiles) => {
                  const profile = profiles.find((item) => item.userId === callerId);
                  if (!profile) return;

                  const enrichedPeer: VideoCallPeerInfo = {
                    userId: callerId,
                    fullName: profile.fullName || peer.fullName,
                    avatar: profile.avatarUrl || peer.avatar || null,
                    isGroupCall: false,
                  };

                  setIncomingPeer((current) =>
                    current?.userId === callerId ? enrichedPeer : current,
                  );
                  localStorage.setItem(
                    `videoCallPeer:${sessionId}`,
                    JSON.stringify(enrichedPeer),
                  );
                })
                .catch((error) => {
                  console.error("[VideoCall][FE][caller-profile-error]", error);
                });
            }

            return;
          }

          if (
            parsed.event === SocketEvent.VIDEO_CALL_ACCEPTED &&
            isVideoCallInfo(parsed.data)
          ) {
            const acceptedCall = parsed.data;
            console.log("[VideoCall][FE][socket][accepted]", {
              sessionId: acceptedCall.sessionId,
              roomId: acceptedCall.roomId,
              userId: acceptedCall.userId,
              hasToken: !!acceptedCall.token,
            });

            setIncomingVideoCall(null);
            setCallActionLoading(false);
            setActiveVideoCall((current) => {
              if (current?.sessionId === acceptedCall.sessionId) {
                return current;
              }
              return acceptedCall;
            });

            return;
          }

          if (
            (parsed.event === SocketEvent.VIDEO_CALL_REJECTED ||
              parsed.event === SocketEvent.VIDEO_CALL_ENDED) &&
            isVideoCallInvite(parsed.data)
          ) {
            const closedSessionId = parsed.data.sessionId;
            console.log("[VideoCall][FE][socket][closed]", {
              event: parsed.event,
              sessionId: closedSessionId,
            });

            setIncomingVideoCall((current) =>
              current?.sessionId === closedSessionId ? null : current,
            );
            setActiveVideoCall((current) =>
              current?.sessionId === closedSessionId ? null : current,
            );
            setCallActionLoading(false);

            return;
          }

          if (
            parsed.event === SocketEvent.NEW_MESSAGE &&
            isNewMessageData(parsed.data)
          ) {
            const currentUserId = Number(localStorage.getItem("userId"));

            if (parsed.data.message.senderId !== currentUserId) {
              Promise.resolve(
                sendDelivered(parsed.data.conversationId, [
                  parsed.data.message.messageId,
                ]),
              ).catch((error) => {
                console.error("Cannot send delivered message", error);
              });
            }

            if (parsed.data.conversationId !== currentConverIdRef.current) {
              dispatch(
                increaseUnread({
                  conversationId: parsed.data.conversationId,
                }),
              );

              if (!isConversationPageRef.current) {
                toast(
                  <ToastCustom
                    message={parsed.data.message.content || ""}
                    userName={parsed.data.message.senderId.toString()}
                  />,
                  {
                    position: "bottom-right",
                    autoClose: 4000,
                  },
                );
              }
            }
          }
        });

        if (typeof chatSubscription === "function") {
          unsubscribeChat = chatSubscription;
        }

        const presenceSubscription = ws.onMessage(
          "/topic/presence",
          (msg: any) => {
            const parsed: SocketResponse = JSON.parse(msg);

            if (parsed.event === SocketEvent.USER_PRESENCE) {
              dispatch(updateNewMess(parsed));
            }
          },
        );

        if (typeof presenceSubscription === "function") {
          unsubscribePresence = presenceSubscription;
        }
      })
      .catch((err) => {
        console.error("Loi connect:", err);
      });

    return () => {
      isMounted = false;
      unsubscribeOnConnected?.();
      unsubscribeChat?.();
      unsubscribePresence?.();
    };
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
    return !!data && typeof data === "object";
  };

  const normalizeStudySessionReminder = (data: {
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
  }): {
    title: string;
    startTime: string;
    groupName?: string | null;
    subjectName?: string | null;
    studyMode?: string | null;
    location?: string | null;
    minutesBefore?: number | null;
    toastId: string;
  } | null => {
    const rawData = data as unknown as Record<string, unknown>;

    const readString = (...keys: string[]) => {
      for (const key of keys) {
        const value = rawData[key];
        if (typeof value === "string" && value.trim().length > 0) {
          return value;
        }
      }
      return undefined;
    };

    const readNumber = (...keys: string[]) => {
      for (const key of keys) {
        const value = rawData[key];
        if (typeof value === "number" && Number.isFinite(value)) {
          return value;
        }
        if (typeof value === "string") {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) {
            return parsed;
          }
        }
      }
      return undefined;
    };

    const reminderTitle =
      readString("title", "sessionTitle", "studySessionTitle", "name") ||
      "Lịch học sắp bắt đầu";

    const reminderStartTime =
      readString("startTime", "startAt", "sessionStartTime", "startsAt") ||
      new Date().toISOString();

    const reminderSessionId =
      readNumber("sessionId", "studySessionId", "id") || 0;

    if (!reminderTitle && !reminderStartTime) {
      return null;
    }

    return {
      title: reminderTitle,
      startTime: reminderStartTime,
      groupName: readString("groupName", "studyGroupName", "group"),
      subjectName: readString("subjectName", "subject"),
      studyMode: readString("studyMode", "mode"),
      location: readString("location", "place"),
      minutesBefore:
        readNumber("minutesBefore", "minutesLeft", "remindBeforeMinutes") ||
        null,
      toastId: `study-reminder-${reminderSessionId}-${reminderStartTime}`,
    };
  };

  const isNewMessageData = (
    data: unknown,
  ): data is {
    conversationId: number;
    message: { messageId: number; senderId: number; content?: string | null };
  } => {
    return (
      !!data &&
      typeof data === "object" &&
      "conversationId" in data &&
      "message" in data &&
      !!(data as any).message &&
      typeof (data as any).message.messageId === "number" &&
      typeof (data as any).message.senderId === "number"
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

        setActiveVideoCall({
          ...call,
          isGroupCall: Boolean(
            incomingVideoCall.isGroupCall ||
            incomingVideoCall.groupId ||
            incomingVideoCall.conversationType === 0,
          ),
          groupId: incomingVideoCall.groupId ?? call.groupId,
          groupName: incomingVideoCall.groupName ?? call.groupName,
          groupAvatar: incomingVideoCall.groupAvatar ?? call.groupAvatar,
          conversationType:
            incomingVideoCall.conversationType ?? call.conversationType,
        });
      })
      .catch((error) => {
        console.error("Cannot join video call", error);

        alert(
          error instanceof Error
            ? error.message
            : "Không thể tham gia cuộc gọi video",
        );
      })
      .finally(() => {
        setCallActionLoading(false);
      });
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
        setIncomingPeer(null);
        setCallActionLoading(false);
      });
  };

  return (
    <div>
      <ToastContainer />

      <Box sx={{ display: "flex", minHeight: "100vh", background: "#fafaf8" }}>
        <Box sx={{ flexShrink: 0 }}>
          <SideBar />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Header />

          <Box>
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
