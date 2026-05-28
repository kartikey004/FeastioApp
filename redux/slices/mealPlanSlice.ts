// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import {
//   fetchMealPlans,
//   generateMealPlan,
//   getTodayMealPlanThunk,
//   MealPlan,
//   updateMealPlan,
//   updateMealTimeThunk,
// } from "../thunks/mealPlanThunks";

// interface MealPlanState {
//   mealPlans: MealPlan[];
//   todayMealPlan: TodayMealPlanResponse | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: MealPlanState = {
//   mealPlans: [],
//   todayMealPlan: null,
//   loading: false,
//   error: null,
// };

// export interface Meal {
//   name: string;
//   description: string;
//   calories: number;
//   protein: number;
//   fat: number;
//   carbohydrates: number;
//   imageUrl: string | null;
//   ingredients: string[];
//   cookTime: string | null;
//   cuisine: string | null;
//   completed: boolean;
//   scheduledTime: string;
// }

// export interface TodayMealPlanResponse {
//   success: boolean;
//   message: string;
//   data: {
//     date: string;
//     dayName: string;
//     mealPlanId: string;
//     mealPlanName: string;
//     totalCalories: number;
//     dailyNutritionalSummary: {
//       calories: number;
//       protein: number;
//       fat: number;
//       carbohydrates: number;
//     };
//     meals: {
//       breakfast: Meal | null;
//       lunch: Meal | null;
//       snack: Meal | null;
//       dinner: Meal | null;
//     };
//     meta: {
//       totalMealsPlanned: number;
//       availableMealTypes: string[];
//     };
//   };
// }

// interface UpdateMealPlanPayload {
//   day: string;
//   newMeal: {
//     mealType: string;
//     recipeSnapshot: {
//       title: string;
//       description: string;
//     };
//   };
// }

// const mealPlanSlice = createSlice({
//   name: "mealPlans",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(fetchMealPlans.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(
//       fetchMealPlans.fulfilled,
//       (state, action: PayloadAction<MealPlan[]>) => {
//         state.loading = false;
//         state.mealPlans = action.payload;
//       },
//     );
//     builder.addCase(fetchMealPlans.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });
//     builder.addCase(updateMealPlan.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(updateMealPlan.fulfilled, (state) => {
//       state.loading = false;
//     });

//     builder.addCase(updateMealPlan.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });

//     builder.addCase(generateMealPlan.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(
//       generateMealPlan.fulfilled,
//       (state, action: PayloadAction<MealPlan>) => {
//         state.loading = false;
//         state.mealPlans.unshift(action.payload);
//       },
//     );
//     builder.addCase(generateMealPlan.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });
//     builder.addCase(getTodayMealPlanThunk.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(
//       getTodayMealPlanThunk.fulfilled,
//       (state, action: PayloadAction<TodayMealPlanResponse>) => {
//         state.loading = false;
//         state.todayMealPlan = action.payload;
//       },
//     );
//     builder.addCase(getTodayMealPlanThunk.rejected, (state, action) => {
//       state.loading = false;
//       state.error = (action.payload as string) || "Something went wrong";
//     });
//     builder.addCase(updateMealTimeThunk.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(
//       updateMealTimeThunk.fulfilled,
//       (
//         state,
//         action: PayloadAction<{
//           day: string;
//           mealType: string;
//           newTime: string;
//         }>,
//       ) => {
//         state.loading = false;
//         const todayPlan = state.todayMealPlan;
//         if (todayPlan) {
//           const { day, mealType, newTime } = action.payload;
//           const mealKey =
//             mealType.toLowerCase() as keyof typeof todayPlan.data.meals;
//           if (todayPlan.data.meals[mealKey]) {
//             todayPlan.data.meals[mealKey]!.scheduledTime = newTime;
//           }
//         }
//       },
//     );
//     builder.addCase(updateMealTimeThunk.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });
//   },
// });

// export default mealPlanSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchMealPlans,
  generateMealPlan,
  getTodayMealPlanThunk,
  MealPlan,
  updateMealPlan,
  updateMealTimeThunk,
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
  mealTime: string;
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

interface UpdateMealPlanPayload {
  day: string;
  newMeal: {
    mealType: string;
    recipeSnapshot: {
      title: string;
      description: string;
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
      },
    );
    builder.addCase(fetchMealPlans.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- Update Meal Plan (Optimistic Update) ---
    builder.addCase(updateMealPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateMealPlan.fulfilled, (state, action) => {
      state.loading = false;

      // We now receive the fully generated AI meal from the backend!
      const { day, updatedMeal } = action.payload;

      // 1. Update the Weekly Plan (For MealPlanScreen)
      if (state.mealPlans.length > 0) {
        const activePlan = state.mealPlans[0];

        if (activePlan.plan && activePlan.plan[day]) {
          const mealIndex = activePlan.plan[day].findIndex(
            (m) => m.mealType === updatedMeal.mealType,
          );

          if (mealIndex !== -1) {
            // ✅ INSTANTLY OVERWRITE everything (calories, ingredients, etc.)
            activePlan.plan[day][mealIndex].recipeSnapshot =
              updatedMeal.recipeSnapshot;
          }
        }
      }

      // 2. Update Today's Plan (If they edited today's meal)
      if (state.todayMealPlan && state.todayMealPlan.data.dayName === day) {
        const mealKey =
          updatedMeal.mealType.toLowerCase() as keyof typeof state.todayMealPlan.data.meals;
        const targetMeal = state.todayMealPlan.data.meals[mealKey];

        if (targetMeal && updatedMeal.recipeSnapshot) {
          targetMeal.name = updatedMeal.recipeSnapshot.title;
          targetMeal.description = updatedMeal.recipeSnapshot.description;

          // Sync all the new AI stats to the Home Screen too
          const nut = updatedMeal.recipeSnapshot.nutritionalInfo;
          if (nut) {
            targetMeal.calories = nut.calories;
            targetMeal.protein = nut.protein;
            targetMeal.fat = nut.fat;
            targetMeal.carbohydrates = nut.carbohydrates;
          }
          targetMeal.cookTime = updatedMeal.recipeSnapshot.cookTime;
          targetMeal.ingredients = updatedMeal.recipeSnapshot.ingredients;
          targetMeal.cuisine = updatedMeal.recipeSnapshot.cuisine;
        }
      }
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
      },
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
      },
    );
    builder.addCase(getTodayMealPlanThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Something went wrong";
    });

    builder.addCase(updateMealTimeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateMealTimeThunk.fulfilled,
      (
        state,
        action: PayloadAction<{
          day: string;
          mealType: string;
          newTime: string;
        }>,
      ) => {
        state.loading = false;
        const todayPlan = state.todayMealPlan;
        if (todayPlan) {
          const { mealType, newTime } = action.payload;
          const mealKey =
            mealType.toLowerCase() as keyof typeof todayPlan.data.meals;

          if (todayPlan.data.meals[mealKey]) {
            todayPlan.data.meals[mealKey]!.mealTime = newTime;
          }
        }
      },
    );
    builder.addCase(updateMealTimeThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default mealPlanSlice.reducer;
