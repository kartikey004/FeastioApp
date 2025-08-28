import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createMealPlan,
  fetchMealPlans,
  generateMealPlan,
  MealPlan,
} from "../thunks/mealPlanThunks";

interface MealPlanState {
  mealPlans: MealPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: MealPlanState = {
  mealPlans: [],
  loading: false,
  error: null,
};

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

    builder.addCase(createMealPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createMealPlan.fulfilled,
      (state, action: PayloadAction<MealPlan>) => {
        state.loading = false;
        state.mealPlans.unshift(action.payload);
      }
    );
    builder.addCase(createMealPlan.rejected, (state, action) => {
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
  },
});

export default mealPlanSlice.reducer;
