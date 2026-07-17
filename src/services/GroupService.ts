import { apiFetch } from "../config/apiClient";
import { APIResponseData, StatusCode } from "../config/APIResponse";

import { BASE_URL } from "../config/BaseConfig";

const API_BASE_URL_PROFILE = BASE_URL + "/api";
const API_BASE_URL_GROUP = BASE_URL;

export type Subject = {
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
  invitedUserIds?: number[];
}

export interface StudyGroupDetailResponse {
  id: number;
  name: string;
  avatarUrl?: string | null;
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

export type BrowseGroupType = "COMMUNITY" | "STUDY" | (string & {});
export type BrowseGroupStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED"
  | "DELETED"
  | (string & {});

export type BrowseGroupVisibility =
  | "PUBLIC"
  | "PRIVATE"
  | "COMMUNITY"
  | (string & {});

export interface BrowseGroupResponse {
  id: number;
  name: string;
  avatarUrl?: string | null;
  description?: string | null;
  ownerUserId?: number | null;
  termId?: number | null;
  mainSubjectId?: number | null;
  subjectName?: string | null;
  maxMembers?: number | null;
  visibility?: BrowseGroupVisibility | null;
  status: BrowseGroupStatus;
  createdAt: string;
  updatedAt: string;
  memberCount?: number | null;
  member?: boolean;
  joinRequestPending?: boolean;
}

export type AdminGroupType = "COMMUNITY" | "STUDY";
export type AdminGroupStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DELETED";

export interface AdminGroupRowResponse {
  createdAt: string;
  id: number;
  memberCount: number;
  name: string;
  avatarUrl?: string | null;
  status: AdminGroupStatus;
  subjectName: string;
  type: AdminGroupType;
  visibility?: AdminGroupVisibility;
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
  avatarUrl?: string | null;
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
  members?: AdminGroupMemberInfo[] | null;
}

export interface AdminGroupMemberInfo {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
  joinedAt: string;
}

export type GroupMemberRole = "OWNER" | "ADMIN" | "MEMBER" | (string & {});
export type GroupMemberStatus = "ACTIVE" | "LEFT" | "REMOVED" | (string & {});

export interface GroupMemberResponse {
  userId: number;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joinedAt?: string | null;
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
  avatar?: File,
): Promise<APIResponseData<unknown>> {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );
  if (avatar) {
    formData.append("avatar", avatar);
  }

