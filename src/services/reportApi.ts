import { BASE_URL } from "../config/BaseConfig";
import { apiFetch } from "../config/apiClient";
import { StatusCode } from "../config/APIResponse";
import type { APIResponseData } from "../config/APIResponse";

export type ReportTargetType = "USER" | "POST" | "GROUP" | "DOCUMENT";

export interface ReportOption {
  value: string;
  title: string;
}

export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "INAPPROPRIATE_CONTENT"
  | "FAKE_INFORMATION"
  | "SCAM"
  | "CHEATING"
  | "OTHER"
  | (string & {});

export type ReportStatus =
  | "PENDING"
  | "REVIEWING"
  | "RESOLVED"
  | "REJECTED"
  | "CLOSED"
  | (string & {});

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

export interface ReportResponse {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  description?: string | null;
  status?: ReportStatus;
  adminNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
  reporterUserId?: number;
  reporterName?: string;
  reviewerUserId?: number | null;
  target_name?: string;
  [key: string]: unknown;
}

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  description: string;
}

export interface GetMyReportsParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetAdminReportsParams {
  status?: ReportStatus | null;
  targetType?: ReportTargetType | null;
  reason?: ReportReason | null;
  page?: number;
  size?: number;
}

export interface UpdateAdminReportStatusRequest {
  status: ReportStatus;
  adminNote?: string;
}

const buildQueryString = (
  params: Record<string, string | number | null | undefined>,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const normalizeText = (value?: string | null) =>
  value?.trim().toLowerCase() || "";

export async function createReport(
  payload: CreateReportRequest,
): Promise<APIResponseData<ReportResponse | null>> {
  return apiFetch<ReportResponse | null>(
    "/api/reports",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    BASE_URL,
  );
}

export async function getMyReports(
  params: GetMyReportsParams = {},
): Promise<APIResponseData<PageResponse<ReportResponse>>> {
  const query = buildQueryString({
    page: params.page,
    size: params.size,
    sort: params.sort,
  });

  return apiFetch<PageResponse<ReportResponse>>(
    `/api/reports/my${query}`,
    {
      method: "GET",
    },
    BASE_URL,
  );
}

export async function getMyReportDetail(
  reportId: number,
): Promise<APIResponseData<ReportResponse>> {
  return apiFetch<ReportResponse>(
    `/api/reports/my/${reportId}`,
    {
      method: "GET",
    },
    BASE_URL,
  );
}

export async function getAdminReports(
  params: GetAdminReportsParams = {},
): Promise<APIResponseData<PageResponse<ReportResponse>>> {
  const query = buildQueryString({
    status: params.status,
    targetType: params.targetType,
    reason: params.reason,
    page: params.page,
    size: params.size,
  });

  return apiFetch<PageResponse<ReportResponse>>(
    `/api/admin/reports${query}`,
    {
      method: "GET",
    },
    BASE_URL,
  );
}

export async function getAdminReportDetail(
  reportId: number,
): Promise<APIResponseData<ReportResponse>> {
  return apiFetch<ReportResponse>(
    `/api/admin/reports/${reportId}`,
    {
      method: "GET",
    },
    BASE_URL,
  );
}

export async function updateAdminReportStatus(
  reportId: number,
  payload: UpdateAdminReportStatusRequest,
): Promise<APIResponseData<ReportResponse>> {
  return apiFetch<ReportResponse>(
    `/api/admin/reports/${reportId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    BASE_URL,
  );
}

export function isDuplicateReportResponse(
  response: APIResponseData<unknown>,
): boolean {
  const code = normalizeText(String(response.code ?? ""));
  const message = normalizeText(response.message);

  return (
    code.includes("duplicate") ||
    code.includes("already") ||
    message.includes("duplicate") ||
    message.includes("already reported") ||
    message.includes("already exists") ||
    message.includes("đã báo cáo") ||
    message.includes("trước đó")
  );
}

export function getReportErrorMessage(
  response: APIResponseData<unknown>,
): string {
  const message = response.message?.trim();

  if (!message) {
    return "Không thể gửi báo cáo. Vui lòng thử lại sau.";
  }

  const normalizedMessage = normalizeText(message);

  if (
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("chưa đăng nhập") ||
    normalizedMessage.includes("đăng nhập")
  ) {
    return "Vui lòng đăng nhập lại để gửi báo cáo.";
  }

  if (
    normalizedMessage.includes("not found") ||
    normalizedMessage.includes("không tồn tại") ||
    normalizedMessage.includes("không tìm thấy")
  ) {
    return "Không tìm thấy đối tượng cần báo cáo.";
  }

  return message;
}

let cachedTargetTypes: ReportOption[] | null = null;
let cachedReasons: ReportOption[] | null = null;
let cachedTargetTypesPromise: Promise<APIResponseData<ReportOption[]>> | null = null;
let cachedReasonsPromise: Promise<APIResponseData<ReportOption[]>> | null = null;

export async function getTargetTypes(): Promise<APIResponseData<ReportOption[]>> {
  if (cachedTargetTypes) {
    return {
      success: true,
      code: StatusCode.SUCCESS,
      message: "Lấy danh sách loại đối tượng báo cáo thành công",
      data: cachedTargetTypes,
    };
  }
  if (cachedTargetTypesPromise) {
    return cachedTargetTypesPromise;
  }
  cachedTargetTypesPromise = apiFetch<ReportOption[]>(
    "/api/reports/target-types",
    { method: "GET" },
    BASE_URL,
  );
  const response = await cachedTargetTypesPromise;
  if (response.success && response.data) {
    cachedTargetTypes = response.data;
  }
  cachedTargetTypesPromise = null;
  return response;
}

export async function getReasons(): Promise<APIResponseData<ReportOption[]>> {
  if (cachedReasons) {
    return {
      success: true,
      code: StatusCode.SUCCESS,
      message: "Lấy danh sách lý do báo cáo thành công",
      data: cachedReasons,
    };
  }
  if (cachedReasonsPromise) {
    return cachedReasonsPromise;
  }
  cachedReasonsPromise = apiFetch<ReportOption[]>(
    "/api/reports/reasons",
    { method: "GET" },
    BASE_URL,
  );
  const response = await cachedReasonsPromise;
  if (response.success && response.data) {
    cachedReasons = response.data;
  }
  cachedReasonsPromise = null;
  return response;
}

