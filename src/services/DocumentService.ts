import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";

export interface DocumentResponse {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  category: string;
  fileType: string;
  fileSize: number;
  uploaderId: number;
  uploaderName?: string;
  sourceName?: string;
  viewCount: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
}

export interface DocumentDetailResponse extends DocumentResponse {
  fileUrl: string;
  storageKey?: string;
  originalFileName: string;
  mimeType: string;
  status: string;
  rejectionReason?: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DocumentRatingResponse {
  id: number;
  documentId: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  score: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListQuery {
  search?: string;
  subjectId?: number | string;
  category?: string;
  fileType?: string;
  minRating?: number;
  sortBy?: string;
  page?: number;
  size?: number;
}

export interface PageData<T> {
  content: T[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface BookmarkListResponse {
  content: DocumentResponse[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface CreateLearningDocumentRequest {
  title: string;
  description?: string;
  subjectId: number;
  category: string;
  fileUrl: string;
  storageKey?: string;
  originalFileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  sourceName?: string;
}

const API_BASE_URL = (process.env.API_BASE_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:8080") + "/api";

export async function getDocuments(query: DocumentListQuery): Promise<APIResponseData<PageData<DocumentResponse>>> {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.subjectId) params.append("subjectId", String(query.subjectId));
  if (query.category) params.append("category", query.category);
  if (query.fileType) params.append("fileType", query.fileType);
  if (query.minRating) params.append("minRating", String(query.minRating));
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.page !== undefined) params.append("page", String(query.page));
  if (query.size !== undefined) params.append("size", String(query.size));

  const res = await apiFetch<any>(`/documents?${params.toString()}`, {
    method: "GET",
  });

  if (res && res.data) {
    res.data = {
      content: res.data.items || [],
      page: res.data.page,
      limit: res.data.size,
      totalElements: res.data.totalItems,
      totalPages: res.data.totalPages,
      hasNext: res.data.hasNext
    };
  }
  return res;
}

export async function getDocumentDetail(documentId: number | string): Promise<APIResponseData<DocumentDetailResponse>> {
  return apiFetch<DocumentDetailResponse>(`/documents/${documentId}`, {
    method: "GET",
  });
}

export async function bookmarkDocument(documentId: number | string): Promise<APIResponseData<string>> {
  return apiFetch<string>(`/documents/${documentId}/bookmark`, {
    method: "POST",
  });
}

export async function unbookmarkDocument(documentId: number | string): Promise<APIResponseData<string>> {
  return apiFetch<string>(`/documents/${documentId}/bookmark`, {
    method: "DELETE",
  });
}

export async function getBookmarkStatus(documentId: number | string): Promise<APIResponseData<boolean>> {
  return apiFetch<boolean>(`/documents/${documentId}/bookmark-status`, {
    method: "GET",
  });
}

export async function getMyBookmarks(page = 0, size = 10): Promise<APIResponseData<BookmarkListResponse>> {
  const res = await apiFetch<any>(`/documents/me/bookmarks?page=${page}&size=${size}`, {
    method: "GET",
  });

  if (res && res.data) {
    res.data = {
      content: res.data.items || [],
      page: res.data.page,
      limit: res.data.size,
      totalElements: res.data.totalItems,
      totalPages: res.data.totalPages,
      hasNext: res.data.hasNext
    };
  }
  return res;
}

export async function getFeaturedDocuments(limit = 10): Promise<APIResponseData<DocumentResponse[]>> {
  return apiFetch<DocumentResponse[]>(`/documents/featured?limit=${limit}`, {
    method: "GET",
  });
}

export async function createDocument(payload: CreateLearningDocumentRequest): Promise<APIResponseData<DocumentResponse>> {
  return apiFetch<DocumentResponse>("/documents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function rateDocument(
  documentId: number | string,
  score: number,
  review?: string
): Promise<APIResponseData<DocumentRatingResponse>> {
  return apiFetch<DocumentRatingResponse>(`/documents/${documentId}/rating`, {
    method: "PUT",
    body: JSON.stringify({ score, review: review || undefined }),
  });
}

export async function deleteRating(documentId: number | string): Promise<APIResponseData<string>> {
  return apiFetch<string>(`/documents/${documentId}/rating`, {
    method: "DELETE",
  });
}

export async function getMyRating(documentId: number | string): Promise<APIResponseData<DocumentRatingResponse>> {
  return apiFetch<DocumentRatingResponse>(`/documents/${documentId}/rating/me`, {
    method: "GET",
  });
}

export async function getDocumentRatings(
  documentId: number | string,
  page = 0,
  size = 5
): Promise<APIResponseData<PageData<DocumentRatingResponse>>> {
  const res = await apiFetch<any>(`/documents/${documentId}/ratings?page=${page}&size=${size}`, {
    method: "GET",
  });

  if (res && res.data) {
    res.data = {
      content: res.data.items || [],
      page: res.data.page,
      limit: res.data.size,
      totalElements: res.data.totalItems,
      totalPages: res.data.totalPages,
      hasNext: res.data.hasNext
    };
  }
  return res;
}

export async function reportDocument(
  documentId: number | string,
  reason: string,
  description?: string
): Promise<APIResponseData<string>> {
  return apiFetch<string>(`/documents/${documentId}/reports`, {
    method: "POST",
    body: JSON.stringify({ reason, description: description || undefined }),
  });
}

export function getPreviewUrl(documentId: number | string): string {
  return `${API_BASE_URL}/documents/${documentId}/preview`;
}

export async function getMyUploadedDocuments(
  status?: string,
  page = 0,
  size = 10
): Promise<APIResponseData<PageData<DocumentDetailResponse>>> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("page", String(page));
  params.append("size", String(size));

  const res = await apiFetch<any>(`/documents/me/documents?${params.toString()}`);

  if (res && res.data) {
    res.data = {
      content: res.data.items || [],
      page: res.data.page,
      limit: res.data.size,
      totalElements: res.data.totalItems,
      totalPages: res.data.totalPages,
      hasNext: res.data.hasNext
    };
  }
  return res;
}

export function getDownloadUrl(documentId: number | string): string {
  return `${API_BASE_URL}/documents/${documentId}/download`;
}

export interface AdminDocumentResponse extends DocumentDetailResponse {
  hiddenReason?: string;
  reviewerId?: number;
  reviewedAt?: string;
  unresolvedReportCount: number;
}

export interface AdminDocumentQuery {
  search?: string;
  status?: string;
  subjectId?: number | string;
  category?: string;
  uploaderId?: number | string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  page?: number;
  size?: number;
}

export async function getAdminDocuments(query: AdminDocumentQuery): Promise<APIResponseData<PageData<AdminDocumentResponse>>> {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.status) params.append("status", query.status);
  if (query.subjectId) params.append("subjectId", String(query.subjectId));
  if (query.category) params.append("category", query.category);
  if (query.uploaderId) params.append("uploaderId", String(query.uploaderId));
  if (query.startDate) params.append("startDate", query.startDate);
  if (query.endDate) params.append("endDate", query.endDate);
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.page !== undefined) params.append("page", String(query.page));
  if (query.size !== undefined) params.append("size", String(query.size));

  const res = await apiFetch<any>(`/admin/documents?${params.toString()}`);

  if (res && res.data) {
    res.data = {
      content: res.data.items || [],
      page: res.data.page,
      limit: res.data.size,
      totalElements: res.data.totalItems,
      totalPages: res.data.totalPages,
      hasNext: res.data.hasNext
    };
  }
  return res;
}

export async function getAdminDocumentDetail(id: number | string): Promise<APIResponseData<AdminDocumentResponse>> {
  return apiFetch<AdminDocumentResponse>(`/admin/documents/${id}`);
}

export async function approveDocument(id: number | string): Promise<APIResponseData<AdminDocumentResponse>> {
  return apiFetch<AdminDocumentResponse>(`/admin/documents/${id}/approve`, {
    method: "PATCH"
  });
}

export async function rejectDocument(id: number | string, rejectionReason: string): Promise<APIResponseData<AdminDocumentResponse>> {
  return apiFetch<AdminDocumentResponse>(`/admin/documents/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ rejectionReason })
  });
}

export async function hideDocument(id: number | string, hiddenReason: string): Promise<APIResponseData<AdminDocumentResponse>> {
  return apiFetch<AdminDocumentResponse>(`/admin/documents/${id}/hide`, {
    method: "PATCH",
    body: JSON.stringify({ hiddenReason })
  });
}

export async function restoreDocument(id: number | string): Promise<APIResponseData<AdminDocumentResponse>> {
  return apiFetch<AdminDocumentResponse>(`/admin/documents/${id}/restore`, {
    method: "PATCH"
  });
}

