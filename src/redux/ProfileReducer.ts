import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getProfileByUserId } from "../services/ProfileService";
import { mapProfileResponseToVm } from "../pages/MyProfile/mappers/profileMapper";
import { ProfileApiResponse, ProfileViewModel } from "../pages/MyProfile/types";

interface ProfileState {
  profileData: ProfileApiResponse | null;
  profileVm: ProfileViewModel | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profileData: null,
  profileVm: null,
  loading: false,
  error: null,
};

export const loadProfileByUserId = createAsyncThunk(
  "profile/loadProfileByUserId",
  async (userId: number, thunkAPI) => {
    try {
      const data = await getProfileByUserId(userId);

      return {
        profileData: data,
        profileVm: mapProfileResponseToVm(data),
      };
    } catch (error) {
      return thunkAPI.rejectWithValue("Không tải được profile");
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,

  reducers: {
    clearProfile: (state) => {
      state.profileData = null;
      state.profileVm = null;
      state.loading = false;
      state.error = null;
    },

    // Allow updating profile view model locally (UI-only update or after save)
    updateProfileVm: (
      state,
      action: PayloadAction<Partial<ProfileViewModel>>,
    ) => {
      if (!state.profileVm) return;
      state.profileVm = {
        ...state.profileVm,
        ...action.payload,
      } as ProfileViewModel;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadProfileByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadProfileByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.profileData = action.payload.profileData;
        state.profileVm = action.payload.profileVm;
      })

      .addCase(loadProfileByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log("loadProfileByUserId - Rejected:", action.payload);
      });
  },
});

export const { clearProfile, updateProfileVm } = profileSlice.actions;

export default profileSlice.reducer;
