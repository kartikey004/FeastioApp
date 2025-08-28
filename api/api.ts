import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

const api = axios.create({
  baseURL: "http://10.233.140.101:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const getTokens = async () => {
  const accessToken = await SecureStore.getItemAsync("accessToken");
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  return { accessToken, refreshToken };
};

const saveTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
};

api.interceptors.request.use(
  async (config) => {
    try {
      const { accessToken } = await getTokens();
      if (accessToken) {
        config.headers["authorization"] = `Bearer ${accessToken}`;
      }
    } catch (err) {
      console.error("Error reading token from SecureStore:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.log("GeoNudge: Access token expired, refreshing...");

      const success = await refreshAccessToken();

      if (success === true) {
        const { accessToken } = await getTokens();
        if (accessToken) {
          originalRequest.headers["authorization"] = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } else {
        Alert.alert("Session Expired", "Please log in again.");
      }
    }

    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  try {
    console.log("GeoNudge: Requesting new access token...");
    const { refreshToken } = await getTokens();
    if (!refreshToken) return false;

    const response = await axios.post(
      "http://10.233.140.101:5000/api/auth/refresh",
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.data.accessToken && response.data.refreshToken) {
      const { accessToken, refreshToken } = response.data;
      await saveTokens(accessToken, refreshToken);
      console.log("GeoNudge: New access token stored:", accessToken);
      return true;
    } else {
      console.error("GeoNudge: Refresh failed:", response.data.message);
      return "SESSION_EXPIRED";
    }
  } catch (error) {
    console.error("GeoNudge: Error refreshing token:", error);
    return "SESSION_EXPIRED";
  }
};

export default api;
