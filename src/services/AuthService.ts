import { data } from "react-router-dom";
import { APIResponse, APIResponseData } from "../config/APIResponse";

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

const API_BASE_URL = "http://localhost:8085/api/auth";
export async function login(
  email: string,
  password: string,
): Promise<APIResponseData<AuthResponse>> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }
  const data: APIResponseData<AuthResponse> = await response.json();
  return data;
}

export async function register(
  email: string,
  password: string,
): Promise<APIResponseData<AuthResponse>> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Register failed");
  }
  const data: APIResponseData<AuthResponse> = await response.json();
  return data;
}
