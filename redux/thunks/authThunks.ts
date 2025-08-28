import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import api from "../../api/api";

interface BackendUser {
  id: string;
  email: string;
  username?: string;
  phoneNumber?: string | null;
  profilePicture?: string | null;
}

// Utility functions for SecureStore
const saveTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
};

export const googleSignIn = createAsyncThunk<
  BackendUser,
  string,
  { rejectValue: string }
>("auth/googleSignIn", async (accessToken, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/google", { access_token: accessToken });
    const { accessToken: newAccessToken, refreshToken, user } = response.data;

    await saveTokens(newAccessToken, refreshToken);

    return user;
  } catch (error) {
    let errorMessage = "Google sign-in failed";
    if (error && typeof error === "object" && "response" in error) {
      const err = error as { response?: { status?: number; data?: any } };
      console.log("Google sign-in error:", err.response?.status, err.response?.data);
      errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response?.data
          : undefined) ||
        errorMessage;
    } else if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    return rejectWithValue(errorMessage);
  }
});

export const registerUser = createAsyncThunk<
  BackendUser,
  { username: string; email: string; password: string; phoneNumber: string },
  { rejectValue: string }
>("auth/registerUser", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register", formData);
    const { accessToken, refreshToken, user } = response.data;

    await saveTokens(accessToken, refreshToken);

    return user;
  } catch (error) {
    let errorMessage = "Registration failed";
    if (error && typeof error === "object" && "response" in error) {
      const err = error as { response?: { status?: number; data?: any } };
      console.log("Registration error:", err.response?.status, err.response?.data);
      errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response?.data
          : undefined) ||
        errorMessage;
    } else if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    return rejectWithValue(errorMessage);
  }
});

export const loginUser = createAsyncThunk<
  BackendUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", formData);
    const { accessToken, refreshToken, user } = response.data;

    await saveTokens(accessToken, refreshToken);

    return user;
  } catch (error) {
    let errorMessage = "Login failed";
    if (error && typeof error === "object" && "response" in error) {
      const err = error as { response?: { status?: number; data?: any } };
      console.log("Login error:", err.response?.status, err.response?.data);
      errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response?.data
          : undefined) ||
        errorMessage;
    } else if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    return rejectWithValue(errorMessage);
  }
});
