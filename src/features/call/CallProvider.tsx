import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import WebSocketManager from "../../socket/WebSocketManager";
import { SocketEvent } from "../../enum/SocketEvent";
import { callApi } from "./callApi";
import { callReducer } from "./callReducer";
import { CallState, CallType, initialCallState, CallSession } from "./callTypes";
import { loadFriendProfilesService } from "../../services/FriendService";

interface CallContextValue {
  state: CallState;
  startCall: (conversationId: number, type: CallType, meta?: {
    callerName?: string;
    callerAvatar?: string | null;
    peer?: { userId: number; name: string; avatar?: string | null; isGroupCall?: boolean };
  }) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  cancelCall: () => Promise<void>;
  endCall: () => Promise<void>;
  resetCall: () => void;
}
const CallContext = createContext<CallContextValue | null>(null);

function normalizeSession(raw: any): CallSession {
  return {
    ...raw,
    sessionId: Number(raw.sessionId),
    conversationId: Number(raw.conversationId),
    callType: raw.callType === "VIDEO" ? "VIDEO" : "AUDIO",
    isGroupCall: raw.isGroupCall ?? (raw.targetUserId === null),
  };
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(callReducer, initialCallState);
  const sessionRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const pendingCloseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const ws = WebSocketManager.getInstance();
    const handler = async (raw: string) => {
      try {
        const event = JSON.parse(raw);
        const data = event?.data;
        if (!data?.sessionId) return;
        const session = normalizeSession(data);
        if (event.event === SocketEvent.VIDEO_CALL_INVITE) {
          if (sessionRef.current && sessionRef.current !== session.sessionId) {
            void callApi.reject(session.sessionId);
            return;
          }
          sessionRef.current = session.sessionId;
          const callerId = Number(data.callerId);
          let callerName = data.callerName || `User ${callerId}`;
          let callerAvatar = data.callerAvatar || null;
          if (!session.isGroupCall) {
            try {
              const profiles = await loadFriendProfilesService([callerId]);
              const profile = profiles?.[0];
              callerName = profile?.fullName || callerName;
              callerAvatar = profile?.avatarUrl || callerAvatar;
            } catch {
              // Keep the invite usable if the profile service is temporarily unavailable.
            }
          }
          dispatch({ type: "INCOMING", session, caller: { userId: callerId, name: callerName, avatar: callerAvatar } });
        } else if (event.event === SocketEvent.VIDEO_CALL_ACCEPTED && Number(data.sessionId) === sessionRef.current) {
          dispatch({ type: "CONNECTED", session });
        } else if ((
          event.event === SocketEvent.VIDEO_CALL_REJECTED ||
          event.event === SocketEvent.VIDEO_CALL_CANCELLED ||
          event.event === SocketEvent.VIDEO_CALL_MISSED ||
          event.event === SocketEvent.VIDEO_CALL_ENDED
        ) && Number(data.sessionId) === sessionRef.current) {
          const status =
            event.event === SocketEvent.VIDEO_CALL_REJECTED ? "REJECTED" :
            event.event === SocketEvent.VIDEO_CALL_CANCELLED ? "CANCELLED" :
            event.event === SocketEvent.VIDEO_CALL_MISSED ? "EXPIRED" :
            "ENDED";
          dispatch({
            type: "END",
            status,
            reason:
              event.event === SocketEvent.VIDEO_CALL_ENDED ? "REMOTE_ENDED" :
              event.event === SocketEvent.VIDEO_CALL_MISSED ? "NO_ANSWER" :
              event.event === SocketEvent.VIDEO_CALL_CANCELLED ? "REMOTE_CANCELLED" :
              "REMOTE_REJECTED",
          });
          sessionRef.current = null;
        }
      } catch (error) { console.error("[Call] invalid socket event", error); }
    };
    const unsubscribe = ws.onMessage("/user/queue/chat", handler);
    void ws.connect().catch(() => undefined);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (state.status !== "OUTGOING_RINGING" || !state.session) return;
    const sessionId = state.session.sessionId;
    const timer = window.setTimeout(() => {
      if (sessionRef.current !== sessionId) return;
      const closeRequest = state.session?.isGroupCall
        ? callApi.reject(sessionId)
        : callApi.cancel(sessionId);
      void closeRequest.catch((error) => {
        console.error("[Call] could not close expired outgoing call", error);
      });
      sessionRef.current = null;
      dispatch({ type: "END", status: "EXPIRED", reason: "NO_ANSWER" });
    }, 50_000);
    return () => window.clearTimeout(timer);
  }, [state.session, state.status]);

  const run = useCallback(async (fn: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try { await fn(); } catch (error) { dispatch({ type: "FAIL", error: error instanceof Error ? error.message : "Cuộc gọi thất bại" }); }
    finally { busyRef.current = false; }
  }, []);

  const startCall = useCallback(async (conversationId: number, type: CallType, meta?: {
    callerName?: string;
    callerAvatar?: string | null;
    peer?: { userId: number; name: string; avatar?: string | null; isGroupCall?: boolean };
  }) => {
    if (pendingCloseRef.current) {
      await pendingCloseRef.current.catch(() => undefined);
    }
    return run(async () => {
    dispatch({
      type: "CREATE_START",
      peer: meta?.peer
        ? {
            userId: meta.peer.userId,
            name: meta.peer.name,
            avatar: meta.peer.avatar,
            isGroupCall: meta.peer.isGroupCall,
          }
        : null,
    });
    const session = normalizeSession(await callApi.start(conversationId, type, meta?.callerName, meta?.callerAvatar));
    sessionRef.current = session.sessionId;
    dispatch({ type: "OUTGOING", session, peer: meta?.peer || null });
    });
  }, [run]);
  const acceptCall = useCallback(async () => run(async () => {
    if (!state.session) return;
    dispatch({ type: "CONNECTING", session: state.session });
    const session = normalizeSession(await callApi.accept(state.session.sessionId));
    sessionRef.current = session.sessionId;
    dispatch({ type: "CONNECTED", session });
  }), [run, state.session]);
  const rejectCall = useCallback(async () => {
    const session = state.session;
    sessionRef.current = null;
    dispatch({ type: "RESET" });
    if (session) {
      const closePromise = callApi.reject(session.sessionId)
        .catch((error) => {
          console.error("[Call] could not reject call after closing modal", error);
        })
        .finally(() => {
          pendingCloseRef.current = null;
        });
      pendingCloseRef.current = closePromise;
      await closePromise;
    }
  }, [state.session]);
  const cancelCall = useCallback(async () => {
    const session = state.session;
    sessionRef.current = null;
    dispatch({ type: "RESET" });
    if (session) {
      const request = session.isGroupCall
        ? callApi.reject(session.sessionId)
        : callApi.cancel(session.sessionId);
      const closePromise = request
        .catch((error) => {
          console.error("[Call] could not cancel call after closing modal", error);
        })
        .finally(() => {
          pendingCloseRef.current = null;
        });
      pendingCloseRef.current = closePromise;
      await closePromise;
    }
  }, [state.session]);
  const endCall = useCallback(async () => {
    const session = state.session;
    sessionRef.current = null;
    dispatch({ type: "RESET" });
    if (session) {
      const closePromise = callApi.leave(session.sessionId)
        .catch((error) => {
          console.error("[Call] could not end call after closing modal", error);
        })
        .finally(() => {
          pendingCloseRef.current = null;
        });
      pendingCloseRef.current = closePromise;
      await closePromise;
    }
  }, [state.session]);
  const resetCall = useCallback(() => { sessionRef.current = null; dispatch({ type: "RESET" }); }, []);

  return <CallContext.Provider value={{ state, startCall, acceptCall, rejectCall, cancelCall, endCall, resetCall }}>{children}</CallContext.Provider>;
}
export function useCall() {
  const value = useContext(CallContext);
  if (!value) throw new Error("useCall must be used inside CallProvider");
  return value;
}
