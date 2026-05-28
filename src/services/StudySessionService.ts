import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";
import {
  CreateStudySessionRequest,
  StudySessionResponse,
} from "../pages/StudySession/types";

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
