import { APIResponseData, StatusCode } from "./APIResponse";

const API_BASE_URL = "http://localhost:8085/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<APIResponseData<T>> {
  let response = await request<T>(endpoint, options);

  if (response.success) {
    return response;
  }

  if (response.code !== StatusCode.INVALID_TOKEN) {
    return response;
  }

  const refreshSuccess = await refreshToken();

  if (!refreshSuccess) {
    return response;
  }

  return request<T>(endpoint, options);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<APIResponseData<T>> {
  const accessToken = localStorage.getItem("accessToken");

  console.log("Making API request to:", `${API_BASE_URL}${endpoint}`);
  console.log("Request options:", options);
  console.log("Access token:", accessToken);

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  console.log("API Response:", data);
  return data;
}

async function refreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");

  console.log(
    "Attempting to refresh token. Current refresh token:",
    refreshToken,
  );

  // if (!refreshToken) return false;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const response = await res.json();
  console.log("Refresh token response:", response);

  if (!response.success) {
    return false;
  }

  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);

  return true;
}
