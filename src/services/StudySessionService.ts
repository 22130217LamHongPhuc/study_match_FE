import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";
import {
  CreateStudySessionRequest,
  StudySessionResponse,
  JoinStudySessionResponse,
} from "../pages/StudySession/types";
import type { SessionConfirmationStatsResponse } from "../pages/StudySession/types";
import type {
  AdminSessionRowResponse,
  AdminSessionStatsResponse,
  ScheduleStatus,
  StudyMode,
  ScheduleType,
} from "../pages/admin/AdminSchedulesPage/types";

const API_BASE_URL = "http://localhost:8080";

export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function createGroupStudySession(
  groupId: number,
  payload: CreateStudySessionRequest,
): Promise<APIResponseData<StudySessionResponse>> {
  const response = await apiFetch<StudySessionResponse>(
    `/api/study-sessions/group/${groupId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    API_BASE_URL,
  );

  return response;
}

export async function getUserStudySessions(
  userId: number,
): Promise<APIResponseData<PageResponse<StudySessionResponse>>> {
  const response = await apiFetch<PageResponse<StudySessionResponse>>(
    `/api/study-sessions/user/${userId}`,
    {
      method: "GET",
    },
    API_BASE_URL,
  );

  return response;
}

export async function createPairStudySession(
  payload: CreateStudySessionRequest,
): Promise<APIResponseData<StudySessionResponse>> {
  const response = await apiFetch<StudySessionResponse>(
    `/api/study-sessions/pair`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    API_BASE_URL,
  );

  return response;
}

export async function getStudySessionById(
  sessionId: number,
  userId: number,
): Promise<APIResponseData<StudySessionResponse>> {
  const response = await apiFetch<StudySessionResponse>(
    `/api/study-sessions/${sessionId}?userId=${userId}`,
    {
      method: "GET",
    },
    API_BASE_URL,
  );

  return response;
}

export async function respondToStudySession(
  sessionId: number,
  userId: number,
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "JOINED" | "ABSENT",
): Promise<APIResponseData<StudySessionResponse>> {
  const response = await apiFetch<StudySessionResponse>(
    `/api/study-sessions/${sessionId}/participants/${userId}/respond`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    API_BASE_URL,
  );

  return response;
}

export async function getConfirmationStats(
  sessionId: number,
  userId: number,
): Promise<APIResponseData<SessionConfirmationStatsResponse>> {
  const response = await apiFetch<SessionConfirmationStatsResponse>(
    `/api/study-sessions/${sessionId}/confirmation-stats?userId=${userId}`,
    {
      method: "GET",
    },
    API_BASE_URL,
  );

  return response;
}

export async function joinStudySession(
  sessionId: number,
  userId: number,
): Promise<APIResponseData<JoinStudySessionResponse>> {
  const response = await apiFetch<JoinStudySessionResponse>(
    `/api/study-sessions/${sessionId}/join?userId=${userId}`,
    {
      method: "POST",
    },
    API_BASE_URL,
  );

  return response;
}

export async function getAdminSessionStats(): Promise<
  APIResponseData<AdminSessionStatsResponse>
> {
  const response = await apiFetch<AdminSessionStatsResponse>(
    "/api/admin/sessions/stats",
    {
      method: "GET",
    },
    API_BASE_URL,
  );

  return response;
}

export async function getAdminSessions(params: {
  keyword?: string;
  status?: ScheduleStatus | null;
  studyMode?: StudyMode | null;
  sessionType?: ScheduleType | null;
  startFrom?: string;
  startTo?: string;
  page?: number;
  limit?: number;
}): Promise<APIResponseData<PageResponse<AdminSessionRowResponse>>> {
  const query = new URLSearchParams();

  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.studyMode) query.set("studyMode", params.studyMode);
  if (params.sessionType) query.set("sessionType", params.sessionType);
  if (params.startFrom) query.set("startFrom", params.startFrom);
  if (params.startTo) query.set("startTo", params.startTo);
  query.set("page", String(params.page ?? 0));
  query.set("limit", String(params.limit ?? 10));

  const response = await apiFetch<PageResponse<AdminSessionRowResponse>>(
    `/api/admin/sessions?${query.toString()}`,
    {
      method: "GET",
    },
    API_BASE_URL,
  );

  return response;
}
