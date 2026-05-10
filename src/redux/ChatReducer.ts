import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { MessageInterface } from "../model/Conversation";
import { SocketResponse } from '../model/SocketResponse'

interface DataState {
    conversationId: number | null,
    message: MessageInterface | null,
}
interface NewmessInterface {
    event: string | null,
    data: DataState | null
}

interface ChatState {

    currentConversationId: number | null,
    newMess: NewmessInterface | null
}

const initialState: ChatState = {
    currentConversationId: null,
    newMess: null
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
        }
    }
})

export const { updateNewMess, updateCurrentConverId } = chatReducer.actions
export default chatReducer.reducer