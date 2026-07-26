import { apiFetch, isApiSuccess } from "../../config/apiClient";
import { BASE_CHAT_SERVICE } from "../../config/BaseConfig";
import { CallSession, CallType } from "./callTypes";

function unwrap<T>(response: any): T {
  if (!isApiSuccess(response) || !response.data) {
    const messages: Record<string, string> = {
      USER_BUSY: "Người dùng đang bận",
      CALLER_BUSY: "Bạn đang trong một cuộc gọi khác",
      USER_UNREACHABLE: "Không thể liên lạc với người dùng",
    };
    throw new Error(messages[response?.message] || response?.message || "Không thể thực hiện cuộc gọi");
  }
  return response.data as T;
}
function ensureSuccess(response: any): void {
  if (!isApiSuccess(response)) {
    throw new Error(response?.message || "Không thể cập nhật cuộc gọi");
  }
}

export const callApi = {
  async start(conversationId: number, callType: CallType, callerName?: string, callerAvatar?: string | null) {
    return unwrap<CallSession>(await apiFetch(`${BASE_CHAT_SERVICE}/video-calls/start`, {
      method: "POST",
      body: JSON.stringify({ conversationId, callType, callerName, callerAvatar }),
    }));
  },
  async accept(sessionId: number) {
    return unwrap<CallSession>(await apiFetch(`${BASE_CHAT_SERVICE}/video-calls/${sessionId}/join`, { method: "POST" }));
  },
  async reject(sessionId: number) {
    ensureSuccess(await apiFetch(`${BASE_CHAT_SERVICE}/video-calls/${sessionId}/reject`, { method: "POST" }));
  },
  async cancel(sessionId: number) {
    ensureSuccess(await apiFetch(`${BASE_CHAT_SERVICE}/video-calls/${sessionId}/cancel`, { method: "POST" }));
  },
  async leave(sessionId: number) {
    ensureSuccess(await apiFetch(`${BASE_CHAT_SERVICE}/video-calls/${sessionId}/end`, { method: "POST" }));
  },
};
