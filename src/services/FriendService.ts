import { BASE_CHAT_SERVICE, BASE_USER_SERVICE, BASE_URL } from "../config/BaseConfig";
import { FriendRequestStatus } from "../pages/StudyConnection/types";
import WebSocketManager from "../socket/WebSocketManager";
import { apiFetch, isApiSuccess } from "../config/apiClient";

export interface FriendUser {
    userId: number;
    fullName: string;
    avatarUrl?: string | null;
    online?: boolean;
    email?: string | null;
}

type SocialFriendItem = {
    userId?: number;
    user_id?: number;
    fullName?: string | null;
    full_name?: string | null;
    avatarUrl?: string | null;
    avatarURL?: string | null;
    avatar_url?: string | null;
    avatar?: string | null;
    imageUrl?: string | null;
    image_url?: string | null;
    profileImageUrl?: string | null;
    profile_image_url?: string | null;
    picture?: string | null;
    pictureUrl?: string | null;
    picture_url?: string | null;
    email?: string | null;
}

export const getFriendsListService = async (
    userId?: number,
): Promise<FriendsListResponse> => {
    const resolvedUserId = userId ?? Number(localStorage.getItem("userId"));

    if (!Number.isFinite(resolvedUserId)) {
        throw new Error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
    }

    const res = await apiFetch<FriendListItem[]>(
        `/social/friends/${resolvedUserId}/list`,
        { method: "GET" },
        BASE_URL
    );

    return {
        code: res.code,
        message: res.message,
        data: res.data || [],
        timestamp: new Date().toISOString(),
    } as any;
};

export type FriendRequestResponse<T = unknown> = {
    code?: number | string;
    message?: string;
    data?: T;
    timestamp?: string;
};

export type UpdateFriendRequestStatusResponse<T = unknown> =
    FriendRequestResponse<T>;

export type FriendListItem = {
    user_id: number;
    full_name: string;
    avatar_url: string | null;
};

export const requestFriendService = async (
    targetUserId: number,
): Promise<FriendRequestResponse> => {
    const senderId = Number(localStorage.getItem("userId"));

    if (!Number.isFinite(senderId)) {
        throw new Error(
            "Không tìm thấy thông tin người gửi. Vui lòng đăng nhập lại.",
        );
    }

    const res = await apiFetch<any>(
        `/social/friend-requests/`,
        {
            method: "POST",
            body: JSON.stringify({
                sender_id: senderId,
                receiver_id: targetUserId,
            }),
        },
        BASE_URL
    );

    if (res.success) {
        try {
            WebSocketManager.getInstance().sendMessage("/chat/send", {
                event: "FRIEND_REQUEST",
                data: {
                    senderId: senderId,
                    receiverId: targetUserId
                }
            });
        } catch (err) {
            console.error("Failed to send real-time socket friend request notification", err);
        }
    }

    return {
        code: res.code,
        message: res.message,
        data: res.data,
        timestamp: new Date().toISOString(),
    } as any;
};

export const updateFriendRequestStatusService = async (
    requestId: number,
    status: FriendRequestStatus,
): Promise<UpdateFriendRequestStatusResponse> => {
    const res = await apiFetch<any>(
        `/social/friend-requests/${requestId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({ status }),
        },
        BASE_URL
    );

    return {
        code: res.code,
        message: res.message,
        data: res.data,
        timestamp: new Date().toISOString(),
    } as any;
};

export const updateFriendRequestStatusBySenderAndReceiverService = async (
    sender_id: number,
    receiver_id: number,
    status: FriendRequestStatus,
): Promise<UpdateFriendRequestStatusResponse> => {
    const res = await apiFetch<any>(
        `/social/friend-requests/sender/${sender_id}/receiver/${receiver_id}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({ status }),
        },
        BASE_URL
    );

    return {
        code: res.code,
        message: res.message,
        data: res.data,
        timestamp: new Date().toISOString(),
    } as any;
};