  const response = await apiFetch<unknown>(
    `/api/groups`,
    {
      method: "POST",
      body: formData,
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function createCommunityGroup(
  payload: CreateStudyGroupRequest,
  avatar?: File,
): Promise<APIResponseData<unknown>> {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );
  if (avatar) {
    formData.append("avatar", avatar);
  }

  const response = await apiFetch<unknown>(
    `/api/groups/community`,
    {
      method: "POST",
      body: formData,
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

export async function getGroupById(
  groupId: number,
): Promise<APIResponseData<StudyGroupDetailResponse>> {
  const response = await apiFetch<StudyGroupDetailResponse>(
    `/api/groups/${groupId}`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );

  if (typeof response?.success === "boolean") {
    return response;
  }

  return {
    success: true,
    code: StatusCode.SUCCESS,
    message: "Get group successfully",
    data: response as unknown as StudyGroupDetailResponse,
  };
}

export async function browseGroups(
  type?: BrowseGroupType,
  subject?: number,
  page: number = 0,
  limit: number = 10,
): Promise<APIResponseData<PageResponse<BrowseGroupResponse>>> {

  const userId = localStorage.getItem("userId");
  const params = new URLSearchParams();
  if (typeof subject === "number") params.set("subject", String(subject));
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await apiFetch<PageResponse<BrowseGroupResponse>>(
    `/api/groups/browse/${userId}?${params.toString()}`,
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
    `/api/admin/groups?page=${page}&size=${size}${type ? `&type=${type}` : ""
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

export async function updateAdminGroupStatus(
  groupId: number,
  status: AdminGroupStatus,
): Promise<APIResponseData<AdminGroupDetailResponse>> {
  const response = await apiFetch<AdminGroupDetailResponse>(
    `/api/admin/groups/${groupId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function removeAdminGroupMember(
  groupId: number,
  userId: number,
): Promise<APIResponseData<void>> {
  const response = await apiFetch<void>(
    `/api/admin/groups/${groupId}/members/${userId}`,
    {
      method: "DELETE",
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function changeAdminGroupOwner(
  groupId: number,
  newOwnerUserId: number,
): Promise<APIResponseData<void>> {
  const response = await apiFetch<void>(
    `/api/admin/groups/${groupId}/owner/${newOwnerUserId}`,
    {
      method: "PUT",
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function joinMemberIntoGroup(
  groupId: number,
  userId: number,
): Promise<APIResponseData<unknown>> {
  const response = await apiFetch<unknown>(
    `/api/groups/${groupId}/members`,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function requestJoinGroup(
  groupId: number,
  userId: number,
  message: string,
): Promise<APIResponseData<GroupInvitationResponse>> {
  const response = await apiFetch<GroupInvitationResponse>(
    `/api/groups/${groupId}/members`,
    {
      method: "POST",
      body: JSON.stringify({ userId, message }),
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function getActiveGroupMemberIds(
  groupId: number,
): Promise<APIResponseData<number[]>> {
  const response = await apiFetch<number[]>(
    `/api/groups/${groupId}/members/active-user-ids`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function getActiveGroupMembers(
  groupId: number,
): Promise<APIResponseData<GroupMemberResponse[]>> {
  const response = await apiFetch<GroupMemberResponse[]>(
    `/api/groups/${groupId}/members/active`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export async function kickGroupMember(
  groupId: number,
  userId: number,
): Promise<APIResponseData<unknown>> {
  const response = await apiFetch<unknown>(
    `/api/groups/${groupId}/members/${userId}/kick`,
    {
      method: "POST",
      body: JSON.stringify({ status: "remove" }),
    },
    API_BASE_URL_GROUP,
  );

  return response;
}

export interface GroupInvitationResponse {
  invitationId: number;
  groupId: number;
  groupName: string;
  groupAvatarUrl?: string;
  inviterUserId: number;
  inviteeUserId: number;
  inviterName: string;
  inviterAvatar?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  message?: string;
}

export async function sendGroupInvitation(
  groupId: number,
  userId: number,
): Promise<APIResponseData<GroupInvitationResponse>> {
  const response = await apiFetch<GroupInvitationResponse>(
    `/api/groups/${groupId}/invitations`,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function getPendingGroupInvitations(): Promise<APIResponseData<GroupInvitationResponse[]>> {
  const response = await apiFetch<GroupInvitationResponse[]>(
    `/api/groups/invitations/pending`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function getGroupInvitations(
  groupId: number,
): Promise<APIResponseData<GroupInvitationResponse[]>> {
  const response = await apiFetch<GroupInvitationResponse[]>(
    `/api/groups/${groupId}/invitations`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function acceptGroupInvitation(
  invitationId: number,
): Promise<APIResponseData<unknown>> {
  const response = await apiFetch<unknown>(
    `/api/groups/invitations/${invitationId}/accept`,
    {
      method: "POST",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function rejectGroupInvitation(
  invitationId: number,
): Promise<APIResponseData<unknown>> {
  const response = await apiFetch<unknown>(
    `/api/groups/invitations/${invitationId}/reject`,
    {
      method: "POST",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export interface UserGroupStatsResponse {
  joinedGroupCount: number;
  pendingInvitationCount: number;
}

export async function getUserGroupStats(
  userId: number,
): Promise<APIResponseData<UserGroupStatsResponse>> {
  const response = await apiFetch<UserGroupStatsResponse>(
    `/api/groups/user/${userId}/stats`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export interface UpdateStudyGroupRequest {
  name?: string;
  description?: string;
  mainSubjectId?: number;
  subjectName?: string;
  maxMembers?: number;
  visibility?: "PUBLIC" | "PRIVATE";
}

export async function updateStudyGroup(
  groupId: number,
  request: UpdateStudyGroupRequest,
  avatar?: File,
): Promise<APIResponseData<unknown>> {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  if (avatar) {
    formData.append("avatar", avatar);
  }

  const response = await apiFetch<unknown>(
    `/api/groups/${groupId}`,
    {
      method: "PUT",
      body: formData,
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function deleteStudyGroup(
  groupId: number,
): Promise<APIResponseData<unknown>> {
  const response = await apiFetch<unknown>(
    `/api/groups/${groupId}`,
    {
      method: "DELETE",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export function getGroupAvatarUrl(group?: { avatarUrl?: string | null; avatar_url?: string | null; groupAvatarUrl?: string | null } | null): string | null {
  if (!group) return null;
  const url = group.avatarUrl || group.avatar_url || group.groupAvatarUrl;
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_BASE_URL_GROUP}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getSentPendingGroupJoinRequests(): Promise<APIResponseData<GroupInvitationResponse[]>> {
  const response = await apiFetch<GroupInvitationResponse[]>(
    `/api/groups/invitations/sent-pending`,
    {
      method: "GET",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}

export async function leaveGroup(
  groupId: number,
): Promise<APIResponseData<unknown>> {
  const response = await apiFetch<unknown>(
    `/api/groups/${groupId}/members/leave`,
    {
      method: "POST",
    },
    API_BASE_URL_GROUP,
  );
  return response;
}
