import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export interface NutritionalSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  mealType: string; // breakfast, lunch, dinner, snack
  recipeTitle: string; // e.g., "Grilled Chicken Salad"
  recipeDescription: string; // description/ingredients
}

export interface MealPlan {
  _id?: string; // MongoDB id
  creatorId: string; // which user created it
  name: string; // plan name
  plan: Record<string, MealEntry[]>; // key = day (Mon, Tue...), value = meals
  totalNutritionalSummary?: NutritionalSummary;
  createdAt?: string;
}

export const fetchMealPlans = createAsyncThunk<MealPlan[]>(
  "mealPlans/fetchMealPlans",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching meal plans for logged in user");

      const res = await api.get("/mealPlans/get");

      console.log("Meal plans fetched:", res.data);

      // return only the meal plans array
      return res.data.data as MealPlan[];
    } catch (err: any) {
      console.error(
        "Error fetching meal plans:",
        err.response?.data || err.message
      );
      return rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

export const createMealPlan = createAsyncThunk<
  MealPlan,
  { creatorId: string; name: string; plan: Record<string, MealEntry[]> }
>("mealPlans/createMealPlan", async (data, { rejectWithValue }) => {
  try {
    console.log("Creating new meal plan:", data);
    const res = await api.post("/mealplans", data);
    console.log("Meal plan created:", res.data);
    return res.data.data as MealPlan;
  } catch (err: any) {
    console.error(
      "Error creating meal plan:",
      err.response?.data || err.message
    );
    return rejectWithValue(err.response?.data?.message || "Failed to create");
  }
});

export const generateMealPlan = createAsyncThunk<
  MealPlan,
  {
    dietaryRestrictions: string;
    allergies: string[];
    healthGoals: string[];
    cuisinePreferences: string[];
    name: string; // meal plan name (e.g., "Weekly AI Plan")
  },
  { rejectValue: string }
>("mealPlans/generate", async (preferences, { rejectWithValue }) => {
  try {
    console.log("Generating AI-based meal plan with preferences:", preferences);

    const response = await api.post("/mealPlans/generate", preferences);
    console.log("AI generated meal plan:", response.data);

    const mealPlan: MealPlan = response.data;

    console.log("Saving AI meal plan to DB...");
    // const saveRes = await api.get("/mealPlans/get", {
    //   name: preferences.name,
    //   plan: mealPlan.plan,
    //   totalNutritionalSummary: mealPlan.totalNutritionalSummary,
    // });
    console.log("Meal plan saved:", response.data);

    // 3. Return saved MealPlan
    return response.data.data as MealPlan;
  } catch (error: any) {
    console.error(
      "Error generating/saving meal plan:",
      error.response?.data || error.message
    );
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});
