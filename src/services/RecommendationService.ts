import { RECOMMEND_USERS_URL } from "../pages/StudyConnection/constants";
import {
  RecommendUsersApiResponse,
} from "../pages/StudyConnection/types";

export async function getRecommendedUsers(
  userId: number,
  page?: number,
  limit?: number,
): Promise<RecommendUsersApiResponse> {
  const pageParam = page !== undefined ? `&page=${page}` : "";
  const limitParam = limit !== undefined ? `&limit=${limit}` : "";
  const response = await fetch(`${RECOMMEND_USERS_URL}?user_id=${userId}${pageParam}${limitParam}`, {
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
