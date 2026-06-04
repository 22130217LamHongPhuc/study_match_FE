export type ScheduleStatus =
  | "UPCOMING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type StudyMode = "ONLINE" | "OFFLINE" | "HYBRID";

export type ScheduleType = "GROUP" | "ONE_ON_ONE";

export type TimeFilter = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";

export interface ScheduleRow {
  id: number;
  sessionName: string;
  groupName: string | null;
  scheduleType: ScheduleType;
  creatorName: string;
  creatorAvatar: string | null;
  startTime: string;
  endTime: string;
  studyMode: StudyMode;
  memberCount: number;
  maxMembers: number;
  status: ScheduleStatus;
  subject: string | null;
  description: string | null;
  location: string | null;
  onlineLink: string | null;
  members: ScheduleMember[];
}

export interface ScheduleMember {
  userId: number;
  fullName: string;
  avatarUrl: string | null;
}

export interface ScheduleStatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ size?: number }>;
  warning?: boolean;
}

export const SCHEDULE_PAGE_SIZE = 8;
