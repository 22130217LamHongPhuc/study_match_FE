import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";

export interface SubjectGroupStatDto {
  subjectName: string;
  publicCount: number;
  privateCount: number;
  totalGroups: number;
  totalMembers: number;
}

export interface ReportStatusStatDto {
  name: string;
  value: number;
  color: string;
}

export interface ReportTargetStatDto {
  name: string;
  pending: number;
  reviewing: number;
  resolved: number;
  rejected: number;
  total: number;
}

export interface MessagesTimelineDto {
  date: string;
  groupMessages: number;
  privateMessages: number;
  total: number;
}

export interface NewUsersTimelineDto {
  date: string;
  newUsers: number;
}

export interface StudyDurationTimelineDto {
  date: string;
  totalHours: number;
  onlineSessions: number;
  offlineSessions: number;
}

export interface AdminOverviewResponse {
  totalUsers: number;
  onlineUsers: number;
  pendingReportsCount: number;
  topSubjects: SubjectGroupStatDto[];
  reportsPie: ReportStatusStatDto[];
  reportsByTarget: ReportTargetStatDto[];
  messagesTimeline: MessagesTimelineDto[];
  newUsersTimeline: NewUsersTimelineDto[];
  studyDurationTimeline: StudyDurationTimelineDto[];
}

export async function getAdminOverviewData(params?: {
  timePreset?: string;
  startDate?: string;
  endDate?: string;
}): Promise<APIResponseData<AdminOverviewResponse>> {
  const query = new URLSearchParams();
  if (params?.timePreset) query.set("timePreset", params.timePreset);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);

  return apiFetch<AdminOverviewResponse>(
    `/admin/overview?${query.toString()}`,
    { method: "GET" }
  );
}
