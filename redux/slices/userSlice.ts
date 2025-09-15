import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { fetchUserProfile, updateUserProfile } from "../thunks/userThunks";

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

export interface FetchedUserProfile {
  email: string;
  username: string;
  phoneNumber?: string;
  profilePicture?: string;
  profile: {
    dietaryRestrictions: string[];
    allergies: string[];
    healthGoals: string[];
    cuisinePreferences: string[];
  };
}

interface FetchedProfileState {
  data: FetchedUserProfile | null;
  loading: boolean;
  error: string | null;
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

const initialFetchedProfileState: FetchedProfileState = {
  data: null,
  loading: false,
  error: null,
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
          state.profile = action.payload.profile; // ← direct assignment
          state.successMessage = action.payload.message;
        }
      )
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update profile";
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<FetchedUserProfile>) => {
          state.loading = false;
          SecureStore.setItemAsync(
            "userProfile",
            JSON.stringify(action.payload)
          ).catch((err) =>
            console.error("Failed to save user profile locally:", err)
          );
        }
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch profile";
      });
  },
});

export const { clearUserMessages } = userSlice.actions;
export default userSlice.reducer;
