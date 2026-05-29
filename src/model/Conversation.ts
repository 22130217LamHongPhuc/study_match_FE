


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
}


