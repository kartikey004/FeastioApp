import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const sendMessageToAI = createAsyncThunk(
  "aiChat/sendMessageToAI",
  async ({ message }: { message: string }, { getState, rejectWithValue }) => {
    try {
      const { aiChat } = getState() as any;
      const history = aiChat.messages;

      const response = await api.post("/aiChat", { message, history });
      return { message, reply: response.data.reply };
    } catch (error: any) {
      console.error("AI Chat API Error:", error);
      return rejectWithValue("Something went wrong with AI Assistant");
    }
  }
);