const mapProfileDto = (raw: any) => ({
    fullName: raw?.fullName ?? raw?.full_name ?? "",
    avatarUrl: raw?.avatarUrl ?? raw?.avatar_url ?? "",
    bannerUrl: raw?.bannerUrl ?? raw?.banner_url ?? undefined,
    bio: raw?.bio ?? "",
    mutualFriend: Number(raw?.mutualFriend ?? raw?.mutualFriends ?? 0),
    numberFriend: Number(raw?.numberFriend ?? raw?.numberFriends ?? 0),
    statusFriend: raw?.statusFriend ?? raw?.status_friend,
    friend: Boolean(raw?.friend ?? raw?.isFriend),
});

export const loadProfileService = async (targetUserId: number) => {
    const user = localStorage.getItem('userId');
    // BE returns ProfileDto directly, not {success,data}
    const res: any = await apiFetch<any>(
        `/users/friends/${user}/mutual?targetUserId=${targetUserId}`,
        { method: 'GET' },
        BASE_USER_SERVICE
    );
    if (res == null) {
        throw new Error("Cannot load profile.");
    }
    if (typeof res.success === "boolean") {
        if (!res.success) throw new Error(`Cannot load profile. ${res.message ?? ""}`);
        return res.data ?? mapProfileDto(res);
    }
    if (
        res.fullName !== undefined ||
        res.full_name !== undefined ||
        res.avatarUrl !== undefined ||
        res.friend !== undefined ||
        res.isFriend !== undefined
    ) {
        return mapProfileDto(res);
    }
    throw new Error(`Cannot load profile. ${res.message ?? "undefined"}`);
}

export const updateUserProfileService = async (
    userId: number,
    payload: { fullName: string; bio: string; avatarUrl?: string | null; bannerUrl?: string | null },
) => {
    const res: any = await apiFetch<any>(
        `/users/${userId}/profile`,
        {
            method: 'PUT',
            body: JSON.stringify(payload)
        },
        BASE_USER_SERVICE
    );
    if (res == null) throw new Error("Cannot update profile.");
    if (typeof res.success === "boolean") {
        if (!res.success) throw new Error(`Cannot update profile. ${res.message ?? ""}`);
        return res.data ?? mapProfileDto(res);
    }
    if (res.fullName !== undefined || res.avatarUrl !== undefined) {
        return mapProfileDto(res);
    }
    throw new Error(`Cannot update profile. ${res.message ?? ""}`);
}

const unwrapPayload = (payload: any) => payload?.data ?? payload?.result ?? payload;

