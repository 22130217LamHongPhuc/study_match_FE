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

async function safeDestroyZego(zego: any): Promise<void> {
  if (!zego) return;

  try {
    if (typeof zego.hangUp === "function") {
      await zego.hangUp();
    }
  } catch {}

  await new Promise((r) => setTimeout(r, 200));

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
  const leftRef = useRef(false);
  const leaveApiCalledRef = useRef(false);
  const [leaving, setLeaving] = useState(false);

  const notifyLeave = useCallback(async () => {
    if (leaveApiCalledRef.current) return;
    leaveApiCalledRef.current = true;
    if (!Number.isFinite(userId) || userId <= 0) return;

    try {
      await leaveStudySession(joinData.sessionId, userId);
    } catch {}
  }, [joinData.sessionId, userId]);

  const finishLeave = useCallback(async () => {
    await notifyLeave();
    onLeave(joinData.sessionId);
  }, [joinData.sessionId, notifyLeave, onLeave]);

  useEffect(() => {
    if (!containerRef.current) return;
    leftRef.current = false;
    leaveApiCalledRef.current = false;

    initTimerRef.current = window.setTimeout(() => {
      if (!containerRef.current || zegoRef.current || leftRef.current) return;

      const appId = Number(process.env.REACT_APP_ZEGO_APP_ID);
      const userId = String(localStorage.getItem("userId") || Date.now());

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appId,
        joinData.token,
        joinData.roomId,
        userId,
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
        onLeaveRoom: () => {
          leftRef.current = true;
          zegoRef.current = null;
          setTimeout(() => {
            finishLeave();
          }, 300);
        },
      });
    }, 0);

    const handlePageHide = () => {
      if (leaveApiCalledRef.current) return;
      leaveApiCalledRef.current = true;
      if (!Number.isFinite(userId) || userId <= 0) return;
      leaveStudySessionOnUnload(joinData.sessionId, userId);
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);

      if (initTimerRef.current !== null) {
        window.clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }

      if (!leftRef.current && zegoRef.current) {
        const z = zegoRef.current;
        zegoRef.current = null;
        leftRef.current = true;
        notifyLeave();
        safeDestroyZego(z);
      }
    };
  }, [finishLeave, joinData, notifyLeave, userId, userName]);

  const handleLeave = () => {
    if (leaving || leftRef.current) return;
    setLeaving(true);
    leftRef.current = true;

    const z = zegoRef.current;
    zegoRef.current = null;

    safeDestroyZego(z).finally(() => {
      finishLeave();
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
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
