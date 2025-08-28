import { configureStore } from "@reduxjs/toolkit";
import aiChatReducer from "./slices/aiChatSlice";
import authReducer from "./slices/authSlice";
import mealPlanReducer from "./slices/mealPlanSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    aiChat: aiChatReducer,
    mealPlan: mealPlanReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
