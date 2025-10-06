import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  forgotPassword,
  googleSignIn,
  loginUser,
  logoutUser,
  registerUser,
  resendForgotOTP,
  resendOTP,
  resetPassword,
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
  tempToken: string | null;
  isOtpSent: boolean;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  tempToken: null,
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
      state.tempToken = null;
      state.isOtpSent = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
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

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isOtpSent = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.tempToken = action.payload.tempToken;
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
        state.tempToken = null;
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
        state.tempToken = action.payload.tempToken;
        state.isOtpSent = true;
        state.error = null;
        state.successMessage = "A new OTP has been sent to your email";
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

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
        state.successMessage = action.payload;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.tempToken = null;
        state.isOtpSent = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(forgotPassword.pending, (state) => {
        // state.loading = true;
        state.error = null;
        state.isOtpSent = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.tempToken = action.payload.tempToken;
        state.isOtpSent = true;
        state.successMessage =
          "Password reset OTP sent to your email. Please verify to reset.";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(resendForgotOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendForgotOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isOtpSent = true;
        state.successMessage = action.payload.message;
      })
      .addCase(resendForgotOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.tempToken = null;
        state.isOtpSent = false;
        state.successMessage = "Password reset successful. You are logged in.";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
