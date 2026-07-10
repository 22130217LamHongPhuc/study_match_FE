import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FriendRequestVm, RecommendationCardVm, RecommendationSecondaryAction } from "../../pages/StudyConnection/types";
import RecommendationCard from "../../pages/StudyConnection/components/RecommendationCard";
import RejectRecommendationModal, { RejectRecommendationSubmitValue } from "../../pages/StudyConnection/components/RejectRecommendationModal";
import { matchingItemApi } from "../../services/matchingItemApi";
import { requestFriendService, updateFriendRequestStatusBySenderAndReceiverService, skipUserService } from "../../services/FriendService";

export interface SuggestedStudentVm {
  userId: number;
  fullName: string;
  avatarUrl?: string | null;
  studyModeLabel: string;
  matchPercentage: number;
  avgScore: number;
  sharedSubjectCount: number;
  studiedCredits: number;
  mainSubjectName?: string;
  commonGroups?: {
    id: number;
    name: string;
    avatarUrl: string | null;
  }[];
  friendRequest?: FriendRequestVm | null;
  studyGoal?: string;
  region?: string;
}

interface SuggestedStudentsProps {
  students: SuggestedStudentVm[];
  onViewProfile?: (student: SuggestedStudentVm) => void;
  onConnect?: (userId: number) => void;
  onAccept?: (request: FriendRequestVm) => void;
  currentUserId?: number;
  loading?: boolean;
}

export function SuggestedStudentSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-2xs animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

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

export default function SuggestedStudents({
  students,
  onViewProfile,
  onConnect,
  onAccept,
  currentUserId,
  loading = false,
}: SuggestedStudentsProps) {
  const navigate = useNavigate();
  const [localStudents, setLocalStudents] = useState<SuggestedStudentVm[]>(students);

  useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);
  const [acceptingRequestId, setAcceptingRequestId] = useState<number | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RecommendationCardVm | null>(null);
  const [rejectActionStatus, setRejectActionStatus] = useState<"REJECTED" | "SKIPPED">("REJECTED");

  const handleViewProfile = useCallback(
    (recommendation: RecommendationCardVm) => {
      navigate(`/profile/${recommendation.userId}`);
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
              finalScore: undefined,
            });
          } catch (trackingError) {
            console.error("Track matching FRIEND_REQUEST_SENT failed", trackingError);
          }

          toast.success("Đã gửi lời mời kết bạn.");

          setLocalStudents((prev) =>
            prev.map((student) => {
              if (student.userId === targetUserId) {
                return {
                  ...student,
                  friendRequest: {
                    id: (response.data as any)?.id || Date.now(),
                    senderId: currentUserId,
                    receiverId: targetUserId,
                    status: "FRIEND_REQUEST_SENT",
                  },
                };
              }
              return student;
            })
          );

          if (onConnect) onConnect(targetUserId);
        } else {
          toast.error(response.message || "Gửi lời mời kết bạn thất bại.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setConnectingUserId(null);
      }
    },
    [connectingUserId, currentUserId, onConnect],
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
              finalScore: undefined,
            });
          } catch (trackingError) {
            console.error("Track matching ACCEPTED failed", trackingError);
          }

          toast.success("Đã chấp nhận lời mời kết bạn.");

          setLocalStudents((prev) =>
            prev.map((student) => {
              if (student.friendRequest && student.friendRequest.id === requestId) {
                return {
                  ...student,
                  friendRequest: {
                    ...student.friendRequest,
                    status: "ACCEPTED",
                  },
                };
              }
              return student;
            })
          );

          if (onAccept) onAccept(request);
        } else {
          toast.error(response.message || "Chấp nhận lời mời thất bại.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setAcceptingRequestId(null);
      }
    },
    [acceptingRequestId, currentUserId, onAccept],
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
        (friendRequest.status !== "FRIEND_REQUEST_SENT" && friendRequest.status !== "PENDING") ||
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

        setLocalStudents((prev) =>
          prev.map((student) => {
            if (student.userId === targetUserId) {
              return {
                ...student,
                friendRequest: null,
              };
            }
            return student;
          })
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setRejectingUserId(null);
      }
    },
    [currentUserId, rejectingUserId],
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
        (friendRequest?.status === "FRIEND_REQUEST_SENT" || friendRequest?.status === "PENDING") &&
        friendRequest.receiverId === currentUserId;

      try {
        if (rejectActionStatus === "SKIPPED") {
          const response = await skipUserService(currentUserId, targetUserId);

          if (response.code !== 200 && response.code !== "200") {
            throw new Error(response.message || "Không thể bỏ qua người dùng.");
          }

          try {
            await matchingItemApi.createActionSkip({
              userId: currentUserId,
              recommendedUserId: targetUserId,
              actionStatus: "SKIPPED",
              finalScore: undefined,
              reasonText,
              isRecommendation: true,
            });
          } catch (trackingError) {
            console.error("Track matching SKIPPED failed", trackingError);
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
            finalScore: undefined,
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

        setLocalStudents((prev) => prev.filter((student) => student.userId !== targetUserId));
        setRejectTarget(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setRejectingUserId(null);
      }
    },
    [currentUserId, rejectTarget, rejectingUserId, rejectActionStatus],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Gợi ý học tập hôm nay</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SuggestedStudentSkeleton />
          <SuggestedStudentSkeleton />
        </div>
      </div>
    );
  }

  if (localStudents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <AlertCircle size={24} />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700">
          Hãy hoàn thiện hồ sơ để nhận gợi ý phù hợp hơn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Gợi ý học tập hôm nay</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {localStudents.map((student) => {
          const rec: RecommendationCardVm = {
            userId: student.userId,
            fullName: student.fullName,
            avatarUrl: student.avatarUrl || null,
            region: student.region || "",
            matchPercentage: student.matchPercentage,
            mainSubjectName: student.mainSubjectName || "",
            avgScore: student.avgScore,
            studiedCredits: student.studiedCredits,
            gender: "",
            similarityScore: 0,
            sharedSubjectScore: 0,
            sharedSubjectCount: student.sharedSubjectCount,
            studyGoal: student.studyGoal || "",
            studyModeLabel: student.studyModeLabel || "",
            friendRequest: student.friendRequest || null,
            commonGroups: student.commonGroups || [],
          };

          return (
            <RecommendationCard
              key={student.userId}
              recommendation={rec}
              onViewProfile={handleViewProfile}
              onConnect={handleConnect}
              onAccept={handleAcceptFriendRequest}
              onSecondaryAction={handleSecondaryAction}
              isConnecting={connectingUserId === student.userId}
              isAccepting={acceptingRequestId === student.friendRequest?.id}
              isRejecting={rejectingUserId === student.userId}
              currentUserId={currentUserId}
            />
          );
        })}
      </div>

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
