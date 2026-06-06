export interface VideoCallInfo {
    sessionId: number
    conversationId: number
    appId: number
    roomId: string
    userId: number
    userName: string
    token: string
    tokenExpiredAt: number
    targetUserId?: number | null
    callType?: "AUDIO" | "VIDEO"
    isGroupCall?: boolean
    groupId?: number | null
    groupName?: string | null
    groupAvatar?: string | null
    conversationType?: number | null
}

export interface VideoCallInviteData {
    sessionId: number
    conversationId: number
    roomId: string
    callerId: number
    callerName?: string | null
    callerAvatar?: string | null
    callType?: "AUDIO" | "VIDEO"
    isGroupCall?: boolean
    groupId?: number | null
    groupName?: string | null
    groupAvatar?: string | null
    conversationType?: number | null
}

export interface VideoCallPeerInfo {
    userId?: number | null
    fullName: string
    avatar?: string | null
    isGroupCall?: boolean
}
