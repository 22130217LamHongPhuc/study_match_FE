import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { MessageInterface } from "../model/Conversation";



interface ChatState {
    currentConversationId: number | null,
    newMessage: MessageInterface | null
}

const initialState: ChatState = {
    currentConversationId: null,
    newMessage: null
}

const chatReducer = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        updateCurrentConversationID(state, action: PayloadAction<{ conversationId: number }>) {
            state.currentConversationId = action.payload.conversationId;
        },
        updateMessage(state, action: PayloadAction<{ message: MessageInterface }>) {
            state.newMessage = action.payload.message;
        }
    }
})

export const { updateCurrentConversationID, updateMessage } = chatReducer.actions
export default chatReducer.reducer