import { BASE_CHAT_SERVICE } from "../config/BaseConfig"
import { APIResponse } from "../model/APIResponse"
import { VideoCallInfo } from "../model/VideoCall"

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
})

const parseVideoCallResponse = async (response: Response): Promise<VideoCallInfo> => {
    console.log("[VideoCall][FE][response]", {
        url: response.url,
        status: response.status,
        ok: response.ok,
    })

    const body: APIResponse = await response.json().catch(() => ({
        code: response.status,
        message: "Video call request failed",
        data: null,
        timestamp: "",
    }))
    console.log("[VideoCall][FE][body]", body)

    if (!response.ok) {
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
    const token = localStorage.getItem("accessToken")
    console.log("[VideoCall][FE][start][request]", {
        url,
        conversationId,
        callerName,
        hasCallerAvatar: !!callerAvatar,
        callType,
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 12) : null,
    })

    let response: Response
    try {
        response = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ conversationId, callerName, callerAvatar, callType }),
        })
    } catch (error) {
        console.error("[VideoCall][FE][start][network-error]", {
            url,
            conversationId,
            error,
        })
        throw error
    }

    return parseVideoCallResponse(response)
}

export const joinVideoCall = async (sessionId: number): Promise<VideoCallInfo> => {
    const url = `${BASE_CHAT_SERVICE}/video-calls/${sessionId}/join`
    console.log("[VideoCall][FE][join][request]", {
        url,
        sessionId,
        hasToken: !!localStorage.getItem("accessToken"),
    })

    let response: Response
    try {
        response = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
        })
    } catch (error) {
        console.error("[VideoCall][FE][join][network-error]", {
            url,
            sessionId,
            error,
        })
        throw error
    }

    return parseVideoCallResponse(response)
}

export const endVideoCall = async (sessionId: number): Promise<void> => {
    const url = `${BASE_CHAT_SERVICE}/video-calls/${sessionId}/end`
    console.log("[VideoCall][FE][end][request]", {
        url,
        sessionId,
        hasToken: !!localStorage.getItem("accessToken"),
    })

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
        })
        console.log("[VideoCall][FE][end][response]", {
            status: response.status,
            ok: response.ok,
        })
    } catch (error) {
        console.error("[VideoCall][FE][end][network-error]", {
            url,
            sessionId,
            error,
        })
        throw error
    }
}

export const rejectVideoCall = async (sessionId: number): Promise<void> => {
    const url = `${BASE_CHAT_SERVICE}/video-calls/${sessionId}/reject`
    console.log("[VideoCall][FE][reject][request]", {
        url,
        sessionId,
        hasToken: !!localStorage.getItem("accessToken"),
    })

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
        })
        console.log("[VideoCall][FE][reject][response]", {
            status: response.status,
            ok: response.ok,
        })
    } catch (error) {
        console.error("[VideoCall][FE][reject][network-error]", {
            url,
            sessionId,
            error,
        })
        throw error
    }
}
