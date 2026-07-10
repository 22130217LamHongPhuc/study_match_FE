import { useEffect, useState } from "react";
import { AIMatchingHeader } from "./components/AIMatchingHeader";
import { AIMatchingStatCards } from "./components/AIMatchingStatCards";
import { AIMatchingCharts } from "./components/AIMatchingCharts";
import { AIMatchingTabs } from "./components/AIMatchingTabs";
import {
  getMatchingActionDistribution,
  getMatchingActions,
  getMatchingFeedbacks,
  getMatchingFeedbackStatistics,
  getMatchingStatistics,
  getMatchingTrend,
} from "./service";
import {
  AI_MATCHING_PAGE_SIZE,
  type ActionDistributionItem,
  type MatchingActionResponse,
  type MatchingActionStatus,
  type MatchingStatisticsResponse,
  type MatchingTrendItem,
  type StudyFeedbackResponse,
  type StudyFeedbackStatisticsResponse,
  type StudySessionType,
} from "./types";

const emptyStatistics: MatchingStatisticsResponse = {
  totalRecommendationItems: 0,
  totalViewed: 0,
  totalFriendRequestSent: 0,
  totalRejected: 0,
  totalAccepted: 0,
  viewRate: 0,
  friendRequestRate: 0,
  acceptRate: 0,
  rejectRate: 0,
  averageFinalScore: 0,
  totalFeedbacks: 0,
  averageRating: 0,
};

const emptyFeedbackStatistics: StudyFeedbackStatisticsResponse = {
  totalFeedbacks: 0,
  averageRating: 0,
  averageCompatibilityRating: 0,
  oneToOneFeedbacks: 0,
  groupFeedbacks: 0,
  ratingDistribution: {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
  },
};

const emptyActionDistribution: ActionDistributionItem[] = [
  { status: "VIEWED", count: 0 },
  { status: "FRIEND_REQUEST_SENT", count: 0 },
  { status: "ACCEPTED", count: 0 },
  { status: "REJECTED", count: 0 },
];

const emptyTrendData: MatchingTrendItem[] = [];

