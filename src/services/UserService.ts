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
export const loginRequest = async (form: FormLogin) => {
  const url = BASE_URL + "/users/login";
  console.log(url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: form.email,
      password: form.password,
    }),
  });
  const data = await res.json();

  console.log(data);

  return data;
};

type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

const API_BASE_URL_USER = "http://localhost:8085";

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
