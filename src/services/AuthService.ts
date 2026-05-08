import { data } from "react-router-dom";
import { APIResponse, APIResponseData } from "../config/APIResponse";
import { apiFetch } from "../config/apiClient";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  onboardingCompleted: boolean;
  userId: number;
}

const API_BASE_URL = "http://localhost:8085/api/auth";
export async function login(
  email: string,
  password: string,
): Promise<APIResponseData<AuthResponse>> {
  const response = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function loginWithGoogle(
  idToken: string,
): Promise<APIResponseData<AuthResponse>> {
  const response = await apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
  return response;
}

export async function register(
  email: string,
  password: string,
): Promise<APIResponseData<AuthResponse>> {
  const response = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function logout(): Promise<APIResponseData<String>> {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await apiFetch<String>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  return response;
}

export async function testApi(
  userId: number,
): Promise<APIResponseData<string>> {
  const response = await apiFetch<string>(`/admin`, {
    method: "GET",
  });
  return response;
}
