import { ProfileApiResponse } from "../pages/MyProfile/types";
import type { OnboardingSubmissionPayload } from "./OnboardingService";
import { apiFetch } from "../config/apiClient";

const PROFILE_API_BASE_URL = "http://localhost:8082/api";

export async function getProfileByUserId(
  userId: number,
): Promise<ProfileApiResponse> {
  const res = await apiFetch<any>(
    `/onboarding/profile/${userId}`,
    { method: "GET" },
    PROFILE_API_BASE_URL
  );

  if (!res || res.success === false) {
    const message =
      res?.message ||
      `Khong tai duoc profile.`;
    throw new Error(message);
  }

  return res as unknown as ProfileApiResponse;
}

export async function updateProfile(
  payload: OnboardingSubmissionPayload,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    console.log("Payload sent to API:", payload);
    const userId = localStorage.getItem("userId");
    const res = await apiFetch<any>(
      `/profile/update`,
      {
        method: "PUT",
        headers: {
          ...(userId && { "X-User-Id": userId }),
        },
        body: JSON.stringify(payload),
      },
      PROFILE_API_BASE_URL
    );

    if (!res || res.success === false) {
      throw new Error(
        res?.message ||
          `API Error updating profile`,
      );
    }

    return {
      success: true,
      data: res,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Loi khong xac dinh khi cap nhat profile";

    return { success: false, error: message };
  }
}
