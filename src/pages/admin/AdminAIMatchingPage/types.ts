export type MatchingActionStatus =
  | "VIEWED"
  | "FRIEND_REQUEST_SENT"
  | "ACCEPTED"
  | "REJECTED";

export type StudySessionType = "USER_PAIR" | "GROUP";

export type StudyFeedbackType = "SESSION_FEEDBACK";

export interface MatchingStatisticsResponse {
  totalRecommendationItems: number;
  totalViewed: number;
  totalFriendRequestSent: number;
  totalAccepted: number;
  totalRejected: number;
  viewRate: number;
  friendRequestRate: number;
  acceptRate: number;
  rejectRate: number;
  totalFeedbacks: number;
  averageFinalScore: number;
  averageRating: number;
}

export interface MatchingActionResponse {
  id: number;
  userId: number;
  userFullName: string | null;
  userAvatarUrl: string | null;
  userEmail: string | null;
  recommendedUserId: number;
  recommendedUserFullName: string | null;
  recommendedUserAvatarUrl: string | null;
  recommendedUserEmail: string | null;
  actionStatus: MatchingActionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudyFeedbackResponse {
  id: number;
  sessionId: number;
  reviewerUserId: number;
  targetUserId: number | null;
  groupId: number | null;
  sessionType: StudySessionType;
  feedbackType: StudyFeedbackType;
  rating: number;
  matchedQualityScore: number;
  communicationScore: number;
  studyEffectivenessScore: number;
  eligibleForModel: boolean;
  comment: string;
  createdAt: string;
}

export interface StudyFeedbackStatisticsResponse {
  totalFeedbacks: number;
  averageRating: number;
  averageCompatibilityRating: number;
  oneToOneFeedbacks: number;
  groupFeedbacks: number;
  ratingDistribution: Record<string, number>;
}

export interface MatchingTrendItem {
  date: string;
  totalRecommendations: number;
  viewed: number;
  friendRequestSent: number;
  accepted: number;
  rejected: number;
}

export interface MatchingTrendResponse {
  date: string;
  totalRecommendations: number;
  totalViewed: number;
  totalFriendRequestSent: number;
  totalAccepted: number;
  totalRejected: number;
}

export interface ActionDistributionItem {
  status: MatchingActionStatus;
  count: number;
}

export type ActionDistributionResponse = Record<MatchingActionStatus, number>;

export interface PageResponse<T> {
  content: T[];
  page: number;
  totalElements: number;
  totalPages: number;
  size: number;
  number?: number;
}

export const AI_MATCHING_PAGE_SIZE = 8;
