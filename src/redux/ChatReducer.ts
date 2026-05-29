import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SocketResponse } from '../model/SocketResponse'

interface ChatState {

    currentConversationId: number | null,
    newMess: SocketResponse | null,
    unreadByConversation: Record<number, number>
}

const initialState: ChatState = {
    currentConversationId: null,
    newMess: null,
    unreadByConversation: {}
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
        }
    }
})

export const { updateNewMess, updateCurrentConverId, increaseUnread, clearUnread } = chatReducer.actions
export default chatReducer.reducer
