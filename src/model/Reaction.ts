
export type ReactionInterface = {
    messageID: number;
    emoji: string;
    currentUser: number;
}
type ReactionDTO = {
    messageID: number
    emoji: string
}

export type ReactionData = {
    conversationId: number | null,
    message: ReactionDTO | null
}