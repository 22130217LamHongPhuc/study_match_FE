import { Socket } from "dgram"
import WebSocketManager from "../socket/WebSocketManager"
import { SocketEvent } from "../enum/SocketEvent"
import { BASE_CHAT_SERVICE, SOCKET_SEND_MESSAGE } from "../config/BaseConfig"


export const sendText = (content: string, senderId: number, conversationId: number) => {

    let ws = WebSocketManager.getInstance()
    ws.connect().then(() => {
        ws.sendMessage(SOCKET_SEND_MESSAGE, {
            event: SocketEvent.SEND_CHAT,
            data: {
                conversationId: conversationId,
                senderId: senderId,
                type: "text",
                content: content,
            }
        })
    }).catch((err) => {
        console.error("Lỗi connect:", err);
    });

}


export const sendFirstMessage = (content: string, to: number) => {
    let ws = WebSocketManager.getInstance()
    ws.connect().then(() => {
        ws.sendMessage(SOCKET_SEND_MESSAGE, {
            event: SocketEvent.FIRST_PRIVATE_MESS,
            data: {
                senderId: 1,
                to: to,
                type: "text",
                content: content,
            }
        })
    }).catch((err) => {
        console.error("Lỗi connect:", err);
    });

}
export const loadConversation = async (currentU: number, targetU: number) => {
    const url = `${BASE_CHAT_SERVICE}/conversation?currentUser=${currentU}&targetUser=${targetU}&page=0`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    console.log(data);
    return data;

}

export function recallMess(conversationId: number, messageId: number) {
    let ws = WebSocketManager.getInstance()
    ws.connect().then(() => {
        ws.sendMessage(SOCKET_SEND_MESSAGE, {
            event: SocketEvent.MESSAGE_RECALL,
            data: {
                conversationID: conversationId,
                messageID: messageId,
            }
        })
    }).catch((err) => {
        console.error("Lỗi connect:", err);
    });

}


export async function uploadMedia(conversationID: string, file: File, content: string) {

    let url = `${BASE_CHAT_SERVICE}/messages/media`
    let formData = new FormData();
    let type = null;
    formData.append('conversationID', conversationID)
    formData.append('file', file)
    formData.append('type', file.type)
    formData.append('content', content)
    formData.append('fileName', file.name)
    let token = localStorage.getItem('accessToken')
    const response = await fetch(`${BASE_CHAT_SERVICE}/messages/media`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
}