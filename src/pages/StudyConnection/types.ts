export interface RecommendUserRequest {
  user_id: number;
}

export interface CommonGroupApiItem {
  id: number;
  name: string;
  avatarUrl: string | null;
}

export interface RecommendationApiItem {
  user_id: number;
  term_id: number;
  full_name: string;
  main_subject_id: number;
  main_subject_name?: string;
  avatar_url?: string | null;
  study_goal: string;
  study_mode: string;
  avg_score: number;
  studied_credits: number;
  total_clicks: number;
  gender: string;
  region: string;
  similarity_score: number;
  mode_bonus: number;
  shared_subject_score: number;
  n_shared_subjects: number;
  shared_subject_ids: string[];
  final_score: number;
  reason_text?: string;
  reasonText?: string;
  match_percentage: number;
  friend_request?: RecommendationFriendRequestApiItem | null;
  common_groups?: CommonGroupApiItem[];
}

export interface RecommendationFriendRequestApiItem {
  id: number;
  senderId?: number | null;
  sender_id?: number | null;
  receiverId?: number | null;
  receiver_id?: number | null;
  status: MatchingActionStatus;
}

export type MatchingActionStatus =
  | "FRIEND_REQUEST_SENT"
  | "PENDING"
  | "NONE"
  | "REJECTED"
  | "VIEWED"
  | "ACCEPTED"
  | "SKIPPED";

export type FriendRequestStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "BLOCKED"
  | "CANCELLED";

export interface FriendRequestVm {
  id: number;
  senderId: number | null;
  receiverId: number | null;
  status: MatchingActionStatus;
}

export type RecommendationSecondaryAction =
  | "SKIPPED"
  | "REJECTED"
  | "CANCEL_REQUEST";

export interface RecommendUsersApiResponse {
  success: boolean;
  message: string;
  recommendations: RecommendationApiItem[];
  pagination?: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface RecommendationCardVm {
  userId: number;
  fullName: string | undefined;
  studyGoal: string;
  studyModeLabel: string;
  avgScore: number;
  studiedCredits: number;
  gender: string;
  region: string;
  similarityScore: number;
  sharedSubjectScore: number;
  sharedSubjectCount: number;
  finalScore?: number;
  reasonText?: string;
  matchPercentage: number;
  friendRequest?: FriendRequestVm | null;
  mainSubjectName?: string;
  avatarUrl?: string | null;
  commonGroups?: CommonGroupApiItem[];
}
