export type CallType = "AUDIO" | "VIDEO";
export type CallStatus =
  | "IDLE" | "CREATING" | "OUTGOING_RINGING" | "INCOMING_RINGING"
  | "CONNECTING" | "CONNECTED" | "ENDING" | "ENDED" | "REJECTED"
  | "CANCELLED" | "FAILED" | "EXPIRED";

export interface CallParticipant {
  userId: number;
  name: string;
  avatar?: string | null;
  isGroupCall?: boolean;
}

export interface CallSession {
  sessionId: number;
  conversationId: number;
  roomId: string;
  appId: number;
  token: string;
  tokenExpiredAt: number;
  userId: number;
  userName: string;
  callType: CallType;
  targetUserId?: number | null;
  caller?: CallParticipant;
  groupId?: number | null;
  groupName?: string | null;
  groupAvatar?: string | null;
  isGroupCall?: boolean;
  conversationType?: number | null;
}

export interface CallState {
  status: CallStatus;
  session: CallSession | null;
  incoming: CallParticipant | null;
  error: string | null;
  reason: string | null;
}

export const initialCallState: CallState = {
  status: "IDLE",
  session: null,
  incoming: null,
  error: null,
  reason: null,
};
