import { useCallback, useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import type { JoinStudySessionResponse } from "../types";
import {
  leaveStudySession,
  leaveStudySessionOnUnload,
} from "../../../services/StudySessionService";

interface StudySessionRoomProps {
  joinData: JoinStudySessionResponse;
  userName: string;
  userId: number;
  onLeave: (sessionId: number) => void;
}

async function safeDestroyZego(
  zego: any,
  requestLeave = true,
): Promise<void> {
  if (!zego) return;

  if (requestLeave) {
    try {
      if (typeof zego.hangUp === "function") {
        zego.hangUp();
      }
    } catch {}

    // Give Zego's leave event time to finish before destroying its singleton.
    await new Promise((resolve) => window.setTimeout(resolve, 300));
  }

  try {
    zego.destroy();
  } catch (err: any) {
    if (err instanceof TypeError && err.message?.includes("createSpan")) {
      console.warn(
        "[StudySessionRoom] Suppressed known ZegoCloud tracer error on destroy:",
        err.message,
      );
    } else {
      console.warn("[StudySessionRoom] Error during destroy:", err);
    }
  }
}

export function StudySessionRoom({
  joinData,
  userName,
  userId,
  onLeave,
}: StudySessionRoomProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zegoRef = useRef<any>(null);
  const initTimerRef = useRef<number | null>(null);
  const leaveApiCalledRef = useRef(false);
  const finishCalledRef = useRef(false);
  const requestedLeaveRef = useRef(false);
  const roomJoinedRef = useRef(false);
  const destroyingRef = useRef(false);
  const onLeaveRef = useRef(onLeave);
  const [roomError, setRoomError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const { roomId, sessionId, token } = joinData;

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  const notifyLeave = useCallback(async () => {
    if (leaveApiCalledRef.current) return;
    if (!Number.isFinite(userId) || userId <= 0) return;

    leaveApiCalledRef.current = true;

    try {
      await leaveStudySession(sessionId, userId);
    } catch {}
  }, [sessionId, userId]);

  const finishLeave = useCallback(async () => {
    if (finishCalledRef.current) return;
    finishCalledRef.current = true;
    await notifyLeave();
    onLeaveRef.current(sessionId);
  }, [notifyLeave, sessionId]);

  useEffect(() => {
    if (!containerRef.current) return;
    leaveApiCalledRef.current = false;
    finishCalledRef.current = false;
    requestedLeaveRef.current = false;
    roomJoinedRef.current = false;
    destroyingRef.current = false;
    setRoomError("");

    initTimerRef.current = window.setTimeout(() => {
      if (!containerRef.current || zegoRef.current) return;

      const appId = Number(process.env.REACT_APP_ZEGO_APP_ID);
      const zegoUserId = String(userId || localStorage.getItem("userId") || Date.now());

      if (!Number.isFinite(appId) || appId <= 0 || !token || !roomId) {
        setRoomError("Không thể tạo phòng học. Vui lòng thử lại sau.");
        return;
      }

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appId,
        token,
        roomId,
        zegoUserId,
        userName,
      );

      const zego = ZegoUIKitPrebuilt.create(kitToken);
      zegoRef.current = zego;

      zego.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        showPreJoinView: false,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showScreenSharingButton: true,
        showMyCameraToggleButton: true,
        showAudioVideoSettingsButton: true,
        onJoinRoom: () => {
          roomJoinedRef.current = true;
        },
        onLeaveRoom: () => {
          if (destroyingRef.current) return;
          if (!roomJoinedRef.current && !requestedLeaveRef.current) return;
          requestedLeaveRef.current = true;
          destroyingRef.current = true;
          const z = zegoRef.current;
          zegoRef.current = null;

          // Run outside Zego's callback to avoid re-entering its leave flow.
          window.setTimeout(() => {
            safeDestroyZego(z, false).finally(() => {
              void finishLeave();
            });
          }, 0);
        },
      });
    }, 0);

    const handlePageHide = () => {
      if (leaveApiCalledRef.current) return;
      if (!Number.isFinite(userId) || userId <= 0) return;
      if (!zegoRef.current && !roomJoinedRef.current) return;
      leaveApiCalledRef.current = true;
      leaveStudySessionOnUnload(sessionId, userId);
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);

      if (initTimerRef.current !== null) {
        window.clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }

      if (zegoRef.current) {
        const z = zegoRef.current;
        zegoRef.current = null;
        destroyingRef.current = true;
        void safeDestroyZego(z);
      }
    };
  }, [finishLeave, roomId, sessionId, token, userId, userName]);

  const handleLeave = () => {
    if (leaving || finishCalledRef.current) return;
    setLeaving(true);
    requestedLeaveRef.current = true;
    destroyingRef.current = true;

    const z = zegoRef.current;
    zegoRef.current = null;

    safeDestroyZego(z).finally(() => {
      void finishLeave();
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0b0f19]">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold text-white/80">
            Phòng học: {joinData.roomId}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLeave}
          disabled={leaving}
          className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
        >
          {leaving ? "Đang rời..." : "Rời phòng"}
        </button>
      </div>
      {roomError ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-white/10 p-5 text-center">
            <div className="text-sm font-semibold text-white">{roomError}</div>
            <button
              type="button"
              onClick={() => onLeave(joinData.sessionId)}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-100"
            >
              Quay lại lịch học
            </button>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="flex-1" />
      )}
    </div>
  );
}
