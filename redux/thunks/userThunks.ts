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
>("user/fetchUserProfile", async (_, { dispatch, rejectWithValue }) => {
  try {
    const cachedData = await SecureStore.getItemAsync("userProfile");

    if (cachedData) {
      const parsedData: FetchedUserProfile = JSON.parse(cachedData);
      console.log("Using cached profile:", parsedData);

      // fetch fresh in background
      api.get("/user/profile").then(async (res) => {
        const freshData: FetchedUserProfile = res.data.data;
        await SecureStore.setItemAsync(
          "userProfile",
          JSON.stringify(freshData)
        );
        console.log("Updated cache with fresh profile:", freshData);

        // update Redux immediately
        dispatch({
          type: "user/fetchUserProfile/fulfilled",
          payload: freshData,
        });
      });

      return parsedData;
    }

    // ⬇️ No cache → force fresh profile fetch
    console.log("No cache found, fetching fresh profile...");
    const res = await api.get("/user/profile");
    const freshData: FetchedUserProfile = res.data.data;

    // save & return
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
