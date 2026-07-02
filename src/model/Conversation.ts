
import { ReactionDTO } from "./Reaction";

export type MessagePinnedValue = boolean | "Y" | "N";
export type MessageModerationStatus = "NONE" | "HATE" | string;


export type MessageInterface = {
    messageId: number,
    senderId: number,
    type: string,
    content: string,
    mediaURL: string | null,
    fileName: string | null,
    createAt?: string;
    createdAt?: string;
    status?: 'SENDING' | 'SENT' | 'DELIVERED' | 'SEEN';
    reactions?: ReactionDTO[];
    isDeleted?: boolean;
    moderationStatus?: MessageModerationStatus | null;
    isPinned?: MessagePinnedValue;
    pinned?: MessagePinnedValue;
    audioDurationSeconds?: number;
    durationSeconds?: number;
    replyToMessageId?: number | null;
    replyToSenderId?: number | null;
    replyToType?: string | null;
    replyToContent?: string | null;
    replyToMediaURL?: string | null;
    replyToFileName?: string | null;
    replyToDeleted?: boolean | null;
}


