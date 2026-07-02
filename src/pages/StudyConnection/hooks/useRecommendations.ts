import { useCallback, useEffect, useState } from "react";
import { STUDY_MODE_LABELS } from "../constants";
import { getRecommendedUsers } from "../../../services/RecommendationService";
import { RecommendationApiItem, RecommendationCardVm } from "../types";

function normalizeOptionalUserId(value: unknown): number | null {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
}

function mapToViewModel(item: RecommendationApiItem): RecommendationCardVm {
  const friendRequest = item.friend_request;

  return {
    userId: item.user_id,
    fullName: item.full_name ?? "Không xác định",
    studyGoal: item.study_goal,
    studyModeLabel: STUDY_MODE_LABELS[item.study_mode] ?? item.study_mode,
    avgScore: item.avg_score,
    studiedCredits: item.studied_credits,
    gender: item.gender,
    region: item.region,
    similarityScore: item.similarity_score,
    sharedSubjectScore: item.shared_subject_score,
    sharedSubjectCount: item.n_shared_subjects,
    finalScore: item.final_score,
    reasonText: item.reason_text ?? item.reasonText,
    matchPercentage: item.match_percentage,
    friendRequest: friendRequest
      ? {
          id: friendRequest.id,
          senderId: normalizeOptionalUserId(
            friendRequest.senderId ?? friendRequest.sender_id,
          ),
          receiverId: normalizeOptionalUserId(
            friendRequest.receiverId ?? friendRequest.receiver_id,
          ),
          status: friendRequest.status,
        }
      : null,
  };
}

export function useRecommendations(initialUserId: number) {
  console.log("Profile data in RecommendationPage:", initialUserId);

  const [userId, setUserId] = useState<number>(initialUserId);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [items, setItems] = useState<RecommendationCardVm[]>([]);

  const fetchRecommendations = useCallback(
    async (targetUserId?: number) => {
      if (targetUserId == null) {
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await getRecommendedUsers(targetUserId);

        if (!response.success) {
          throw new Error(response.message || "Không thể tạo danh sách gợi ý.");
        }

        const mapped = response.recommendations.map(mapToViewModel);
        mapped.sort((a: RecommendationCardVm, b: RecommendationCardVm) => b.matchPercentage - a.matchPercentage);


        console.log("Recommendations mapped: ", mapped);
        setItems(mapped);
        setMessage(response.message);
        setUserId(targetUserId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        setError(errorMessage);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchRecommendations(initialUserId);
  }, [fetchRecommendations, initialUserId]);

  return {
    loading,
    error,
    message,
    items,
    setUserId,
    fetchRecommendations,
  };
}
