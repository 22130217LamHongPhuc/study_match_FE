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
  subjectName: string;
  maxMembers?: number;
  visibility?: string;
  freeTimeSlots?: FreeTimeSlotRequest[];
}

export interface StudyGroupDetailResponse {
  id: number;
  name: string;
  description: string;
  ownerUserId: number;
  termId: number;
  mainSubjectId: number;
  subjectName: string;
  studyGoal: string;
  studyMode: string;
  maxMembers: number;
  visibility: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

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

export type AdminGroupType = "COMMUNITY" | "STUDY";
export type AdminGroupStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DELETED";

export interface AdminGroupRowResponse {
  createdAt: string;
  id: number;
  memberCount: number;
  name: string;
  status: AdminGroupStatus;
  subjectName: string;
  type: AdminGroupType;
}
export interface GroupStatsResponse {
  totalGroup: number;
  communityGroup: number;
  publicGroup: number;
  privateGroup: number;
}

export type AdminGroupVisibility =
  | "PUBLIC"
  | "PRIVATE"
  | "COMMUNITY"
  | (string & {});

export interface AdminGroupFreeTimeSlot {
  id: number;
  groupId: number;
  termId: number;
  dayOfWeek: DayOfWeek;
  slotCode: SlotCode;
  isAvailable: boolean;
}

export interface AdminGroupDetailResponse {
  id: number;
  name: string;
  description?: string | null;
  groupType: AdminGroupType;
  createdByUserId?: number | null;
  ownerUserId?: number | null;
  termId?: number | null;
  mainSubjectId?: number | null;
  subjectName?: string | null;
  maxMembers?: number | null;
  visibility?: AdminGroupVisibility | null;
  status: AdminGroupStatus;
  memberCount?: number | null;
  createdAt: string;
  updatedAt: string;
  freeTimeSlots?: AdminGroupFreeTimeSlot[] | null;
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

export async function getAllSubjects(): Promise<APIResponseData<Subject[]>> {
  const response = await apiFetch<Subject[]>(
    `/subjects`,
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

export async function createCommunityGroup(
  payload: CreateStudyGroupRequest,
): Promise<APIResponseData<unknown>> {
  const response = await apiFetch<unknown>(
    `/api/groups/community`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function getGroupsByUserId(
  userId: number,
): Promise<APIResponseData<StudyGroupDetailResponse[]>> {
  const response = await apiFetch<StudyGroupDetailResponse[]>(
    `/api/groups/user/${userId}`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function getAdminGroups(
  page: number,
  size: number,
  type: AdminGroupType | null,
  status: AdminGroupStatus | null,
  keyword: string | null,
): Promise<APIResponseData<PageResponse<AdminGroupRowResponse>>> {
  const response = await apiFetch<PageResponse<AdminGroupRowResponse>>(
    `/api/admin/groups?page=${page}&size=${size}${
      type ? `&type=${type}` : ""
    }${status ? `&status=${status}` : ""}${keyword ? `&keyword=${keyword}` : ""}`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function getGroupStatsForAdmin(): Promise<
  APIResponseData<GroupStatsResponse>
> {
  const response = await apiFetch<GroupStatsResponse>(
    `/api/admin/groups/stats`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function getAdminGroupDetail(
  groupId: number,
): Promise<APIResponseData<AdminGroupDetailResponse>> {
  const response = await apiFetch<AdminGroupDetailResponse>(
    `/api/admin/groups/${groupId}`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );

  return response;
}
