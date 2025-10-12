import { createSlice } from "@reduxjs/toolkit";
import { fetchChatHistory, sendMessageToAI } from "../thunks/aiChatThunks";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SendMessageResponse {
  reply?: string;
  history?: Message[];
}

interface AIChatState {
  messages: Message[];
  partialReply: string;
  loading: boolean;
  error: string | null;
}

const initialState: AIChatState = {
  messages: [],
  partialReply: "",
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

    addPartialReply: (state, action) => {
      state.partialReply += action.payload;
    },

    resetPartialReply: (state) => {
      state.partialReply = "";
    },

    clearMessages: (state) => {
      state.messages = [];
      state.partialReply = "";
      state.error = null;
    },

    setMessages: (state, action) => {
      state.messages = action.payload || [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToAI.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.partialReply = "";
      })

      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        state.loading = false;
        const { reply, history } = action.payload || {};

        if (history && Array.isArray(history)) {
          state.messages = history;
        } else if (reply) {
          state.messages.push({ role: "assistant", content: reply });
        }

        state.partialReply = "";
      })

      .addCase(sendMessageToAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.partialReply = "";
      })

      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload || [];
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch chat history";
      });
  },
});

export const {
  addUserMessage,
  addPartialReply,
  resetPartialReply,
  clearMessages,
  setMessages,
} = aiChatSlice.actions;

export default aiChatSlice.reducer;
