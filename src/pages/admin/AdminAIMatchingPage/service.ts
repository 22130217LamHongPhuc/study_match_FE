import type {
  MatchingActionStatus,
  MatchingStatisticsResponse,
  MatchingActionResponse,
  StudyFeedbackResponse,
  StudyFeedbackStatisticsResponse,
  StudySessionType,
  MatchingTrendItem,
  MatchingTrendResponse,
  ActionDistributionItem,
  ActionDistributionResponse,
  PageResponse,
} from "./types";
import { apiFetch } from "../../../config/apiClient";
import type { APIResponseData } from "../../../config/APIResponse";

const API_BASE_URL_MATCHING = "http://localhost:8080";

type MatchingApiResult<T> = APIResponseData<T> | T;

function unwrapMatchingResponse<T>(
  response: MatchingApiResult<T>,
  fallbackMessage: string,
): T {
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "data" in response
  ) {
    const wrappedResponse = response as APIResponseData<T>;

    if (!wrappedResponse.success || !wrappedResponse.data) {
      throw new Error(wrappedResponse.message || fallbackMessage);
    }

    return wrappedResponse.data;
  }

  if (!response) {
    throw new Error(fallbackMessage);
  }

  return response as T;
}

function appendParam(
  params: URLSearchParams,
  key: string,
  value?: string | number | null,
) {
  if (value === null || value === undefined || value === "") {
    return;
  }

  params.set(key, String(value));
}

export async function getMatchingStatistics(
  fromDate?: string,
  toDate?: string,
): Promise<MatchingStatisticsResponse> {
  const params = new URLSearchParams();

  appendParam(params, "fromDate", fromDate);
  appendParam(params, "toDate", toDate);

  const query = params.toString();
  const response = await apiFetch<MatchingStatisticsResponse>(
    `/api/admin/matching/statistics${query ? `?${query}` : ""}`,
    { method: "GET" },
    API_BASE_URL_MATCHING,
  ) as MatchingApiResult<MatchingStatisticsResponse>;

  return unwrapMatchingResponse(response, "Cannot load matching statistics");
}

export async function getMatchingActions(
  page: number,
  size: number,
  filters: {
    userId?: number | null;
    recommendedUserId?: number | null;
    actionStatus?: MatchingActionStatus | null;
    fromDate?: string;
    toDate?: string;
  } = {},
): Promise<PageResponse<MatchingActionResponse>> {
  const params = new URLSearchParams();

  appendParam(params, "page", page);
  appendParam(params, "size", size);
  appendParam(params, "userId", filters.userId);
  appendParam(params, "recommendedUserId", filters.recommendedUserId);
  appendParam(params, "actionStatus", filters.actionStatus);
  appendParam(params, "fromDate", filters.fromDate);
  appendParam(params, "toDate", filters.toDate);

  const response = await apiFetch<PageResponse<MatchingActionResponse>>(
    `/api/admin/matching/actions?${params.toString()}`,
    { method: "GET" },
    API_BASE_URL_MATCHING,
  ) as MatchingApiResult<PageResponse<MatchingActionResponse>>;

  return unwrapMatchingResponse(response, "Cannot load matching actions");
}

export async function getMatchingFeedbacks(
  page: number,
  size: number,
  filters: {
    sessionType?: StudySessionType | null;
    reviewerUserId?: number | null;
    targetUserId?: number | null;
    groupId?: number | null;
    minRating?: number | null;
    fromDate?: string;
    toDate?: string;
  } = {},
): Promise<PageResponse<StudyFeedbackResponse>> {
  const params = new URLSearchParams();

  appendParam(params, "page", page);
  appendParam(params, "size", size);
  appendParam(params, "sessionType", filters.sessionType);
  appendParam(params, "reviewerUserId", filters.reviewerUserId);
  appendParam(params, "targetUserId", filters.targetUserId);
  appendParam(params, "groupId", filters.groupId);
  appendParam(params, "minRating", filters.minRating);
  appendParam(params, "fromDate", filters.fromDate);
  appendParam(params, "toDate", filters.toDate);

  const response = await apiFetch<PageResponse<StudyFeedbackResponse>>(
    `/api/admin/matching/feedbacks?${params.toString()}`,
    { method: "GET" },
    API_BASE_URL_MATCHING,
  ) as MatchingApiResult<PageResponse<StudyFeedbackResponse>>;

  return unwrapMatchingResponse(response, "Cannot load study feedbacks");
}

export async function getMatchingFeedbackById(
  feedbackId: number,
): Promise<StudyFeedbackResponse> {
  const response = await apiFetch<StudyFeedbackResponse>(
    `/api/admin/matching/feedbacks/${feedbackId}`,
    { method: "GET" },
    API_BASE_URL_MATCHING,
  ) as MatchingApiResult<StudyFeedbackResponse>;

  return unwrapMatchingResponse(response, "Cannot load study feedback detail");
}

export async function getMatchingFeedbackStatistics(
  fromDate?: string,
  toDate?: string,
): Promise<StudyFeedbackStatisticsResponse> {
  const params = new URLSearchParams();

  appendParam(params, "fromDate", fromDate);
  appendParam(params, "toDate", toDate);

  const query = params.toString();
  const response = await apiFetch<StudyFeedbackStatisticsResponse>(
    `/api/admin/matching/feedbacks/statistics${query ? `?${query}` : ""}`,
    { method: "GET" },
    API_BASE_URL_MATCHING,
  ) as MatchingApiResult<StudyFeedbackStatisticsResponse>;

  return unwrapMatchingResponse(response, "Cannot load feedback statistics");
}

export async function getMatchingActionDistribution(
  fromDate?: string,
  toDate?: string,
): Promise<ActionDistributionItem[]> {
  const params = new URLSearchParams();

  appendParam(params, "fromDate", fromDate);
  appendParam(params, "toDate", toDate);

  const query = params.toString();
  const response = await apiFetch<ActionDistributionResponse>(
    `/api/admin/matching/action-distribution${query ? `?${query}` : ""}`,
    { method: "GET" },
    API_BASE_URL_MATCHING,
  ) as MatchingApiResult<ActionDistributionResponse>;

  const data = unwrapMatchingResponse(
    response,
    "Cannot load action distribution",
  );

  return [
    { status: "VIEWED", count: data.VIEWED ?? 0 },
    {
      status: "FRIEND_REQUEST_SENT",
      count: data.FRIEND_REQUEST_SENT ?? 0,
    },
    { status: "ACCEPTED", count: data.ACCEPTED ?? 0 },
    { status: "REJECTED", count: data.REJECTED ?? 0 },
  ];
}

export async function getMatchingTrend(
  fromDate?: string,
  toDate?: string,
): Promise<MatchingTrendItem[]> {
  const params = new URLSearchParams();

  appendParam(params, "fromDate", fromDate);
  appendParam(params, "toDate", toDate);

  const query = params.toString();
  const response = await apiFetch<MatchingTrendResponse[]>(
    `/api/admin/matching/trend${query ? `?${query}` : ""}`,
    { method: "GET" },
    API_BASE_URL_MATCHING,
  ) as MatchingApiResult<MatchingTrendResponse[]>;

  const data = unwrapMatchingResponse(response, "Cannot load matching trend");

  return data.map((item) => ({
    date: item.date,
    totalRecommendations: item.totalRecommendations,
    viewed: item.totalViewed,
    friendRequestSent: item.totalFriendRequestSent,
    accepted: item.totalAccepted,
    rejected: item.totalRejected,
  }));
}
