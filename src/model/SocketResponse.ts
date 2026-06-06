import { MessageInterface } from "./Conversation"
import { ReactionData } from "./Reaction"
import { VideoCallInfo, VideoCallInviteData } from "./VideoCall"

export interface SocketData {
  conversationId: number;
  message: MessageInterface;
}

export interface MessageStatusData {
  conversationId: number;
  userId: number;
  status: "SENT" | "DELIVERED" | "SEEN";
  messageIds: number[];
  at: string;
}

export interface ReplyData {
  conversationId: number;
  message: MessageInterface;
  replyMessID: number;
  replyMess: MessageInterface;
}

export interface SocketResponse {
    event: string | null,
    data: SocketData | ReplyData | MessageStatusData | ReactionData | VideoCallInviteData | VideoCallInfo | null
}
