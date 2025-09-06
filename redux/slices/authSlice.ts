import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  googleSignIn,
  loginUser,
  logoutUser,
  registerUser,
  resendOTP,
  verifyOTP,
} from "../thunks/authThunks";

interface User {
  id?: string;
  email?: string;
  username?: string;
  phoneNumber?: string | null;
  profilePicture?: string | null;
}

interface AuthState {
  user: User | null;
  userId: string | null; //for otp verification
  isOtpSent: boolean;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  userId: null,
  isOtpSent: false,
  loading: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.userId = null;
      state.isOtpSent = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Google Sign In
    builder
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isOtpSent = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userId = action.payload.userId;
        state.isOtpSent = true;
        state.error = null;
        state.successMessage =
          "OTP sent to your email. Please verify to log in.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isOtpSent = false;
      });
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userId = null;
        state.isOtpSent = false;
        state.error = null;
        state.successMessage = "Email verified and logged in successfully";
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.userId = action.payload.userId;
        state.isOtpSent = true;
        state.error = null;
        state.successMessage = "A new OTP has been sent to your email";
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(logoutUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.user = null;
        state.error = null;
        state.successMessage = action.payload; // "Logged out successfully"
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.userId = null;
        state.isOtpSent = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
