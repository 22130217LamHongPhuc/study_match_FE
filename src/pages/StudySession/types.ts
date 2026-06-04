export type SessionType = "USER_PAIR" | "GROUP";

export type StudyMode = "ONLINE" | "OFFLINE" | "HYBRID";

export type SessionStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";

export type ParticipantStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "JOINED"
  | "ABSENT";

export type ScheduleFilter = "ALL" | "USER_PAIR" | "GROUP" | "PENDING";

export interface StudySessionVm {
  id: number;
  sessionType: SessionType;
  groupId?: number | null;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  studyMode: StudyMode;
  location?: string;
  meetingUrl?: string;
  createdByUserId: number;
  status: SessionStatus;
  participantStatus: ParticipantStatus;
  partnerName?: string;
  groupName?: string;
  membersCount?: number;
  subjectName?: string;
}

export type GroupStudySessionMode = "ONLINE" | "OFFLINE" | "HYBRID";

export type StudySessionType = "GROUP" | "USER_PAIR";

export interface CreateStudySessionRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  studyMode: GroupStudySessionMode;
  location?: string;
  meetingUrl?: string;
  createdByUserId: number;
  sessionType: StudySessionType;
  subjectName?: string | null;
  subjectId?: number | null;
  partnerUserId?: number | null;
  partnerUserName?: string | null;
}

export type GroupStudySessionStatus =
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";
export interface StudySessionResponse {
  id: number;
  sessionType: StudySessionType;
  groupId: number | null;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  studyMode: GroupStudySessionMode;
  location: string | null;
  meetingUrl: string | null;
  createdByUserId: number;
  status: GroupStudySessionStatus;
  participantStatus: ParticipantStatus;
  partnerName: string | null;
  partnerUserName?: string | null;
  groupName: string | null;
  membersCount: number | null;
  subjectName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionParticipantConfirmationResponse {
  userId?: number | null;
  userName?: string | null;
  fullName?: string | null;
  partnerUserName?: string | null;
  role?: string | null;
  status?: ParticipantStatus | null;
  respondedAt?: string | null;
  avatarUrl?: string | null;
}

export interface SessionConfirmationStatsResponse {
  sessionId: number;
  sessionType: StudySessionType;
  currentUserId: number;
  totalParticipants: number;
  acceptedCount: number;
  pendingCount: number;
  declinedCount: number;
  otherParticipants: SessionParticipantConfirmationResponse[];
}

export interface JoinStudySessionResponse {
  sessionId: number;
  roomId: string;
  token: string;
  joinedAt: string;
}
