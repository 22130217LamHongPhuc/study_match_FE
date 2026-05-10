import { MessageInterface } from "./Conversation"

export interface SocketData {
    conversationId: number,
    message: MessageInterface
}


export interface SocketResponse {
    event: string | null,
    data: SocketData | null
}