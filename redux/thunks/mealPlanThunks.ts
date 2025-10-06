import { Day, MealType } from "@/utils/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { TodayMealPlanResponse } from "../slices/mealPlanSlice";

export interface NutritionalSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  mealType: string;
  title: string;
  description: string;
}

export interface MealPlan {
  _id?: string;
  creatorId: string;
  name: string;
  plan: Record<string, MealEntry[]>;
  totalNutritionalSummary?: NutritionalSummary;
  createdAt?: string;
}

export interface MealPlanResponse {
  message: string;
  totalSummary: string;
  plan: MealPlan;
}

interface UpdateMealPlanArgs {
  day: Day;
  newMeal: {
    mealType: MealType;
    recipeSnapshot: {
      title: string;
      description: string;
    };
  };
}

interface UpdateMealTimeArgs {
  day: Day;
  mealType: MealType;
  newTime: string; // 24-hour format
}

export const fetchMealPlans = createAsyncThunk<MealPlan[]>(
  "mealPlans/fetchMealPlans",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching meal plans for logged in user");

      const res = await api.get("/mealPlans/get");

      console.log("Meal plans fetched:", res.data);

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

export const updateMealPlan = createAsyncThunk<
  void,
  UpdateMealPlanArgs,
  { rejectValue: string }
>("mealPlans/updateMealPlan", async (updates, { rejectWithValue }) => {
  try {
    const payload = {
      day: updates.day,
      newMeal: {
        mealType: updates.newMeal.mealType,
        recipeSnapshot: {
          title: updates.newMeal.recipeSnapshot.title,
          description: updates.newMeal.recipeSnapshot.description,
        },
      },
    };

    console.log("Updating meal plan with payload:", payload);

    const res = await api.patch("/mealplans/update", payload);

    console.log("Meal plan updated:", res.data);
  } catch (err: any) {
    console.error(
      "Error updating meal plan:",
      err.response?.data || err.message
    );
    return rejectWithValue(
      err.response?.data?.message || "Failed to update meal plan."
    );
  }
});

export const generateMealPlan = createAsyncThunk<
  MealPlan,
  {
    dietaryRestrictions: string[];
    allergies: string[];
    healthGoals: string[];
    cuisinePreferences: string[];
    gender: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: string;
    healthConditions: string[];
    menstrualHealth?: string;
    name: string;
  },
  { rejectValue: string }
>("mealPlans/generate", async (preferences, { rejectWithValue }) => {
  try {
    console.log("Generating AI-based meal plan with preferences:", preferences);

    const response = await api.post("/mealPlans/generate", preferences);
    console.log("AI generated meal plan:", response.data);

    const mealPlan: MealPlan = response.data;

    console.log("Meal plan saved:", response.data);

    return response.data.data as MealPlan;
  } catch (error: any) {
    console.error(
      "Error generating/saving meal plan:",
      error.response?.data || error.message
    );
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const getTodayMealPlanThunk = createAsyncThunk<
  TodayMealPlanResponse,
  void,
  { rejectValue: string }
>("mealPlan/getTodayMealPlan", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/mealPlans/getToday");

    return response.data as TodayMealPlanResponse;
  } catch (error: any) {
    console.error("Error fetching today's meal plan:", error);

    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch today's meal plan"
    );
  }
});

export const updateMealTimeThunk = createAsyncThunk<
  UpdateMealTimeArgs,
  UpdateMealTimeArgs,
  { rejectValue: string }
>("mealPlans/updateMealTime", async (updates, { rejectWithValue }) => {
  try {
    const payload = {
      day: updates.day,
      mealType: updates.mealType,
      newTime: updates.newTime,
    };

    const res = await api.patch("/mealPlans/updateMealTime", payload);

    console.log("Meal time updated:", res.data);

    return payload;
  } catch (err: any) {
    console.error(
      "Error updating meal time:",
      err.response?.data || err.message
    );
    return rejectWithValue(
      err.response?.data?.message || "Failed to update meal time."
    );
  }
});
