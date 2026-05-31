import { MessageInterface } from "./Conversation";
import { VideoCallInfo, VideoCallInviteData } from "./VideoCall";

export interface StudySessionReminderData {
  conversationId: number;
  sessionId: number;
  title: string;
  startTime: string;
  endTime?: string | null;
  groupName?: string | null;
  subjectName?: string | null;
  studyMode?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
  minutesBefore?: number | null;
  recipientName?: string | null;
}

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
  event: string | null;
  data:
    | SocketData
    | ReplyData
    | MessageStatusData
    | VideoCallInviteData
    | VideoCallInfo
    | StudySessionReminderData
    | null;
}
