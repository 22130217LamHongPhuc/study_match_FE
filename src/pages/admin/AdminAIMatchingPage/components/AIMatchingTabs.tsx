import { useEffect, useState, type ReactNode } from "react";
import type {
  MatchingActionResponse,
  MatchingActionStatus,
  StudyFeedbackResponse,
  StudyFeedbackStatisticsResponse,
  StudySessionType,
} from "../types";
import { MatchingActionsTable } from "./MatchingActionsTable";
import { StudyFeedbacksTable } from "./StudyFeedbacksTable";
import { FeedbackStatisticsPanel } from "./FeedbackStatisticsPanel";
import { FeedbackDetailModal } from "./FeedbackDetailModal";
import { getMatchingFeedbackById } from "../service";
import { normalizeAvatarUrl } from "../../../../services/FriendService";

const tabs = [
  { key: "actions", label: "Hoạt động ghép đôi" },
  { key: "feedbacks", label: "Phản hồi học tập" },
  { key: "statistics", label: "Thống kê phản hồi" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

type AIMatchingTabsProps = {
  actions: MatchingActionResponse[];
  feedbacks: StudyFeedbackResponse[];
  feedbackStatistics: StudyFeedbackStatisticsResponse;
  actionPage: number;
  actionTotalItems: number;
  actionTotalPages: number;
  onActionPageChange: (page: number) => void;
  actionsLoading: boolean;
  actionUserId: string;
  onActionUserIdChange: (value: string) => void;
  actionRecommendedUserId: string;
  onActionRecommendedUserIdChange: (value: string) => void;
  actionStatusFilter: MatchingActionStatus | null;
  onActionStatusFilterChange: (value: MatchingActionStatus | null) => void;
  feedbackPage: number;
  feedbackTotalItems: number;
  feedbackTotalPages: number;
  onFeedbackPageChange: (page: number) => void;
  feedbacksLoading: boolean;
  feedbackSessionType: StudySessionType | null;
  onFeedbackSessionTypeChange: (value: StudySessionType | null) => void;
  feedbackMinRating: number | null;
  onFeedbackMinRatingChange: (value: number | null) => void;
  feedbackReviewerId: string;
  onFeedbackReviewerIdChange: (value: string) => void;
  feedbackTargetId: string;
  onFeedbackTargetIdChange: (value: string) => void;
  feedbackGroupId: string;
  onFeedbackGroupIdChange: (value: string) => void;
};

export function AIMatchingTabs({
  actions,
  feedbacks,
  feedbackStatistics,
  actionPage,
  actionTotalItems,
  actionTotalPages,
  onActionPageChange,
  actionsLoading,
  actionUserId,
  onActionUserIdChange,
  actionRecommendedUserId,
  onActionRecommendedUserIdChange,
  actionStatusFilter,
  onActionStatusFilterChange,
  feedbackPage,
  feedbackTotalItems,
  feedbackTotalPages,
  onFeedbackPageChange,
  feedbacksLoading,
  feedbackSessionType,
  onFeedbackSessionTypeChange,
  feedbackMinRating,
  onFeedbackMinRatingChange,
  feedbackReviewerId,
  onFeedbackReviewerIdChange,
  feedbackTargetId,
  onFeedbackTargetIdChange,
  feedbackGroupId,
  onFeedbackGroupIdChange,
}: AIMatchingTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("actions");

  const [detailAction, setDetailAction] =
    useState<MatchingActionResponse | null>(null);

  const [detailFeedbackId, setDetailFeedbackId] = useState<number | null>(null);
  const [detailFeedback, setDetailFeedback] =
    useState<StudyFeedbackResponse | null>(null);
  const [detailFeedbackLoading, setDetailFeedbackLoading] = useState(false);
  const [detailFeedbackError, setDetailFeedbackError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (detailFeedbackId === null) return;

    let cancelled = false;

    const loadFeedbackDetail = async () => {
      try {
        setDetailFeedbackLoading(true);
        setDetailFeedbackError(null);
        setDetailFeedback(null);

        const data = await getMatchingFeedbackById(detailFeedbackId);

        if (cancelled) return;

        setDetailFeedback(data);
      } catch (error) {
        if (cancelled) return;

        setDetailFeedbackError(
          error instanceof Error
            ? error.message
            : "Không thể tải chi tiết phản hồi",
        );
      } finally {
        if (!cancelled) {
          setDetailFeedbackLoading(false);
        }
      }
    };

    loadFeedbackDetail();

    return () => {
      cancelled = true;
    };
  }, [detailFeedbackId]);

  const closeFeedbackDetail = () => {
    setDetailFeedbackId(null);
    setDetailFeedback(null);
    setDetailFeedbackError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-sand-200 bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-accent-600 text-white"
                : "text-sand-600 hover:bg-sand-50 hover:text-sand-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "actions" && (
        <MatchingActionsTable
          actions={actions}
          page={actionPage}
          totalItems={actionTotalItems}
          totalPages={actionTotalPages}
          onPageChange={onActionPageChange}
          onViewDetail={setDetailAction}
          loading={actionsLoading}
          userId={actionUserId}
          onUserIdChange={onActionUserIdChange}
          recommendedUserId={actionRecommendedUserId}
          onRecommendedUserIdChange={onActionRecommendedUserIdChange}
          statusFilter={actionStatusFilter}
          onStatusFilterChange={onActionStatusFilterChange}
        />
      )}

      {activeTab === "feedbacks" && (
        <>
          <StudyFeedbacksTable
            feedbacks={feedbacks}
            page={feedbackPage}
            totalItems={feedbackTotalItems}
            totalPages={feedbackTotalPages}
            onPageChange={onFeedbackPageChange}
            onViewDetail={(feedback) => setDetailFeedbackId(feedback.id)}
            loading={feedbacksLoading}
            sessionTypeFilter={feedbackSessionType}
            onSessionTypeFilterChange={onFeedbackSessionTypeChange}
            minRatingFilter={feedbackMinRating}
            onMinRatingFilterChange={onFeedbackMinRatingChange}
            reviewerUserId={feedbackReviewerId}
            onReviewerUserIdChange={onFeedbackReviewerIdChange}
            targetUserId={feedbackTargetId}
            onTargetUserIdChange={onFeedbackTargetIdChange}
            groupId={feedbackGroupId}
            onGroupIdChange={onFeedbackGroupIdChange}
          />
          <FeedbackDetailModal
            open={detailFeedbackId !== null}
            feedback={detailFeedback}
            loading={detailFeedbackLoading}
            error={detailFeedbackError}
            onClose={closeFeedbackDetail}
          />
        </>
      )}

      {activeTab === "statistics" && (
        <FeedbackStatisticsPanel stats={feedbackStatistics} />
      )}

      {activeTab === "actions" && detailAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setDetailAction(null)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-sand-900">
                Chi tiết ghép đôi #{detailAction.id}
              </h3>
              <button
                type="button"
                onClick={() => setDetailAction(null)}
                className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
                <DetailRow label="ID" value={detailAction.id} />
                <DetailRow
                  label=""
                  value={
                    <ActionUserDetail
                      userId={detailAction.userId}
                      fullName={detailAction.userFullName}
                      email={detailAction.userEmail}
                      avatarUrl={detailAction.userAvatarUrl}
                    />
                  }
                />
                <DetailRow
                  label="Người được gợi ý"
                  value={
                    <ActionUserDetail
                      userId={detailAction.recommendedUserId}
                      fullName={detailAction.recommendedUserFullName}
                      email={detailAction.recommendedUserEmail}
                      avatarUrl={detailAction.recommendedUserAvatarUrl}
                    />
                  }
                />
                <DetailRow label="Trạng thái" value={detailAction.actionStatus} />
                <DetailRow
                  label="Ngày tạo"
                  value={new Date(detailAction.createdAt).toLocaleString("vi-VN")}
                />
                <DetailRow
                  label="Cập nhật"
                  value={new Date(detailAction.updatedAt).toLocaleString("vi-VN")}
                />
              </div>
              <button
                type="button"
                onClick={() => setDetailAction(null)}
                className="mt-4 h-9 w-full rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-sand-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-sand-800">{value}</p>
      </div>
    </div>
  );
}

function ActionUserDetail({
  userId,
  fullName,
  email,
  avatarUrl,
}: {
  userId: number;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
}) {
  const name = fullName?.trim() || `User #${userId}`;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {avatarUrl ? (
        <img
          src={normalizeAvatarUrl(avatarUrl) || ""}
          alt={name}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-200 text-xs font-semibold text-sand-600">
          {getInitials(name)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-sand-800">{name}</p>
        <p className="truncate text-xs font-medium text-sand-500">
          {email || `ID ${userId}`}
        </p>
      </div>
    </div>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
