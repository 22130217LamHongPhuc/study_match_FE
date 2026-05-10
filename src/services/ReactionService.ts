import { BASE_CHAT_SERVICE } from "../config/BaseConfig";



export async function submitReaction(emoji: string, messageId: number, currentUser: number) {
    console.log("Submitting reaction:", { emoji, messageId, currentUser });
    const url = BASE_CHAT_SERVICE + '/messages/reaction'
    console.log(url)
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messageID: messageId,
            emoji: emoji,
            currentUser: currentUser
        })
    });
    return await res.json();

}