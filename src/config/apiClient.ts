import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { APIResponseData, StatusCode } from "./APIResponse";

const API_BASE_URL = (process.env.API_BASE_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:8080") + "/api";

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

const getDisplayUrl = (config?: any): string => {
  if (!config) return "";
  const url = config.url || "";
  const isAbsolute = url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
  return isAbsolute ? url : `${config.baseURL || ""}${url}`;
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${getDisplayUrl(config)}`, {
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE SUCCESS] ${response.config.method?.toUpperCase()} ${getDisplayUrl(response.config)}`, {
      status: response.status,
      data: response.data
    });
    const resData = response.data;

    if (resData && (resData.code === StatusCode.USER_LOCKED || resData.code === "USER_LOCKED")) {
      const isLoginRequest = response.config.url?.includes("/auth/login") || response.config.url?.includes("/auth/admin/login") || response.config.url?.includes("/auth/google");
      if (!isLoginRequest) {
        handleForcedLogout(resData.message || "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động bởi quản trị viên.");
      }
    }

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
    console.error(`[API RESPONSE ERROR] ${error.config?.method?.toUpperCase()} ${getDisplayUrl(error.config)}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    const originalRequest = error.config;
    const status = error.response?.status;
    const resData = error.response?.data as any;

    if (resData && (resData.code === StatusCode.USER_LOCKED || resData.code === "USER_LOCKED")) {
      const isLoginRequest = originalRequest && (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/admin/login") || originalRequest.url?.includes("/auth/google"));
      if (!isLoginRequest) {
        handleForcedLogout(resData.message || "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động bởi quản trị viên.");
      }
      return Promise.reject(error);
    }

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

export function handleForcedLogout(reason: string) {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("fullName");
  localStorage.removeItem("avatarUrl");
  localStorage.setItem("session_locked_message", reason);
  
  const currentPath = window.location.pathname;
  if (currentPath.startsWith("/admin")) {
    window.location.href = "/admin/login";
  } else {
    window.location.href = "/login";
  }
}

function handleLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("fullName");
  localStorage.removeItem("avatarUrl");
  
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

/** social_service uses {code:200,message:"Success"}; user_service uses {success:true} */
export function isApiSuccess(res: any): boolean {
  if (res == null) return false;
  if (res.success === true) return true;
  if (res.success === false) return false;
  if (typeof res.code === "number" && res.code >= 200 && res.code < 300) return true;
  if (res.code === StatusCode.SUCCESS || res.code === "SUCCESS") return true;
  return false;
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

  if (data instanceof FormData) {
    headers["Content-Type"] = undefined as any;
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
