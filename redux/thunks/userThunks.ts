import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import api from "../../api/api";
import { FetchedUserProfile } from "../slices/userSlice";

export interface UserProfilePayload {
  dietaryRestrictions?: string[];
  allergies?: string[];
  healthGoals?: string[];
  cuisinePreferences?: string[];
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  activityLevel?: string;
  healthConditions?: string[];
  menstrualHealth?: string;
}

interface UserProfileResponse {
  message: string;
  profile: UserProfilePayload & { _id: string };
}

export const updateUserProfile = createAsyncThunk<
  UserProfileResponse,
  UserProfilePayload
>("user/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put("/user/updateprofile", profileData);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update profile"
    );
  }
});

export const fetchUserProfile = createAsyncThunk<
  FetchedUserProfile,
  void,
  { rejectValue: string }
>("user/fetchUserProfile", async (_, { dispatch, rejectWithValue }) => {
  try {
    const cachedData = await SecureStore.getItemAsync("userProfile");

    if (cachedData) {
      const parsedData: FetchedUserProfile = JSON.parse(cachedData);
      console.log("Using cached profile:", parsedData);

      const res = await api.get("/user/profile");
      const freshData: FetchedUserProfile = res.data.data;

      await SecureStore.setItemAsync("userProfile", JSON.stringify(freshData));
      console.log("Updated cache with fresh profile:", freshData);

      return freshData;
    }

    console.log("No cache found, fetching fresh profile...");
    const res = await api.get("/user/profile");
    const freshData: FetchedUserProfile = res.data.data;

    await SecureStore.setItemAsync("userProfile", JSON.stringify(freshData));
    console.log("Fetched fresh profile:", freshData);
    return freshData;
  } catch (err: any) {
    console.error(
      "Error fetching user profile:",
      err.response?.data || err.message
    );
    return rejectWithValue("Failed to fetch user profile.");
  }
});
