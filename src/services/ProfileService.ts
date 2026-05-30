import { ProfileApiResponse } from "../pages/MyProfile/types";
import type { OnboardingSubmissionPayload } from "./OnboardingService";

const PROFILE_API_BASE_URL = "http://localhost:8082/api";

export async function getProfileByUserId(
  userId: number,
): Promise<ProfileApiResponse> {
  const response = await fetch(
    `${PROFILE_API_BASE_URL}/onboarding/profile/${userId}`,
  );

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message =
      errorPayload?.message ||
      `Khong tai duoc profile. HTTP ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return (await response.json()) as ProfileApiResponse;
}

export async function updateProfile(
  payload: OnboardingSubmissionPayload,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    console.log("Payload sent to API:", payload);
    const userId = localStorage.getItem("userId");
    const response = await fetch(`${PROFILE_API_BASE_URL}/profile/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(userId && { "X-User-Id": userId }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json().catch(() => null);
    return {
      success: true,
      data,
    };

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Loi khong xac dinh khi cap nhat profile";

    return { success: false, error: message };
  }
}
