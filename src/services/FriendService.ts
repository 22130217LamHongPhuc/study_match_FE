import { BASE_CHAT_SERVICE, BASE_SOCIAL_SERVICE, BASE_USER_SERVICE } from "../config/BaseConfig";

export interface FriendUser {
    userId: number;
    fullName: string;
    avatarUrl?: string | null;
    email?: string | null;
    online?: boolean;
}

type SocialFriendItem = {
    userId?: number;
    user_id?: number;
    fullName?: string | null;
    full_name?: string | null;
    avatarUrl?: string | null;
    avatar_url?: string | null;
    email?: string | null;
}

const readJson = async (res: Response) => {
    const text = await res.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

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
    const data = await readJson(res);
    console.log(data);
    return data;
}


export const loadProfileService = async (targetUserId: number) => {
    const user = localStorage.getItem('userId');
    const url = BASE_USER_SERVICE + `/users/friends/${user}/mutual?targetUserId=${targetUserId}`;
    console.log(url)
    const token = localStorage.getItem('accessToken');
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
    if (!res.ok) {
        throw new Error(`Cannot load profile. HTTP ${res.status}`);
    }

    const data = await readJson(res);
    console.log(data);
    return data;

}

const unwrapPayload = (payload: any) => payload?.data ?? payload?.result ?? payload;

export const loadFriendListService = async (userId?: number): Promise<FriendUser[]> => {
    const currentUserId = userId ?? Number(localStorage.getItem('userId'));
    if (!currentUserId) return [];

    const res = await fetch(BASE_SOCIAL_SERVICE + `/social/friends/${currentUserId}/list`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`Cannot load friends. HTTP ${res.status}`);
    }

    const payload = unwrapPayload(await readJson(res));
    if (!Array.isArray(payload)) return [];

    return (payload as SocialFriendItem[])
        .map((item) => ({
            userId: Number(item.userId ?? item.user_id),
            fullName: item.fullName ?? item.full_name ?? "",
            avatarUrl: item.avatarUrl ?? item.avatar_url ?? null,
            email: item.email ?? null,
        }))
        .filter((item) => Boolean(item.userId));
}

export const loadFriendProfilesService = async (friendIds: number[]): Promise<FriendUser[]> => {
    if (friendIds.length === 0) return [];

    const params = new URLSearchParams();
    friendIds.forEach((id) => params.append('ids', String(id)));

    const res = await fetch(BASE_USER_SERVICE + `/users/batch?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`Cannot load friend profiles. HTTP ${res.status}`);
    }

    const payload = unwrapPayload(await readJson(res));
    return Array.isArray(payload) ? payload : [];
}

export const loadFriendOnlineStatusesService = async (friendIds: number[]): Promise<Record<string, boolean>> => {
    if (friendIds.length === 0) return {};

    const params = new URLSearchParams({
        userIds: friendIds.join(",")
    });

    try {
        const res = await fetch(BASE_CHAT_SERVICE + `/messages/presence/online?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.error(`Cannot load online statuses. HTTP ${res.status}`);
            return {};
        }

        return unwrapPayload(await readJson(res)) ?? {};
    } catch (err) {
        console.error(err);
        return {};
    }
}

export const loadAllFriendsService = async (): Promise<FriendUser[]> => {
    const friends = await loadFriendListService();
    const friendIds = friends.map((friend) => friend.userId);
    const onlineStatuses = await loadFriendOnlineStatusesService(friendIds);
    return friends.map((friend) => ({
        ...friend,
        online: Boolean(onlineStatuses[String(friend.userId)])
    }));
}
