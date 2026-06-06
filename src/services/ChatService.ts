import WebSocketManager from "../socket/WebSocketManager"
import { SocketEvent } from "../enum/SocketEvent"
import { BASE_CHAT_SERVICE, SOCKET_SEND_MESSAGE } from "../config/BaseConfig"

export type MessageRequestItem = {
    conversationId: number;
    otherUserId: number;
    lastMessage?: {
        messageId: number;
        senderId: number;
        type: string;
        content: string | null;
        mediaURL?: string | null;
        fileName?: string | null;
        createdAt?: string;
        isDeleted?: boolean;
    } | null;
}


export const sendText = (content: string, conversationId: number) => {

    let ws = WebSocketManager.getInstance()
    ws.connect().then(() => {
        ws.sendMessage(SOCKET_SEND_MESSAGE, {
            event: SocketEvent.SEND_CHAT,
            data: {
                conversationId: conversationId,
                type: "text",
                content: content,
            }
        })
    }).catch((err) => {
        console.error("Lỗi connect:", err);
    });

}


export const replyText = (content: string, messageID: number, type: string) => {
    let ws = WebSocketManager.getInstance()
    ws.connect().then(() => {
        ws.sendMessage(SOCKET_SEND_MESSAGE, {
            event: SocketEvent.SEND_REPLY_MESSAGE,
            data: {
                type: type,
                messageID: messageID,
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
                senderId: Number(localStorage.getItem('userId')),
                to: to,
                type: "text",
                content: content,
            }
        })
    }).catch((err) => {
        console.error("Lỗi connect:", err);
    });

}
export const loadConversation = async (currentU: number, targetU: number, page: number = 0) => {
    const url = `${BASE_CHAT_SERVICE}/conversation?currentUser=${currentU}&targetUser=${targetU}&page=${page}`
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

export const loadGroupConversation = async (currentU: number, groupId: number, page: number = 0) => {
    const url = `${BASE_CHAT_SERVICE}/conversation/group?currentUser=${currentU}&groupId=${groupId}&page=${page}`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    return data;
}

export const loadConversationById = async (currentU: number, conversationId: number, page: number = 0) => {
    const url = `${BASE_CHAT_SERVICE}/conversation/by-id?currentUser=${currentU}&conversationId=${conversationId}&page=${page}`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    return data;
}

export const loadMessageRequests = async (currentUserId: number): Promise<MessageRequestItem[]> => {
    const url = `${BASE_CHAT_SERVICE}/conversation/message-requests?currentUser=${currentUserId}`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`Cannot load message requests. HTTP ${res.status}`);
    }

    const payload = await res.json();
    const data = payload?.data ?? payload?.result ?? payload;
    return Array.isArray(data) ? data : [];
}

export const loadAcceptedDirectConversations = async (currentUserId: number): Promise<MessageRequestItem[]> => {
    const url = `${BASE_CHAT_SERVICE}/conversation/accepted-direct?currentUser=${currentUserId}`
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`Cannot load accepted direct conversations. HTTP ${res.status}`);
    }

    const payload = await res.json();
    const data = payload?.data ?? payload?.result ?? payload;
    return Array.isArray(data) ? data : [];
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

export const sendSeen = (conversationId: number, messageIds: number[]) => {
    if (messageIds.length === 0) return Promise.resolve()

    let ws = WebSocketManager.getInstance()
    return ws.connect().then(() => {
        ws.sendMessage(SOCKET_SEND_MESSAGE, {
            event: SocketEvent.MESSAGE_SEEN,
            data: {
                conversationID: conversationId,
                messageIDs: messageIds,
            }
        })
    }).catch((err) => {
        console.error("Loi connect:", err);
        throw err
    });
}

export const sendDelivered = (conversationId: number, messageIds: number[]) => {
    if (messageIds.length === 0) return

    let ws = WebSocketManager.getInstance()
    ws.connect().then(() => {
        ws.sendMessage(SOCKET_SEND_MESSAGE, {
            event: SocketEvent.MESSAGE_DELIVERED,
            data: {
                conversationID: conversationId,
                messageIDs: messageIds,
            }
        })
    }).catch((err) => {
        console.error("Loi connect:", err);
    });
}
