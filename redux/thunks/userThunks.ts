import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import api from "../../api/api";
import { FetchedUserProfile } from "../slices/userSlice";

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

// export interface UserProfile {
//   email: string;
//   username: string;
//   phoneNumber?: string;
//   profile: {
//     dietaryRestrictions: string[];
//     allergies: string[];
//     healthGoals: string[];
//     cuisinePreferences: string[];
//   };
//   profilePicture?: string; // URL or first letter
// }

export const fetchUserProfile = createAsyncThunk<
  FetchedUserProfile,
  void,
  { rejectValue: string }
>("user/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    // 1️⃣ Check SecureStore first
    const cachedData = await SecureStore.getItemAsync("userProfile");
    if (cachedData) {
      const parsedData: FetchedUserProfile = JSON.parse(cachedData);
      console.log("Using cached profile:", parsedData);
      return parsedData;
    }

    // 2️⃣ Fetch from API if not cached
    const res = await api.get("/user/profile");
    const data: FetchedUserProfile = res.data.data;

    // 3️⃣ Save to SecureStore for future use
    await SecureStore.setItemAsync("userProfile", JSON.stringify(data));

    return data;
  } catch (err: any) {
    console.error(
      "Error fetching user profile:",
      err.response?.data || err.message
    );
    return rejectWithValue("Failed to fetch user profile.");
  }
});
