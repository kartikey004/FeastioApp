import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface BackendUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

export const googleSignIn = createAsyncThunk<
  BackendUser,
  string,
  { rejectValue: string }
>("auth/googleSignIn", async (accessToken, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      "https://your-backend.com/api/auth/google",
      { access_token: accessToken }
    );

    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});
