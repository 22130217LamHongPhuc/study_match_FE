import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { VideoCallInfo } from "../../model/VideoCall";

type CallFrameInitMessage = {
  type: "STUDYMATCH_CALL_INIT";
  call: VideoCallInfo;
  isGroupCall: boolean;
};

const postToParent = (type: string, data: Record<string, unknown> = {}) => {
  window.parent.postMessage({ type, ...data }, window.location.origin);
};

export default function CallFramePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const message = event.error instanceof Error
        ? event.error.message
        : String(event.message || event.error || "");
      if (message.includes("createSpan")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      postToParent("STUDYMATCH_CALL_ERROR", { message });
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason instanceof Error
        ? event.reason.message
        : String(event.reason || "");
      if (message.includes("createSpan")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      postToParent("STUDYMATCH_CALL_ERROR", { message });
    };
    const handleMessage = (event: MessageEvent<CallFrameInitMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== "STUDYMATCH_CALL_INIT" ||
        initializedRef.current ||
        !containerRef.current
      ) {
        return;
      }

      initializedRef.current = true;
      const { call, isGroupCall } = event.data;
      console.info("[CallFrame][create]", {
        sessionId: call.sessionId,
        roomId: call.roomId,
        isGroupCall,
      });
      try {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          call.appId,
          call.token,
          call.roomId,
          String(call.userId),
          call.userName || `user_${call.userId}`,
        );
        const zego = ZegoUIKitPrebuilt.create(kitToken);
        zego.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: isGroupCall
              ? ZegoUIKitPrebuilt.GroupCall
              : ZegoUIKitPrebuilt.OneONoneCall,
          },
          showPreJoinView: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: call.callType === "VIDEO",
          showScreenSharingButton: false,
          showMyCameraToggleButton: call.callType === "VIDEO",
          showAudioVideoSettingsButton: call.callType === "VIDEO",
          onJoinRoom: () => {
            console.info("[CallFrame][joined]", {
              sessionId: call.sessionId,
              roomId: call.roomId,
            });
            postToParent("STUDYMATCH_CALL_JOINED", {
              sessionId: call.sessionId,
            });
          },
          onLeaveRoom: () => {
            console.info("[CallFrame][leave]", {
              sessionId: call.sessionId,
              roomId: call.roomId,
            });
            postToParent("STUDYMATCH_CALL_LEAVE", {
              sessionId: call.sessionId,
            });
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        postToParent("STUDYMATCH_CALL_ERROR", {
          sessionId: call.sessionId,
          message,
        });
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);
    window.addEventListener("message", handleMessage);
    postToParent("STUDYMATCH_CALL_READY");

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#0b0f19",
        overflow: "hidden",
      }}
    />
  );
}