function useDebounce<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminAIMatchingPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const [statistics, setStatistics] = useState<MatchingStatisticsResponse>(
    emptyStatistics,
  );
  const [feedbackStatistics, setFeedbackStatistics] =
    useState<StudyFeedbackStatisticsResponse>(emptyFeedbackStatistics);
  const [actionDistribution, setActionDistribution] =
    useState<ActionDistributionItem[]>(emptyActionDistribution);
  const [trendData, setTrendData] =
    useState<MatchingTrendItem[]>(emptyTrendData);
  const [actions, setActions] = useState<MatchingActionResponse[]>([]);
  const [actionStatusFilter, setActionStatusFilter] =
    useState<MatchingActionStatus | null>(null);
  const [actionUserId, setActionUserId] = useState("");
  const [actionRecommendedUserId, setActionRecommendedUserId] = useState("");
  const debouncedActionUserId = useDebounce(actionUserId.trim());
  const debouncedActionRecommendedUserId = useDebounce(
    actionRecommendedUserId.trim(),
  );

  const [actionPage, setActionPage] = useState(1);
  const [actionTotalItems, setActionTotalItems] = useState(0);
  const [actionTotalPages, setActionTotalPages] = useState(0);

  const [feedbacks, setFeedbacks] = useState<StudyFeedbackResponse[]>([]);
  const [feedbackSessionType, setFeedbackSessionType] =
    useState<StudySessionType | null>(null);
  const [feedbackMinRating, setFeedbackMinRating] = useState<number | null>(
    null,
  );
  const [feedbackReviewerId, setFeedbackReviewerId] = useState("");
  const [feedbackTargetId, setFeedbackTargetId] = useState("");
  const [feedbackGroupId, setFeedbackGroupId] = useState("");
  const debouncedFeedbackReviewerId = useDebounce(feedbackReviewerId.trim());
  const debouncedFeedbackTargetId = useDebounce(feedbackTargetId.trim());
  const debouncedFeedbackGroupId = useDebounce(feedbackGroupId.trim());

  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackTotalItems, setFeedbackTotalItems] = useState(0);
  const [feedbackTotalPages, setFeedbackTotalPages] = useState(0);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [feedbackStatisticsLoading, setFeedbackStatisticsLoading] =
    useState(false);
  const [actionDistributionLoading, setActionDistributionLoading] =
    useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [feedbackStatisticsError, setFeedbackStatisticsError] = useState<
    string | null
  >(null);
  const [actionDistributionError, setActionDistributionError] = useState<
    string | null
  >(null);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const [feedbacksError, setFeedbacksError] = useState<string | null>(null);

  const handleFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setActionPage(1);
    setFeedbackPage(1);
  };

  useEffect(() => {
    setActionPage(1);
  }, [
    actionStatusFilter,
    debouncedActionUserId,
    debouncedActionRecommendedUserId,
  ]);

  useEffect(() => {
    setFeedbackPage(1);
  }, [
    feedbackSessionType,
    feedbackMinRating,
    debouncedFeedbackReviewerId,
    debouncedFeedbackTargetId,
    debouncedFeedbackGroupId,
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadStatistics = async () => {
      try {
        setStatisticsLoading(true);
        setStatisticsError(null);

        const data = await getMatchingStatistics(
          appliedFromDate,
          appliedToDate,
        );

        if (cancelled) return;

        setStatistics(data);
      } catch (error) {
        if (cancelled) return;

        setStatistics(emptyStatistics);
        setStatisticsError(
          error instanceof Error
            ? error.message
            : "Không thể tải thống kê matching",
        );
      } finally {
        if (!cancelled) {
          setStatisticsLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [appliedFromDate, appliedToDate]);

  useEffect(() => {
    let cancelled = false;

    const loadTrend = async () => {
      try {
        setTrendLoading(true);
        setTrendError(null);

        const data = await getMatchingTrend(appliedFromDate, appliedToDate);

        if (cancelled) return;

        setTrendData(data);
      } catch (error) {
        if (cancelled) return;

        setTrendData(emptyTrendData);
        setTrendError(
          error instanceof Error
            ? error.message
            : "Không thể tải xu hướng matching",
        );
      } finally {
        if (!cancelled) {
          setTrendLoading(false);
        }
      }
    };

    loadTrend();

    return () => {
      cancelled = true;
    };
  }, [appliedFromDate, appliedToDate]);

  useEffect(() => {
    let cancelled = false;

    const loadFeedbackStatistics = async () => {
      try {
        setFeedbackStatisticsLoading(true);
        setFeedbackStatisticsError(null);

        const data = await getMatchingFeedbackStatistics(
          appliedFromDate,
          appliedToDate,
        );

        if (cancelled) return;

        setFeedbackStatistics(data);
      } catch (error) {
        if (cancelled) return;

        setFeedbackStatistics(emptyFeedbackStatistics);
        setFeedbackStatisticsError(
          error instanceof Error
            ? error.message
            : "Không thể tải thống kê phản hồi",
        );
      } finally {
        if (!cancelled) {
          setFeedbackStatisticsLoading(false);
        }
      }
    };

    loadFeedbackStatistics();

    return () => {
      cancelled = true;
    };
  }, [appliedFromDate, appliedToDate]);

  useEffect(() => {
    let cancelled = false;

    const loadActionDistribution = async () => {
      try {
        setActionDistributionLoading(true);
        setActionDistributionError(null);

        const data = await getMatchingActionDistribution(
          appliedFromDate,
          appliedToDate,
        );

        if (cancelled) return;

        setActionDistribution(data);
      } catch (error) {
        if (cancelled) return;

        setActionDistribution(emptyActionDistribution);
        setActionDistributionError(
          error instanceof Error
            ? error.message
            : "Không thể tải phân bố trạng thái matching",
        );
      } finally {
        if (!cancelled) {
          setActionDistributionLoading(false);
        }
      }
    };

    loadActionDistribution();

    return () => {
      cancelled = true;
    };
  }, [appliedFromDate, appliedToDate]);

  useEffect(() => {
    let cancelled = false;

    const userId = Number(debouncedActionUserId);
    const recommendedUserId = Number(debouncedActionRecommendedUserId);

    const loadActions = async () => {
      try {
        setActionsLoading(true);
        setActionsError(null);

        const data = await getMatchingActions(
          actionPage - 1,
          AI_MATCHING_PAGE_SIZE,
          {
            userId: debouncedActionUserId && Number.isFinite(userId) ? userId : null,
            recommendedUserId:
              debouncedActionRecommendedUserId && Number.isFinite(recommendedUserId)
                ? recommendedUserId
                : null,
            actionStatus: actionStatusFilter,
            fromDate: appliedFromDate,
            toDate: appliedToDate,
          },
        );

        if (cancelled) return;

        setActions(data.content);
        setActionTotalItems(data.totalElements);
        setActionTotalPages(data.totalPages);
      } catch (error) {
        if (cancelled) return;

        setActions([]);
        setActionTotalItems(0);
        setActionTotalPages(0);
        setActionsError(
          error instanceof Error
            ? error.message
            : "Không thể tải hoạt động ghép đôi",
        );
      } finally {
        if (!cancelled) {
          setActionsLoading(false);
        }
      }
    };

    loadActions();

    return () => {
      cancelled = true;
    };
  }, [
    actionPage,
    actionStatusFilter,
    debouncedActionUserId,
    debouncedActionRecommendedUserId,
    appliedFromDate,
    appliedToDate,
  ]);

  useEffect(() => {
    let cancelled = false;

    const reviewerUserId = Number(debouncedFeedbackReviewerId);
    const targetUserId = Number(debouncedFeedbackTargetId);
    const groupId = Number(debouncedFeedbackGroupId);

    const loadFeedbacks = async () => {
      try {
        setFeedbacksLoading(true);
        setFeedbacksError(null);

        const data = await getMatchingFeedbacks(
          feedbackPage - 1,
          AI_MATCHING_PAGE_SIZE,
          {
            sessionType: feedbackSessionType,
            reviewerUserId:
              debouncedFeedbackReviewerId && Number.isFinite(reviewerUserId)
                ? reviewerUserId
                : null,
            targetUserId:
              debouncedFeedbackTargetId && Number.isFinite(targetUserId)
                ? targetUserId
                : null,
            groupId:
              debouncedFeedbackGroupId && Number.isFinite(groupId) ? groupId : null,
            minRating: feedbackMinRating,
            fromDate: appliedFromDate,
            toDate: appliedToDate,
          },
        );

        if (cancelled) return;

        setFeedbacks(data.content);
        setFeedbackTotalItems(data.totalElements);
        setFeedbackTotalPages(data.totalPages);
      } catch (error) {
        if (cancelled) return;

        setFeedbacks([]);
        setFeedbackTotalItems(0);
        setFeedbackTotalPages(0);
        setFeedbacksError(
          error instanceof Error
            ? error.message
            : "Không thể tải phản hồi học tập",
        );
      } finally {
        if (!cancelled) {
          setFeedbacksLoading(false);
        }
      }
    };

    loadFeedbacks();

    return () => {
      cancelled = true;
    };
  }, [
    feedbackPage,
    feedbackSessionType,
    feedbackMinRating,
    debouncedFeedbackReviewerId,
    debouncedFeedbackTargetId,
    debouncedFeedbackGroupId,
    appliedFromDate,
    appliedToDate,
  ]);

  return (
    <main className="space-y-6">
      <AIMatchingHeader
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onFilter={handleFilter}
      />

      {statisticsError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {statisticsError}
        </div>
      )}

      {actionsError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {actionsError}
        </div>
      )}

      {actionDistributionError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {actionDistributionError}
        </div>
      )}

      {trendError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {trendError}
        </div>
      )}

      {feedbacksError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {feedbacksError}
        </div>
      )}

      {feedbackStatisticsError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {feedbackStatisticsError}
        </div>
      )}

      <AIMatchingStatCards
        stats={statistics}
        loading={statisticsLoading}
      />

      <AIMatchingCharts
        distributionData={actionDistribution}
        trendData={trendData}
        loading={actionDistributionLoading || trendLoading}
      />

      <AIMatchingTabs
        actions={actions}
        feedbacks={feedbacks}
        feedbackStatistics={feedbackStatistics}
        actionPage={actionPage}
        actionTotalItems={actionTotalItems}
        actionTotalPages={actionTotalPages}
        onActionPageChange={setActionPage}
        actionsLoading={actionsLoading}
        actionUserId={actionUserId}
        onActionUserIdChange={setActionUserId}
        actionRecommendedUserId={actionRecommendedUserId}
        onActionRecommendedUserIdChange={setActionRecommendedUserId}
        actionStatusFilter={actionStatusFilter}
        onActionStatusFilterChange={setActionStatusFilter}
        feedbackPage={feedbackPage}
        feedbackTotalItems={feedbackTotalItems}
        feedbackTotalPages={feedbackTotalPages}
        onFeedbackPageChange={setFeedbackPage}
        feedbacksLoading={feedbacksLoading}
        feedbackSessionType={feedbackSessionType}
        onFeedbackSessionTypeChange={setFeedbackSessionType}
        feedbackMinRating={feedbackMinRating}
        onFeedbackMinRatingChange={setFeedbackMinRating}
        feedbackReviewerId={feedbackReviewerId}
        onFeedbackReviewerIdChange={setFeedbackReviewerId}
        feedbackTargetId={feedbackTargetId}
        onFeedbackTargetIdChange={setFeedbackTargetId}
        feedbackGroupId={feedbackGroupId}
        onFeedbackGroupIdChange={setFeedbackGroupId}
      />
    </main>
  );
}
