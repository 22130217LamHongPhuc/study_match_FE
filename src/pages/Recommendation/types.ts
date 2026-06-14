export interface RecommendUserRequest {
  user_id: number;
}

export interface RecommendationApiItem {
  user_id: number;
  term_id: number;
  full_name: string;
  main_subject_id: number;
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
}

export interface RecommendationFriendRequestApiItem {
  id: number;
  senderId: number;
  receiverId: number;
  status: FriendRequestStatus;
}

export type FriendRequestStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "BLOCKED";

export interface FriendRequestVm {
  id: number;
  senderId: number;
  receiverId: number;
  status: FriendRequestStatus;
}

export interface RecommendUsersApiResponse {
  success: boolean;
  message: string;
  recommendations: RecommendationApiItem[];
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
}
