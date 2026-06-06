import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SocketResponse } from '../model/SocketResponse'

export interface GroupMemberProfile {
    userId: number
    user_id?: number
    id?: number
    fullName?: string | null
    full_name?: string | null
    name?: string | null
    username?: string | null
    avatarUrl?: string | null
    avatar_url?: string | null
    avatar?: string | null
    email?: string | null
}

interface ChatState {

    currentConversationId: number | null,
    newMess: SocketResponse | null,
    unreadByConversation: Record<number, number>
    groupMemberProfiles: Record<number, GroupMemberProfile>
}

const initialState: ChatState = {
    currentConversationId: null,
    newMess: null,
    unreadByConversation: {},
    groupMemberProfiles: {}
}

const chatReducer = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        updateCurrentConverId(state, action: PayloadAction<{ currentConversationId: number }>) {
            state.currentConversationId = action.payload.currentConversationId
        },
        updateNewMess(state, action: PayloadAction<SocketResponse>) {
            state.newMess = {
                event: action.payload.event,
                data: action.payload.data
            }
        },
        increaseUnread(state, action: PayloadAction<{ conversationId: number }>) {
            const conversationId = action.payload.conversationId
            state.unreadByConversation[conversationId] = (state.unreadByConversation[conversationId] || 0) + 1
        },
        clearUnread(state, action: PayloadAction<{ conversationId: number }>) {
            state.unreadByConversation[action.payload.conversationId] = 0
        },
        upsertGroupMemberProfiles(state, action: PayloadAction<GroupMemberProfile[]>) {
            action.payload.forEach((profile) => {
                const userId = Number(profile.userId ?? profile.user_id ?? profile.id)
                if (!Number.isFinite(userId) || userId <= 0) return
                state.groupMemberProfiles[userId] = {
                    ...state.groupMemberProfiles[userId],
                    ...profile,
                    userId,
                    fullName: profile.fullName ?? profile.full_name ?? profile.name ?? profile.username ?? state.groupMemberProfiles[userId]?.fullName ?? null,
                    avatarUrl: profile.avatarUrl ?? profile.avatar_url ?? profile.avatar ?? state.groupMemberProfiles[userId]?.avatarUrl ?? null,
                }
            })
        }
    }
})

export const { updateNewMess, updateCurrentConverId, increaseUnread, clearUnread, upsertGroupMemberProfiles } = chatReducer.actions
export default chatReducer.reducer
