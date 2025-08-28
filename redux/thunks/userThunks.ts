import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

interface UserProfilePayload {
  dietaryRestrictions: string[];
  allergies: string[];
  healthGoals: string[];
  cuisinePreferences: string[];
}

interface UserProfileResponse {
  message: string;
  profile: UserProfilePayload & { _id: string }; // backend sends back profile + _id
}

// Update user profile
export const updateUserProfile = createAsyncThunk<
  UserProfileResponse, // response type
  UserProfilePayload // payload type
>("user/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put("/user/updateprofile", profileData);
    return data; // { message, profile }
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update profile"
    );
  }
});
