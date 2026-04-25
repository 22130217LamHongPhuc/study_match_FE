import { BASE_SOCIAL_SERVICE, BASE_URL, BASE_USER_SERVICE } from "../config/BaseConfig";
export const requestFriendService = async (targetUserId: number) => {
    const url = BASE_SOCIAL_SERVICE + '/social/friend-requests/'
    console.log(url)
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sender_id: localStorage.getItem('userId'),
            receiver_id: targetUserId
        })
    });
    const data = await res.json();
    console.log(data);
    return data;
}


export const loadProfileService = async (targetUserId: number) => {
    const user = localStorage.getItem('userId');
    const url = BASE_USER_SERVICE + `/users/friends/${user}/mutual?targetUserId=${targetUserId}`;
    console.log(url)
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