import { APIResponseData, StatusCode } from "./APIResponse";

const API_BASE_URL = "http://localhost:8085/api";
const API_BASE_URL2 = "http://localhost:8085/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  api_base_url: string = API_BASE_URL,
): Promise<APIResponseData<T>> {
  let response = await request<T>(endpoint, options, api_base_url);

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

  return request<T>(endpoint, options, api_base_url);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  api_base_url: string,
): Promise<APIResponseData<T>> {
  const accessToken = localStorage.getItem("accessToken");

  console.log("Making API request to:", `${api_base_url}${endpoint}`);
  console.log("Request options:", options);
  console.log("Access token:", accessToken);

  const res = await fetch(`${api_base_url}${endpoint}`, {
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
