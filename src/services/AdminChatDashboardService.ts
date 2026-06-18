import { apiFetch } from "../config/apiClient";
import type { APIResponseData } from "../config/APIResponse";

const CHAT_SERVICE_BASE_URL = "http://localhost:8089";

export type AdminChatSummary = {
  totalMessages: number;
  totalViolations: number;
  offensiveMessages: number;
  hateMessages: number;
  groupsWithViolations: number;
  violatingMembers: number;
};

export type AdminChatGroupRisk = {
  groupId: number;
  groupName: string;
  conversationId: number;
  totalMessages: number;
  offensiveMessages: number;
  hateMessages: number;
  violatingMembers: number;
  activeMembers: number;
  lastViolationAt: string | null;
};

export type AdminChatMemberRisk = {
  groupId: number;
  groupName: string;
  senderId: number;
  senderName: string;
  senderAvatarUrl?: string | null;
  senderEmail?: string | null;
  totalMessages: number;
  offensiveMessages: number;
  hateMessages: number;
  lastViolationAt: string | null;
};

export type AdminChatReviewItem = {
  id: string;
  priority: "HIGH" | "MEDIUM";
  groupName: string;
  senderName: string;
  reason: string;
  suggestion: string;
};

export type AdminChatTrendPoint = {
  label: string;
  offensive: number;
  hate: number;
};

export type AdminChatDashboardResponse = {
  summary: AdminChatSummary;
  topGroups: AdminChatGroupRisk[];
  topMembers: AdminChatMemberRisk[];
  reviewQueue: AdminChatReviewItem[];
  trend: AdminChatTrendPoint[];
};

export type AdminChatUserViolationGroup = {
  groupId: number;
  groupName: string;
  conversationId: number;
  totalMessages: number;
  offensiveMessages: number;
  hateMessages: number;
  lastViolationAt: string | null;
};

export type AdminChatUserViolation = {
  userId: number;
  fullName: string;
  avatarUrl?: string | null;
  email?: string | null;
  totalJoinedGroups: number;
  totalMessages: number;
  offensiveMessages: number;
  hateMessages: number;
  groups: AdminChatUserViolationGroup[];
};

export type AdminChatUserViolationSearchResponse = {
  users: AdminChatUserViolation[];
};

export async function getAdminChatDashboard(params?: {
  groupLimit?: number;
  memberLimit?: number;
}): Promise<APIResponseData<AdminChatDashboardResponse>> {
  const query = new URLSearchParams({
    groupLimit: String(params?.groupLimit ?? 10),
    memberLimit: String(params?.memberLimit ?? 10),
  });

  return apiFetch<AdminChatDashboardResponse>(
    `/api/admin/chat/dashboard?${query.toString()}`,
    { method: "GET" },
    CHAT_SERVICE_BASE_URL,
  );
}

export async function kickAdminChatUserFromGroup(params: {
  userId: number;
  groupId: number;
}): Promise<APIResponseData<null>> {
  return apiFetch<null>(
    `/api/admin/chat/users/${params.userId}/groups/${params.groupId}/kick`,
    { method: "POST" },
    CHAT_SERVICE_BASE_URL,
  );
}

export async function searchAdminChatUserViolations(params: {
  keyword: string;
  limit?: number;
}): Promise<APIResponseData<AdminChatUserViolationSearchResponse>> {
  const query = new URLSearchParams({
    keyword: params.keyword,
    limit: String(params.limit ?? 5),
  });

  return apiFetch<AdminChatUserViolationSearchResponse>(
    `/api/admin/chat/users/search?${query.toString()}`,
    { method: "GET" },
    CHAT_SERVICE_BASE_URL,
  );
}
