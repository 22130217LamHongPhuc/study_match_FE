import { BASE_URL, BASE_USER_SERVICE } from "../config/BaseConfig";

export type FriendRequestResponse<T = unknown> = {
  code?: number | string;
  message?: string;
  data?: T;
  timestamp?: string;
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

  const url = `${BASE_URL}/social/friend-requests/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_id: senderId,
      receiver_id: targetUserId,
    }),
  });

  const data = await res.json().catch(() => null);

  console.log("Friend request response:", { status: res.status, data });
  if (data) {
    return data as FriendRequestResponse;
  }

  return {
    code: res.status,
    message: res.statusText,
    data: null,
    timestamp: new Date().toISOString(),
  };
};

export const loadProfileService = async (targetUserId: number) => {
  const user = localStorage.getItem("userId");
  const url =
    BASE_USER_SERVICE +
    `/users/friends/${user}/mutual?targetUserId=${targetUserId}`;
  console.log(url);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  console.log(data);
  return data;
};
