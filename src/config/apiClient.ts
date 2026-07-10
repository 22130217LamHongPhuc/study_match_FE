import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIResponseData, StatusCode } from "./APIResponse";

const API_BASE_URL = "http://localhost:8085/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;
    if (resData && resData.code === StatusCode.INVALID_TOKEN) {
      const originalRequest = response.config;

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        refreshToken()
          .then((newAccessToken) => {
            if (newAccessToken) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              processQueue(null, newAccessToken);
              resolve(apiClient(originalRequest));
            } else {
              handleLogout();
              const err = new Error("Phiên đăng nhập hết hạn");
              processQueue(err, null);
              reject(err);
            }
          })
          .catch((err) => {
            handleLogout();
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const resData = error.response?.data as any;

    const isTokenExpired =
      status === 401 || (resData && resData.code === StatusCode.INVALID_TOKEN);

    if (isTokenExpired && originalRequest) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        refreshToken()
          .then((newAccessToken) => {
            if (newAccessToken) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              processQueue(null, newAccessToken);
              resolve(apiClient(originalRequest));
            } else {
              handleLogout();
              const err = new Error("Phiên đăng nhập hết hạn");
              processQueue(err, null);
              reject(err);
            }
          })
          .catch((err) => {
            handleLogout();
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  
  const currentPath = window.location.pathname;
  if (currentPath.startsWith("/admin")) {
    window.location.href = "/admin/login";
  } else {
    window.location.href = "/login";
  }
}

async function refreshToken(): Promise<string | null> {
  const rToken = localStorage.getItem("refreshToken");
  if (!rToken) return null;

  try {
    const res = await axios.post<APIResponseData<{ accessToken: string; refreshToken: string }>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: rToken },
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.data && res.data.success && res.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      return accessToken;
    }
  } catch (error) {
    console.error("Lỗi khi refresh token:", error);
  }

  return null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  api_base_url: string = API_BASE_URL
): Promise<APIResponseData<T>> {
  const method = (options.method || "GET").toUpperCase() as any;

  let url = endpoint;
  if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
    url = `${api_base_url}${endpoint}`;
  }

  let headers: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      headers = { ...options.headers } as Record<string, string>;
    }
  }

  let data = options.body;
  if (data && typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
    }
  }

  try {
    const response = await apiClient.request<APIResponseData<T>>({
      url,
      method,
      headers,
      data,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data as APIResponseData<T>;
    }
    return {
      success: false,
      code: StatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || "Lỗi kết nối mạng",
      data: null as T,
    };
  }
}
