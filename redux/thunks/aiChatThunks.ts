import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

interface SendMessagePayload {
  message: string;
}

interface AIResponse {
  reply?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export const sendMessageToAI = createAsyncThunk<
  AIResponse,
  SendMessagePayload,
  { rejectValue: string }
>(
  "aiChat/sendMessageToAI",
  async ({ message }: SendMessagePayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/aiChat", { message });
      const data = response.data as AIResponse;

      if (!data.reply && !data.history)
        throw new Error("No valid data from AI backend");

      return data;
    } catch (error: any) {
      console.error("AI Chat API Error:", error);
      return rejectWithValue("Something went wrong with AI Assistant");
    }
  }
);

export const fetchChatHistory = createAsyncThunk<
  { role: "user" | "assistant"; content: string }[],
  void,
  { rejectValue: string }
>("aiChat/fetchChatHistory", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/aiChat/history");
    return response.data.history || [];
  } catch (error: any) {
    console.error("Fetch Chat History Error:", error);
    return rejectWithValue("Failed to fetch chat history");
  }
});
