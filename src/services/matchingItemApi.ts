import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";
import { BASE_URL } from "../config/BaseConfig";

export type MatchingActionStatus =
  | "VIEWED"
  | "FRIEND_REQUEST_SENT"
  | "ACCEPTED"
  | "REJECTED";

export interface RecordMatchingActionRequest {
  userId: number;
  recommendedUserId: number;
  actionStatus: MatchingActionStatus;
  finalScore?: number;
  reasonText?: string;
}

export interface UpdateMatchingStatusRequest {
  userId: number;
  recommendedUserId: number;
  actionStatus: Exclude<MatchingActionStatus, "VIEWED">;
  finalScore?: number;
}

export const matchingItemApi = {
  recordAction: (
    body: RecordMatchingActionRequest,
  ): Promise<APIResponseData<unknown>> => {
    return apiFetch<unknown>(
      "/api/matching-items/action",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      BASE_URL,
    );
  },
  updateStatus: (
    body: UpdateMatchingStatusRequest,
  ): Promise<APIResponseData<unknown>> => {
    return apiFetch<unknown>(
      "/api/matching-items/status",
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      BASE_URL,
    );
  },
};
