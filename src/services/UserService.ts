import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";
import { BASE_URL } from "../config/BaseConfig";
import {
  AdminUserDbRow,
  AdminUserRole,
  AdminUserStatus,
} from "../pages/admin/AdminUsersPage/types";
import { PageResponse } from "./GroupService";

type FormLogin = {
  email: string;
  password: string;
};
export const loginRequest = async (form: FormLogin): Promise<any> => {
  const data = await apiFetch<any>(
    "/users/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    },
    BASE_URL,
  );
  return data;
};

export interface UserBasicInfo {
  userId: number;
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
  username: string | null;
  bio?: string | null;
}

const API_BASE_URL_USER = BASE_URL;

export async function getUserById(
  userId: number,
): Promise<UserBasicInfo | null> {
  try {
    const res = await apiFetch<UserBasicInfo>(
      `/api/admin/${userId}`,
      { method: "GET" },
      API_BASE_URL_USER,
    );
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

type UpdateAdminUserStatusResponse = {
  userId: number;
  status: AdminUserStatus;
};

export async function updateAdminUserStatus(
  userId: number,
  status: AdminUserStatus,
): Promise<APIResponseData<UpdateAdminUserStatusResponse>> {
  const response = await apiFetch<UpdateAdminUserStatusResponse>(
    `/api/admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    API_BASE_URL_USER,
  );

  return response;
}

export interface StudentSearchItem {
  user_id: number;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  bio: string | null;
}

export async function searchStudents(
  keyword: string,
  page: number = 0,
  size: number = 50,
): Promise<APIResponseData<PageResponse<StudentSearchItem>>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  if (keyword.trim()) {
    params.set("keyword", keyword.trim());
  }

  const response = await apiFetch<PageResponse<StudentSearchItem>>(
    `/api/users/search?${params.toString()}`,
    { method: "GET" },
    API_BASE_URL_USER,
  );

  return response;
}

export async function getAdminUsers(
  page: number,
  size: number,
  status?: AdminUserStatus | null,
  keyword?: string | null,
  role?: AdminUserRole | null,
): Promise<APIResponseData<PageResponse<AdminUserDbRow>>> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("size", String(size));

  if (status) {
    params.set("status", status);
  }

  if (keyword?.trim()) {
    params.set("keyword", keyword.trim());
  }

  if (role) {
    params.set("role", role);
  }

  const response = await apiFetch<PageResponse<AdminUserDbRow>>(
    `/api/admin/users?${params.toString()}`,
    {
      method: "GET",
    },
    API_BASE_URL_USER,
  );

  return response;
}

export interface InviteAdminResponse {
  invitationId: number;
  email: string;
  status: string;
  expiresAt: string;
}

export interface VerifyInvitationResponse {
  email: string;
  fullName: string;
}

export interface ActivateAdminRequest {
  token: string;
  fullName: string;
  password?: string;
  confirmPassword?: string;
}

export async function inviteAdmin(
  email: string,
): Promise<APIResponseData<InviteAdminResponse>> {
  const response = await apiFetch<InviteAdminResponse>(
    "/api/super-admin/admin-invitations",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    API_BASE_URL_USER,
  );
  return response;
}

export async function verifyAdminInvitation(
  token: string,
): Promise<APIResponseData<VerifyInvitationResponse>> {
  const response = await apiFetch<VerifyInvitationResponse>(
    `/api/public/admin-invitations/verify?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
    },
    API_BASE_URL_USER,
  );
  return response;
}

export async function activateAdmin(
  payload: ActivateAdminRequest,
): Promise<APIResponseData<any>> {
  const response = await apiFetch<any>(
    "/api/public/admin-invitations/activate",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    API_BASE_URL_USER,
  );
  return response;
}

export interface UpdateAdminStatusResponse {
  status: AdminUserStatus;
}

export async function updateAdminStatus(
  adminId: number,
  status: AdminUserStatus,
): Promise<APIResponseData<UpdateAdminStatusResponse>> {
  const response = await apiFetch<UpdateAdminStatusResponse>(
    `/api/super-admin/admins/${adminId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    API_BASE_URL_USER,
  );
  return response;
}

export interface UpdateAdminProfileRequest {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AdminProfileResponse {
  userId: number;
  fullName: string;
  avatarUrl: string | null;
  email: string;
  bio: string | null;
  role: string;
}

export async function updateAdminProfile(
  payload: UpdateAdminProfileRequest,
): Promise<APIResponseData<AdminProfileResponse>> {
  const response = await apiFetch<AdminProfileResponse>(
    "/api/admin/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    API_BASE_URL_USER,
  );
  return response;
}

export interface ChangeAdminPasswordRequest {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export async function changeAdminPassword(
  payload: ChangeAdminPasswordRequest,
): Promise<APIResponseData<void>> {
  const response = await apiFetch<void>(
    "/api/admin/change-password",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    API_BASE_URL_USER,
  );
  return response;
}


