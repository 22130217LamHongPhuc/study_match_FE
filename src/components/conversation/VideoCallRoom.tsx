import React, { useEffect, useMemo, useRef, useState } from "react"
import { Avatar, Box, Button, Modal, Typography } from "@mui/material"
import CallEndIcon from "@mui/icons-material/CallEnd"
import MicIcon from "@mui/icons-material/Mic"
import CloseIcon from "@mui/icons-material/Close"
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"
import { VideoCallInfo, VideoCallPeerInfo } from "../../model/VideoCall"
import { endVideoCall } from "../../services/VideoCallService"

interface VideoCallRoomProps {
    call: VideoCallInfo
    peer?: VideoCallPeerInfo | null
    onClose: () => void
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const rest = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`
}

const isZegoCreateSpanError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error || "")
    return message.includes("createSpan")
}

async function safeDestroyZego(zego: any): Promise<void> {
    if (!zego) return

    try {
        if (typeof zego.hangUp === "function") {
            await zego.hangUp()
        }
    } catch { }

    await new Promise((resolve) => window.setTimeout(resolve, 200))

    try {
        zego.destroy?.()
    } catch (error) {
        if (isZegoCreateSpanError(error)) {
            console.warn("[VideoCallRoom] Suppressed known ZegoCloud tracer error on destroy")
            return
        }
        console.warn("[VideoCallRoom] Cannot destroy ZEGO room", error)
    }
}

export default function VideoCallRoom({ call, peer, onClose }: VideoCallRoomProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const zegoRef = useRef<any>(null)
    const initTimerRef = useRef<number | null>(null)
    const leftRef = useRef(false)
    const [duration, setDuration] = useState(0)
    const [ending, setEnding] = useState(false)

    const displayPeer = useMemo(() => {
        if (peer) return peer

        try {
            const raw = localStorage.getItem(`videoCallPeer:${call.sessionId}`)
            return raw ? JSON.parse(raw) as VideoCallPeerInfo : null
        } catch {
            return null
        }
    }, [call.sessionId, peer])

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setDuration((prev) => prev + 1)
        }, 1000)
        return () => window.clearInterval(intervalId)
    }, [])

    useEffect(() => {
        const handleWindowError = (event: ErrorEvent) => {
            if (isZegoCreateSpanError(event.error || event.message)) {
                event.preventDefault()
                event.stopImmediatePropagation()
                console.warn("[VideoCallRoom] Suppressed known ZegoCloud tracer runtime error")
            }
        }

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (isZegoCreateSpanError(event.reason)) {
                event.preventDefault()
                event.stopImmediatePropagation()
                console.warn("[VideoCallRoom] Suppressed known ZegoCloud tracer promise rejection")
            }
        }

        window.addEventListener("error", handleWindowError, true)
        window.addEventListener("unhandledrejection", handleUnhandledRejection, true)

        return () => {
            window.removeEventListener("error", handleWindowError, true)
            window.removeEventListener("unhandledrejection", handleUnhandledRejection, true)
        }
    }, [])

    useEffect(() => {
        leftRef.current = false
        if (!containerRef.current) {
            return
        }

        initTimerRef.current = window.setTimeout(() => {
            if (!containerRef.current || zegoRef.current || leftRef.current) return

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
                call.appId,
                call.token,
                call.roomId,
                String(call.userId),
                call.userName || `user_${call.userId}`
            )
            const zego = ZegoUIKitPrebuilt.create(kitToken)
            zegoRef.current = zego

            const isGroupCall = Boolean(call.isGroupCall || displayPeer?.isGroupCall || call.conversationType === 0 || call.groupId)

            try {
                zego.joinRoom({
                    container: containerRef.current,
                    scenario: {
                        mode: isGroupCall ? ZegoUIKitPrebuilt.GroupCall : ZegoUIKitPrebuilt.OneONoneCall,
                    },
                    showPreJoinView: false,
                    turnOnMicrophoneWhenJoining: true,
                    turnOnCameraWhenJoining: call.callType === "VIDEO",
                    showScreenSharingButton: false,
                    showMyCameraToggleButton: call.callType === "VIDEO",
                    showAudioVideoSettingsButton: call.callType === "VIDEO",
                    onLeaveRoom: () => {
                        if (leftRef.current) return
                        leftRef.current = true
                        zegoRef.current = null
                        endVideoCall(call.sessionId).finally(onClose)
                    },
                })
            } catch (error) {
                if (isZegoCreateSpanError(error)) {
                    console.warn("[VideoCallRoom] Suppressed known ZegoCloud tracer error on join")
                    return
                }
                throw error
            }
        }, 0)

        return () => {
            if (initTimerRef.current !== null) {
                window.clearTimeout(initTimerRef.current)
                initTimerRef.current = null
            }

            if (!leftRef.current && zegoRef.current) {
                const zego = zegoRef.current
                zegoRef.current = null
                leftRef.current = true
                safeDestroyZego(zego)
            }
        }
    }, [call, displayPeer, onClose])

    const closeCall = () => {
        if (ending || leftRef.current) return
        setEnding(true)
        leftRef.current = true

        const zego = zegoRef.current
        zegoRef.current = null

        safeDestroyZego(zego).finally(() => {
            endVideoCall(call.sessionId).finally(onClose)
        })
    }

    if (call.callType === "VIDEO") {
        return (
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 2000,
                    bgcolor: "#0b0f19",
                }}
            >
                <Button
                    onClick={closeCall}
                    disabled={ending}
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
                <Box ref={containerRef} sx={{ width: "100%", height: "100%" }} />
            </Box>
        )
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
                        position: "absolute",
                        width: 1,
                        height: 1,
                        opacity: 0,
                        pointerEvents: "none",
                        overflow: "hidden",
                    }}
                >
                    <Box ref={containerRef} sx={{ width: 1, height: 1 }} />
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
                        }}
                    />
                    <Typography sx={{ fontSize: 21, fontWeight: 700, color: "#111827" }}>
                        {displayPeer?.fullName }
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
                        <Box component="span">Dang goi thoai</Box>
                    </Box>
                    <Typography sx={{ mt: 0.75, fontSize: 14, color: "#64748b" }}>
                        {formatDuration(duration)}
                    </Typography>

                    <Button
                        onClick={closeCall}
                        disabled={ending}
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
    )
}
