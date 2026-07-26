import { apiFetch } from "../config/apiClient";
import { APIResponseData } from "../config/APIResponse";

export interface TermUpdateStatus {
  needsUpdate: boolean;
  activeTermId: number | null;
  activeTermName: string | null;
  lastUpdatedTermId: number | null;
  lastUpdatedTermName: string | null;
}

export async function checkTermUpdateStatus(): Promise<APIResponseData<TermUpdateStatus>> {
  const userId = localStorage.getItem("userId");
  return apiFetch<TermUpdateStatus>("/profile/term-status", {
    method: "GET",
    headers: {
      ...(userId && { "X-User-Id": userId }),
    },
  });
}
