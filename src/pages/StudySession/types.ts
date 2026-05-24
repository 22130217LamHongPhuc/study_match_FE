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
  createdByUserId: number;
  sessionType: StudySessionType;
  subjectName?: string;
}

export type GroupStudySessionStatus =
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";
export interface StudySessionResponse {
  id: number;
  groupId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  studyMode: GroupStudySessionMode;
  location: string;
  createdByUserId: number;
  status: GroupStudySessionStatus;
  createdAt: string;
  updatedAt: string;
  subjectName?: string;
}