export const normalizeAvatarUrl = (value?: string | null): string | null => {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
        return trimmed;
    }
    return `${BASE_USER_SERVICE}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

const normalizeFriendUser = (item: any): FriendUser => ({
    userId: Number(item?.userId ?? item?.user_id ?? item?.id),
    fullName: item?.fullName ?? item?.full_name ?? item?.name ?? item?.username ?? "",
    avatarUrl: normalizeAvatarUrl(
        item?.avatarUrl ??
        item?.avatarURL ??
        item?.avatar_url ??
        item?.avatar ??
        item?.imageUrl ??
        item?.image_url ??
        item?.profileImageUrl ??
        item?.profile_image_url ??
        item?.pictureUrl ??
        item?.picture_url ??
        item?.picture ??
        null
    ),
    email: item?.email ?? null,
})

export const loadFriendListService = async (userId?: number): Promise<FriendUser[]> => {
    const currentUserId = userId ?? Number(localStorage.getItem('userId'));
    if (!currentUserId) return [];

    const res = await apiFetch<any>(
        `/social/friends/${currentUserId}/list`,
        { method: 'GET' },
        BASE_URL
    );

    if (!isApiSuccess(res)) return [];

    const payload = unwrapPayload(res.data !== undefined ? res.data : res);
    if (!Array.isArray(payload)) return [];

    return (payload as SocialFriendItem[])
        .map(normalizeFriendUser)
        .filter((item) => Boolean(item.userId));
}

export const loadFriendProfilesService = async (friendIds: number[]): Promise<FriendUser[]> => {
    if (friendIds.length === 0) return [];

    const params = new URLSearchParams();
    friendIds.forEach((id) => params.append('ids', String(id)));

    const res = await apiFetch<any>(
        `/users/batch?${params.toString()}`,
        { method: 'GET' },
        BASE_USER_SERVICE
    );

    if (!res.success || !res.data) return [];

    const payload = unwrapPayload(res.data);
    if (!Array.isArray(payload)) return [];

    return payload
        .map(normalizeFriendUser)
        .filter((item) => Boolean(item.userId));
}

export const loadFriendOnlineStatusesService = async (friendIds: number[]): Promise<Record<string, boolean>> => {
    if (friendIds.length === 0) return {};

    const params = new URLSearchParams({
        userIds: friendIds.join(",")
    });

    try {
        const res = await apiFetch<any>(
            `/messages/presence/online?${params.toString()}`,
            { method: 'GET' },
            BASE_CHAT_SERVICE
        );

        // chat_service returns the status map directly:
        // { "12": true, "18": false }, not the shared API envelope.
        const payload = isApiSuccess(res)
            ? unwrapPayload(res.data !== undefined ? res.data : res)
            : res;
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            console.error("Cannot load online statuses: invalid response", res);
            return {};
        }

        return Object.fromEntries(
            Object.entries(payload).map(([userId, online]) => [String(userId), online === true])
        );
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

export interface FriendRequestDto {
    id: number;
    senderId: number;
    receiverId: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
    createdAt?: string;
    updatedAt?: string;
}

export interface AllFriendRequestsDto {
    sent: FriendRequestDto[];
    received: FriendRequestDto[];
}

export type FriendsListResponse = FriendRequestResponse<FriendListItem[]>;

export const loadFriendRequestsService = async (
    userId?: number,
): Promise<AllFriendRequestsDto> => {
    const currentUserId = userId ?? Number(localStorage.getItem('userId'));
    if (!currentUserId) return { sent: [], received: [] };

    const res = await apiFetch<any>(
        `/social/friend-requests/${currentUserId}?size=100`,
        { method: 'GET' },
        BASE_URL
    );

    if (!isApiSuccess(res)) {
        throw new Error(`Cannot load friend requests. ${res.message ?? ""}`);
    }

    const payload = unwrapPayload(res.data !== undefined ? res.data : res);
    return {
        sent: Array.isArray(payload?.sent) ? payload.sent : [],
        received: Array.isArray(payload?.received) ? payload.received : [],
    };
}

export const unfriendService = async (
    userId: number,
    friendId: number,
): Promise<FriendRequestResponse> => {
    const res = await apiFetch<any>(
        `/social/friends/unfriend?userId=${userId}&friendId=${friendId}`,
        { method: "DELETE" },
        BASE_URL
    );

    return {
        code: res.code,
        message: res.message,
        data: res.data,
        timestamp: new Date().toISOString(),
    } as any;
};

export interface FriendStatsResponse {
    friendCount: number;
    pendingReceivedRequestCount: number;
}

export const getFriendStatsService = async (
    userId?: number,
): Promise<FriendRequestResponse<FriendStatsResponse>> => {
    const resolvedUserId = userId ?? Number(localStorage.getItem("userId"));

    if (!Number.isFinite(resolvedUserId)) {
        throw new Error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
    }

    const res = await apiFetch<FriendStatsResponse>(
        `/social/friends/${resolvedUserId}/stats`,
        { method: "GET" },
        BASE_URL
    );

    return {
        code: res.code,
        message: res.message,
        data: res.data || { friendCount: 0, pendingReceivedRequestCount: 0 },
        timestamp: new Date().toISOString(),
    } as any;
};

export const skipUserService = async (
    userId: number,
    skippedUserId: number,
): Promise<FriendRequestResponse> => {
    const res = await apiFetch<any>(
        `/social/friends/skip?userId=${userId}&skippedUserId=${skippedUserId}`,
        { method: "POST" },
        BASE_URL
    );

    return {
        code: res.code,
        message: res.message,
        data: res.data,
        timestamp: new Date().toISOString(),
    } as any;
};
