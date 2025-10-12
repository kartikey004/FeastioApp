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

const saveTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
};

const clearTokens = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("userProfile");
};
export const rehydrateAuth = createAsyncThunk<BackendUser | null>(
  "auth/rehydrate",
  async () => {
    try {
      const userProfile = await SecureStore.getItemAsync("userProfile");
      if (userProfile) {
        return JSON.parse(userProfile);
      }
      return null;
    } catch (error) {
      console.log("Error rehydrating auth:", error);
      return null;
    }
  }
);

export const registerUser = createAsyncThunk<
  { tempToken: string; email: string },
  { username: string; email: string; password: string; phoneNumber: string },
  { rejectValue: string }
>("auth/registerUser", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register", formData);
    return response.data;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || "Registration failed";
    return rejectWithValue(errMsg);
  }
});

export const verifyOTP = createAsyncThunk<
  BackendUser,
  { tempToken: string; otp: string },
  { rejectValue: string }
>("auth/verifyOTP", async ({ tempToken, otp }, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/verify-otp", { tempToken, otp });
    const { accessToken, refreshToken, user } = response.data;

    await saveTokens(accessToken, refreshToken);
    await SecureStore.setItemAsync("userProfile", JSON.stringify(user));

    return user;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      "OTP verification failed";
    return rejectWithValue(errMsg);
  }
});

export const resendOTP = createAsyncThunk<
  { tempToken: string },
  { email: string },
  { rejectValue: string }
>("auth/resendOTP", async ({ email }, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || "Resend OTP failed";
    return rejectWithValue(errMsg);
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
    await SecureStore.setItemAsync("userProfile", JSON.stringify(user));

    return user;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message || error?.message || "Login failed";
    return rejectWithValue(errMsg);
  }
});

export const logoutUser = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/logout");

    await clearTokens();
    return response.data.message || "Logged out successfully";
  } catch (error) {
    await clearTokens();

    let errorMessage = "Logout failed";
    if (error && typeof error === "object" && "response" in error) {
      const err = error as { response?: { status?: number; data?: any } };
      console.log("Logout error:", err.response?.status, err.response?.data);
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

export const forgotPassword = createAsyncThunk<
  { tempToken: string; message: string },
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Forgot password failed";
    return rejectWithValue(errMsg);
  }
});

export const resendForgotOTP = createAsyncThunk<
  { tempToken: string; message: string },
  { email: string },
  { rejectValue: string }
>("auth/resendForgotOTP", async ({ email }, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/resend-forgot-otp", { email });
    return response.data;
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Resend forgot OTP failed";
    return rejectWithValue(errMsg);
  }
});

export const resetPassword = createAsyncThunk<
  BackendUser,
  { tempToken: string; otp: string; newPassword: string },
  { rejectValue: string }
>(
  "auth/resetPassword",
  async ({ tempToken, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/reset-password", {
        tempToken,
        otp,
        newPassword,
      });

      const { accessToken, refreshToken, user } = response.data;

      await saveTokens(accessToken, refreshToken);
      await SecureStore.setItemAsync("userProfile", JSON.stringify(user));

      return user;
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Reset password failed";
      return rejectWithValue(errMsg);
    }
  }
);
