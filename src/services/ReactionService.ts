import { SOCKET_SEND_MESSAGE } from "../config/BaseConfig";
import { SocketEvent } from "../enum/SocketEvent";
import WebSocketManager from "../socket/WebSocketManager";



export async function submitReaction(emoji: string, messageID: number, conversationID: number) {
    console.log("Submitting reaction:", { emoji, messageID, conversationID });

    let ws = WebSocketManager.getInstance()
    ws.connect().then(() => {
        ws.sendMessage(SOCKET_SEND_MESSAGE, {
            event: SocketEvent.REACTION_ADD,
            data: {
                conversationID: conversationID,
                messageID: messageID,
                emoji: emoji
            }
        })
    }).catch((err) => {
        console.error("Lỗi connect:", err);
    });
}