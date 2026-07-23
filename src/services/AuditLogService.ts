import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";

export interface AuditLogItem {
  id: number;
  adminId: number;
  adminName: string;
  adminEmail: string;
  action: string;
  targetId: string;
  targetType: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  content: AuditLogItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  action?: string;
  targetType?: string;
}

export async function getAuditLogs(
  params: AuditLogQueryParams
): Promise<APIResponseData<AuditLogsResponse>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.action) query.set("action", params.action);
  if (params.targetType) query.set("targetType", params.targetType);

  return apiFetch<AuditLogsResponse>(
    `/super-admin/audit-logs?${query.toString()}`,
    { method: "GET" }
  );
}

export interface AuditLogFiltersResponse {
  actions: string[];
  targetTypes: string[];
}

export async function getAuditLogFilters(): Promise<APIResponseData<AuditLogFiltersResponse>> {
  return apiFetch<AuditLogFiltersResponse>(
    "/super-admin/audit-logs/filters",
    { method: "GET" }
  );
}
