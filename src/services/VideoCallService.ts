import { BASE_CHAT_SERVICE } from "../config/BaseConfig"
import { apiFetch } from "../config/apiClient"
import { VideoCallInfo } from "../model/VideoCall"

const parseVideoCallResponse = (body: any): VideoCallInfo => {
    console.log("[VideoCall][FE][body]", body)

    if (!body.success) {
        throw new Error(body.message || "Video call request failed")
    }

    return body.data as VideoCallInfo
}

export const startVideoCall = async (
    conversationId: number,
    callerName?: string | null,
    callerAvatar?: string | null,
    callType: "AUDIO" | "VIDEO" = "AUDIO"
): Promise<VideoCallInfo> => {
    const url = `${BASE_CHAT_SERVICE}/video-calls/start`
    console.log("[VideoCall][FE][start][request]", {
        url,
        conversationId,
        callerName,
        hasCallerAvatar: !!callerAvatar,
        callType,
    })

    const response = await apiFetch<any>(url, {
        method: "POST",
        body: JSON.stringify({ conversationId, callerName, callerAvatar, callType }),
    })

    return parseVideoCallResponse(response)
}

export const joinVideoCall = async (sessionId: number): Promise<VideoCallInfo> => {
    const url = `${BASE_CHAT_SERVICE}/video-calls/${sessionId}/join`
    console.log("[VideoCall][FE][join][request]", {
        url,
        sessionId,
    })

    const response = await apiFetch<any>(url, {
        method: "POST",
    })

    return parseVideoCallResponse(response)
}

export const endVideoCall = async (sessionId: number): Promise<void> => {
    const url = `${BASE_CHAT_SERVICE}/video-calls/${sessionId}/end`
    console.log("[VideoCall][FE][end][request]", {
        url,
        sessionId,
    })

    const response = await apiFetch<any>(url, {
        method: "POST",
    })
    console.log("[VideoCall][FE][end][response]", response)
}

export const rejectVideoCall = async (sessionId: number): Promise<void> => {
    const url = `${BASE_CHAT_SERVICE}/video-calls/${sessionId}/reject`
    console.log("[VideoCall][FE][reject][request]", {
        url,
        sessionId,
    })

    const response = await apiFetch<any>(url, {
        method: "POST",
    })
    console.log("[VideoCall][FE][reject][response]", response)
}

export const cancelVideoCall = async (sessionId: number): Promise<void> => {
    const url = `${BASE_CHAT_SERVICE}/video-calls/${sessionId}/cancel`
    const response = await apiFetch<any>(url, { method: "POST" })
    console.log("[VideoCall][FE][cancel][response]", response)
    if (!response?.success && !(typeof response?.code === "number" && response.code >= 200 && response.code < 300)) {
        throw new Error(response?.message || "Không thể hủy cuộc gọi")
    }
}
