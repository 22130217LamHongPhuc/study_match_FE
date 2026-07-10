import { RECOMMEND_USERS_URL } from "../pages/StudyConnection/constants";
import { RecommendUsersApiResponse } from "../pages/StudyConnection/types";
import { apiFetch } from "../config/apiClient";

export async function getRecommendedUsers(
  userId: number,
  page?: number,
  limit?: number,
): Promise<RecommendUsersApiResponse> {
  const pageParam = page !== undefined ? `&page=${page}` : "";
  const limitParam = limit !== undefined ? `&limit=${limit}` : "";
  
  const res = await apiFetch<any>(
    `${RECOMMEND_USERS_URL}?user_id=${userId}${pageParam}${limitParam}`,
    { method: "GET" }
  );

  if (!res || res.success === false) {
    const message =
      res?.message ||
      `Không tải được danh sách gợi ý.`;
    throw new Error(message);
  }

  return res as unknown as RecommendUsersApiResponse;
}
