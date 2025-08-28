// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateUserProfile } from "../thunks/userThunks";

interface UserProfile {
  dietaryRestrictions: string[];
  allergies: string[];
  healthGoals: string[];
  cuisinePreferences: string[];
}

interface UserState {
  profile: UserProfile;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  profile: {
    dietaryRestrictions: [],
    allergies: [],
    healthGoals: [],
    cuisinePreferences: [],
  },
  loading: false,
  error: null,
  successMessage: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        updateUserProfile.fulfilled,
        (
          state,
          action: PayloadAction<{ profile: UserProfile; message: string }>
        ) => {
          state.loading = false;
          state.profile = action.payload.profile;
          state.successMessage = action.payload.message;
        }
      )
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update profile";
      });
  },
});

export const { clearUserMessages } = userSlice.actions;
export default userSlice.reducer;
