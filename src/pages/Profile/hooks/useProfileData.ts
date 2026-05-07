import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadProfileByUserId } from "../../../redux/ProfileReducer";
import { AppDispatch, RootState } from "../../../redux/store";
import { ProfileApiResponse, ProfileViewModel } from "../types";

interface UseProfileDataResult {
  profileData: ProfileApiResponse | null;
  profileVm: ProfileViewModel | null;
  loading: boolean;
  error: string | null;
  usingMockData: boolean;
}

export function useProfileData(userId: number): UseProfileDataResult {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile);

  console.log("useProfileData - userId:", userId);
  console.log("useProfileData - profile state:", profile);

  useEffect(() => {
    if (!Number.isFinite(userId) || userId <= 0) return;
    dispatch(loadProfileByUserId(userId));
  }, [dispatch, userId]);

  return {
    profileData: profile.profileData,
    profileVm: profile.profileVm,
    loading: profile.loading,
    error: profile.error,
    usingMockData: false,
  };
}
