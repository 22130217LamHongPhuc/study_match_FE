
export type ReactionInterface = {
    messageID: number;
    emoji: string;
    currentUser: number;
}
export type ReactionDTO = {
    reactionId?: number
    messageID?: number
    messageId?: number
    senderId?: number
    emoji: string
}

export type ReactionData = {
    conversationId: number | null,
    message: ReactionDTO | null
}
