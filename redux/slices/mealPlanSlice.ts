import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchMealPlans,
  generateMealPlan,
  getTodayMealPlanThunk,
  MealPlan,
  updateMealPlan,
} from "../thunks/mealPlanThunks";

interface MealPlanState {
  mealPlans: MealPlan[];
  todayMealPlan: TodayMealPlanResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: MealPlanState = {
  mealPlans: [],
  todayMealPlan: null,
  loading: false,
  error: null,
};

export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  imageUrl: string | null;
  ingredients: string[];
  cookTime: string | null;
  cuisine: string | null;
  completed: boolean;
  scheduledTime: string;
}

export interface TodayMealPlanResponse {
  success: boolean;
  message: string;
  data: {
    date: string;
    dayName: string;
    mealPlanId: string;
    mealPlanName: string;
    totalCalories: number;
    dailyNutritionalSummary: {
      calories: number;
      protein: number;
      fat: number;
      carbohydrates: number;
    };
    meals: {
      breakfast: Meal | null;
      lunch: Meal | null;
      snack: Meal | null;
      dinner: Meal | null;
    };
    meta: {
      totalMealsPlanned: number;
      availableMealTypes: string[];
    };
  };
}

const mealPlanSlice = createSlice({
  name: "mealPlans",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMealPlans.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchMealPlans.fulfilled,
      (state, action: PayloadAction<MealPlan[]>) => {
        state.loading = false;
        state.mealPlans = action.payload;
      }
    );
    builder.addCase(fetchMealPlans.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(updateMealPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateMealPlan.fulfilled, (state) => {
      state.loading = false;
    });

    builder.addCase(updateMealPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(generateMealPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      generateMealPlan.fulfilled,
      (state, action: PayloadAction<MealPlan>) => {
        state.loading = false;
        state.mealPlans.unshift(action.payload);
      }
    );
    builder.addCase(generateMealPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(getTodayMealPlanThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      getTodayMealPlanThunk.fulfilled,
      (state, action: PayloadAction<TodayMealPlanResponse>) => {
        state.loading = false;
        state.todayMealPlan = action.payload;
      }
    );
    builder.addCase(getTodayMealPlanThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Something went wrong";
    });
  },
});

export default mealPlanSlice.reducer;
