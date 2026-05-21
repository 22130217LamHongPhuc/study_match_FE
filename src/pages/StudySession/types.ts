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
  subjectName?: string;
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
}
