import { createSlice } from "@reduxjs/toolkit";
import { sendMessageToAI } from "../thunks/aiChatThunks";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface AIChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: AIChatState = {
  messages: [],
  loading: false,
  error: null,
};

const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ role: "user", content: action.payload });
    },
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToAI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        state.loading = false;
        const { message, reply } = action.payload;
        state.messages.push({ role: "ai", content: reply });
      })
      .addCase(sendMessageToAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addUserMessage, clearMessages } = aiChatSlice.actions;
export default aiChatSlice.reducer;
