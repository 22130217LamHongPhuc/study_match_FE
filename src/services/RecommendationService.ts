import { RECOMMEND_USERS_URL } from "../pages/StudyConnection/constants";
import {
  RecommendUserRequest,
  RecommendUsersApiResponse,
} from "../pages/StudyConnection/types";

export async function getRecommendedUsers(
  userId: number,
): Promise<RecommendUsersApiResponse> {
  const response = await fetch(`${RECOMMEND_USERS_URL}?user_id=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message =
      errorPayload?.message ||
      `Không tải được danh sách gợi ý. HTTP ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return (await response.json()) as RecommendUsersApiResponse;
}
