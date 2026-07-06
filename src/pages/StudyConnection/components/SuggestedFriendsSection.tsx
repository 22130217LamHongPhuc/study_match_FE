import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import RecommendationCard from "./RecommendationCard";
import RejectRecommendationModal, {
  RejectRecommendationSubmitValue,
} from "./RejectRecommendationModal";
import { useRecommendations } from "../hooks/useRecommendations";
import {
  FriendRequestVm,
  RecommendationCardVm,
  RecommendationSecondaryAction,
} from "../types";
import { RootState } from "../../../redux/store";
import { matchingItemApi } from "../../../services/matchingItemApi";
import {
  requestFriendService,
  updateFriendRequestStatusBySenderAndReceiverService,
} from "../../../services/FriendService";
import { LoadingState, EmptyState } from "./SharedStates";
import { SuggestedStudentSkeleton } from "../../../components/home/SuggestedStudents";

function isSuccessCode(code: number | string | undefined) {
  const responseCode = Number(code);
  return responseCode >= 200 && responseCode < 300;
}

function buildRejectReasonText({
  selectedReasons,
  note,
}: RejectRecommendationSubmitValue) {
  const lines = ["Lý do từ chối:"];

  selectedReasons.forEach((reason) => {
    lines.push(`- ${reason}`);
  });

  if (note.trim()) {
    lines.push(`Ghi chú thêm: ${note.trim()}`);
  }

  return lines.join("\n");
}

