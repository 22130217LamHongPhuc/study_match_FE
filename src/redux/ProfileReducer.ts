import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProfileByUserId } from "../services/ProfileService";
import { mapProfileResponseToVm } from "../pages/Profile/mappers/profileMapper";
import { ProfileApiResponse } from "../pages/Profile/types";

interface ProfileState {
  profileData: ProfileApiResponse | null;
  profileVm: any;
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

export const { clearProfile } = profileSlice.actions;

export default profileSlice.reducer;
