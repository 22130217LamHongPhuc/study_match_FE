import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";

const API_BASE_URL_PROFILE = "http://localhost:8082/api";
const API_BASE_URL_GROUP = "http://localhost:8086";

type Subject = {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
};

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type SlotCode = "ca1" | "ca2" | "ca3" | "ca4" | "ca5" | "ca6";

export interface FreeTimeSlotRequest {
  dayOfWeek: DayOfWeek;
  slotCode: SlotCode;
  isAvailable: boolean;
}

export interface CreateStudyGroupRequest {
  name: string;
  description?: string;
  ownerUserId: number;
  mainSubjectId: number;
  subjectName?: string;
  studyGoal?: string;
  studyMode?: string;
  maxMembers: number;
  visibility?: string;
  freeTimeSlots?: FreeTimeSlotRequest[];
}

export async function getAllSubjectsByCurriculum(
  curriculumId: number,
): Promise<APIResponseData<Subject[]>> {
  const response = await apiFetch<Subject[]>(
    `/subjects/by-curriculum/${curriculumId}`,
    {
      method: "GET",
    },
    API_BASE_URL_PROFILE,
  );
  return response;
}

export async function createStudyGroup(
  payload: CreateStudyGroupRequest,
): Promise<APIResponseData<unknown>> {
  const response = await apiFetch<unknown>(
    `/api/groups`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    API_BASE_URL_GROUP,
  );
  return response;
}