export default function SuggestedFriendsSection() {
  const profileVm = useSelector((state: RootState) => state.profile.profileVm);
  const navigate = useNavigate();

  const currentUserId =
    profileVm?.userId ?? Number(localStorage.getItem("userId") ?? 0);

  const { loading, loadingMore, error, items, page, totalPages, fetchRecommendations } =
    useRecommendations(currentUserId);

  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);
  const [acceptingRequestId, setAcceptingRequestId] = useState<number | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RecommendationCardVm | null>(null);
  const [rejectActionStatus, setRejectActionStatus] = useState<"REJECTED" | "SKIPPED">("REJECTED");
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<number[]>([]);

  const visibleItems = useMemo(
    () => items.filter((item) => !dismissedRecommendationIds.includes(item.userId)),
    [dismissedRecommendationIds, items],
  );

  const handleViewProfile = useCallback(
    (recommendation: RecommendationCardVm) => {
      navigate(`/profile/${recommendation.userId}`, {
        state: {
          fromRecommendation: true,
          finalScore: recommendation.finalScore,
          reasonText: recommendation.reasonText,
        },
      });
    },
    [navigate],
  );

  const handleCloseRejectModal = useCallback(() => {
    if (rejectingUserId !== null) return;
    setRejectTarget(null);
  }, [rejectingUserId]);

  const handleConnect = useCallback(
    async (targetUserId: number) => {
      if (!currentUserId) {
        toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      if (currentUserId === targetUserId) {
        toast.error("Bạn không thể gửi lời mời cho chính mình.");
        return;
      }

      if (connectingUserId === targetUserId) return;

      setConnectingUserId(targetUserId);

      try {
        const response = await requestFriendService(targetUserId);

        if (isSuccessCode(response.code)) {
          try {
            await matchingItemApi.updateStatus({
              userId: currentUserId,
              recommendedUserId: targetUserId,
              actionStatus: "FRIEND_REQUEST_SENT",
              finalScore: items.find((item) => item.userId === targetUserId)?.finalScore,
            });
          } catch (trackingError) {
            console.error("Track matching FRIEND_REQUEST_SENT failed", trackingError);
          }

          toast.success("Đã gửi lời mời kết bạn.");

          try {
            await fetchRecommendations(currentUserId);
          } catch (refreshError) {
            console.error("Cannot refresh recommendations", refreshError);
          }

          return;
        }

        toast.error(response.message || "Gửi lời mời kết bạn thất bại.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setConnectingUserId((prev) => (prev === targetUserId ? null : prev));
      }
    },
    [connectingUserId, currentUserId, fetchRecommendations, items],
  );

  const handleAcceptFriendRequest = useCallback(
    async (request: FriendRequestVm) => {
      const requestId = request.id;
      const senderId = request.senderId;
      const receiverId = request.receiverId;

      if (!currentUserId || !senderId || !receiverId) return;
      if (currentUserId === senderId) return;
      if (acceptingRequestId === requestId) return;

      setAcceptingRequestId(requestId);

      try {
        const response = await updateFriendRequestStatusBySenderAndReceiverService(
          senderId,
          receiverId,
          "APPROVED",
        );

        if (isSuccessCode(response.code)) {
          try {
            await matchingItemApi.updateStatus({
              userId: currentUserId,
              recommendedUserId: senderId,
              actionStatus: "ACCEPTED",
              finalScore: items.find((item) => item.userId === senderId)?.finalScore,
            });
          } catch (trackingError) {
            console.error("Track matching ACCEPTED failed", trackingError);
          }

          toast.success("Đã chấp nhận lời mời kết bạn.");

          try {
            await fetchRecommendations(currentUserId);
          } catch (refreshError) {
            console.error("Cannot refresh recommendations", refreshError);
          }

          return;
        }

        toast.error(response.message || "Chấp nhận lời mời thất bại.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setAcceptingRequestId((prev) => (prev === requestId ? null : prev));
      }
    },
    [acceptingRequestId, currentUserId, fetchRecommendations, items],
  );

  const handleCancelFriendRequest = useCallback(
    async (recommendation: RecommendationCardVm) => {
      const friendRequest = recommendation.friendRequest;
      const targetUserId = recommendation.userId;

      if (!currentUserId) {
        toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      if (
        !friendRequest?.senderId ||
        !friendRequest?.receiverId ||
        friendRequest.status !== "FRIEND_REQUEST_SENT" ||
        friendRequest.senderId !== currentUserId
      ) {
        return;
      }

      if (rejectingUserId === targetUserId) return;

      setRejectingUserId(targetUserId);

      try {
        const response = await updateFriendRequestStatusBySenderAndReceiverService(
          friendRequest.senderId,
          friendRequest.receiverId,
          "REJECTED",
        );

        if (!isSuccessCode(response.code)) {
          throw new Error(response.message || "Không thể hủy lời mời kết bạn.");
        }

        toast.success("Đã hủy lời mời kết bạn.");

        try {
          await fetchRecommendations(currentUserId);
        } catch (refreshError) {
          console.error("Cannot refresh recommendations", refreshError);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setRejectingUserId((prev) => (prev === targetUserId ? null : prev));
      }
    },
    [currentUserId, fetchRecommendations, rejectingUserId],
  );

  const handleSecondaryAction = useCallback(
    (recommendation: RecommendationCardVm, action: RecommendationSecondaryAction) => {
      if (action === "CANCEL_REQUEST") {
        void handleCancelFriendRequest(recommendation);
        return;
      }

      setRejectTarget(recommendation);
      setRejectActionStatus(action);
    },
    [handleCancelFriendRequest],
  );

  const handleRejectRecommendation = useCallback(
    async ({ selectedReasons, note }: RejectRecommendationSubmitValue) => {
      if (!rejectTarget) return;

      if (!currentUserId) {
        toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      const targetUserId = rejectTarget.userId;

      if (rejectingUserId === targetUserId) return;

      setRejectingUserId(targetUserId);

      const reasonText = buildRejectReasonText({ selectedReasons, note });
      const friendRequest = rejectTarget.friendRequest;
      const isPendingReceivedRequest =
        friendRequest?.status === "FRIEND_REQUEST_SENT" &&
        friendRequest.receiverId === currentUserId;

      try {
        if (rejectActionStatus === "SKIPPED") {
          const matchingResponse = await matchingItemApi.updateStatus({
            userId: currentUserId,
            recommendedUserId: targetUserId,
            actionStatus: "SKIPPED",
            finalScore: rejectTarget.finalScore,
            reasonText,
          });

          if (!matchingResponse.success) {
            throw new Error(matchingResponse.message || "Không thể gửi phản hồi cho gợi ý này.");
          }

          toast.success("Đã bỏ qua gợi ý.");
        } else {
          if (isPendingReceivedRequest && friendRequest?.senderId && friendRequest?.receiverId) {
            const friendResponse = await updateFriendRequestStatusBySenderAndReceiverService(
              friendRequest.senderId,
              friendRequest.receiverId,
              "REJECTED",
            );

            if (!isSuccessCode(friendResponse.code)) {
              throw new Error(friendResponse.message || "Không thể từ chối lời mời kết bạn.");
            }
          }

          const matchingResponse = await matchingItemApi.updateStatus({
            userId: currentUserId,
            recommendedUserId: targetUserId,
            actionStatus: "REJECTED",
            finalScore: rejectTarget.finalScore,
            reasonText,
          });

          if (!matchingResponse.success && !isPendingReceivedRequest) {
            throw new Error(matchingResponse.message || "Không thể gửi phản hồi cho gợi ý này.");
          }

          if (!matchingResponse.success && isPendingReceivedRequest) {
            toast.success("Đã từ chối kết nối, nhưng phản hồi gợi ý chưa được lưu.");
          } else {
            toast.success("Đã gửi phản hồi từ chối.");
          }
        }

        setDismissedRecommendationIds((prev) =>
          prev.includes(targetUserId) ? prev : [...prev, targetUserId],
        );
        setRejectTarget(null);

        try {
          await fetchRecommendations(currentUserId);
        } catch (refreshError) {
          console.error("Cannot refresh recommendations", refreshError);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setRejectingUserId((prev) => (prev === targetUserId ? null : prev));
      }
    },
    [currentUserId, fetchRecommendations, rejectTarget, rejectingUserId, rejectActionStatus],
  );

  useEffect(() => {
    const handleStatusUpdate = () => {
      fetchRecommendations(currentUserId);
    };

    window.addEventListener("friend_status_updated", handleStatusUpdate);
    window.addEventListener("friend_request_received", handleStatusUpdate);
    
    return () => {
      window.removeEventListener("friend_status_updated", handleStatusUpdate);
      window.removeEventListener("friend_request_received", handleStatusUpdate);
    };
  }, [fetchRecommendations, currentUserId]);


  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">
                Không thể tải danh sách bạn học
              </p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchRecommendations(currentUserId)}
              className="h-9 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-base font-bold text-gray-800">Bạn học phù hợp</h2>
              <p className="text-xs text-gray-500">
                {visibleItems.length} bạn học được gợi ý
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchRecommendations(currentUserId, 1, false)}
            disabled={loading}
            className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"
            title="Tải lại"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SuggestedStudentSkeleton />
            <SuggestedStudentSkeleton />
            <SuggestedStudentSkeleton />
            <SuggestedStudentSkeleton />
            <SuggestedStudentSkeleton />
            <SuggestedStudentSkeleton />
          </div>
        ) : visibleItems.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? "Chưa có bạn học phù hợp" : "Bạn đã xử lý hết gợi ý hiện tại"}
            description={
              items.length === 0
                ? "Hệ thống chưa tìm thấy bạn học phù hợp với bạn."
                : "Hãy tải lại để nhận thêm gợi ý bạn học mới."
            }
            actionLabel="Tải lại"
            onAction={() => fetchRecommendations(currentUserId, 1, false)}
            imageUrl="https://app.studystream.live/assets/images/onboarding-slides/explanation-slide.png"
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item) => (
                <RecommendationCard
                  key={item.userId}
                  recommendation={item}
                  onViewProfile={handleViewProfile}
                  onConnect={handleConnect}
                  onAccept={handleAcceptFriendRequest}
                  onSecondaryAction={handleSecondaryAction}
                  isConnecting={connectingUserId === item.userId}
                  isAccepting={acceptingRequestId === item.friendRequest?.id}
                  isRejecting={rejectingUserId === item.userId}
                  currentUserId={currentUserId}
                />
              ))}
              {loadingMore && (
                <>
                  <SuggestedStudentSkeleton />
                  <SuggestedStudentSkeleton />
                  <SuggestedStudentSkeleton />
                </>
              )}
            </div>

            {page < totalPages && (
              <div className="flex justify-center pt-6 border-t border-gray-100 mt-6">
                <button
                  onClick={() => fetchRecommendations(currentUserId, page + 1, true)}
                  disabled={loadingMore}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm gợi ý"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <RejectRecommendationModal
        open={!!rejectTarget}
        recommendationName={rejectTarget?.fullName}
        submitting={rejectingUserId === rejectTarget?.userId}
        onClose={handleCloseRejectModal}
        onSubmit={handleRejectRecommendation}
      />
    </div>
  );
}
