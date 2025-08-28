import { AppDispatch, RootState } from "@/redux/store";
import {
  createMealPlan,
  fetchMealPlans,
  MealPlan,
} from "@/redux/thunks/mealPlanThunks";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { COLORS } from "../../utils/stylesheet";

const weekDaysDisplay = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MealPlanScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const mealPlans = useSelector((state: RootState) => state.mealPlan.mealPlans);

  const todayIndex = new Date().getDay();

  const [selectedDayIndex, setSelectedDayIndex] = useState(
    todayIndex ? todayIndex - 1 : 6
  ); // Adjusting for Sunday=0
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingMealType, setEditingMealType] = useState("");
  const [editingRecipeTitle, setEditingRecipeTitle] = useState("");
  const [editingRecipeDescription, setEditingRecipeDescription] = useState("");

  useEffect(() => {
    handleFetchMealPlans();
  }, []);

  const openAddEditMealModal = (mode: "add" | "edit", mealType?: string) => {
    setModalMode(mode);
    setEditingMealType(mealType || "");
    setModalVisible(true);
  };

  const handleSaveMeal = () => {
    if (!editingRecipeTitle) {
      Alert.alert("Validation", "Please enter recipe title");
      return;
    }
    dispatch(
      createMealPlan({
        creatorId: "123",
        name: "My Weekly Plan",
        plan: {
          [weekDaysDisplay[selectedDayIndex]]: [
            {
              mealType: editingMealType,
              recipeTitle: editingRecipeTitle,
              recipeDescription: editingRecipeDescription,
            },
          ],
        },
      })
    );
    setModalVisible(false);
  };

  const handleFetchMealPlans = () => {
    dispatch(fetchMealPlans())
      .unwrap()
      .then((plans) => {
        console.log("✅ Meal plans fetched successfully:", plans);
        // Optionally, you can do additional state updates here if needed
      })
      .catch((err) => {
        console.error("❌ Failed to fetch meal plans:", err);
        Alert.alert("Error", "Failed to fetch meal plans. Please try again.");
      });
  };

  const today = new Date();
  let dayIndex = today.getDay();
  if (dayIndex === 0) dayIndex = 6;
  else dayIndex = dayIndex - 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Weekly Meal Plan</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openAddEditMealModal("add", "Breakfast")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDisplayContainer}>
          {weekDaysDisplay.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayItem,
                selectedDayIndex === index && styles.selectedDayItem,
              ]}
              // onPress={() => setSelectedDayIndex(index)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDayIndex === index && styles.selectedDayText,
                ]}
              >
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {weekDaysDisplay[selectedDayIndex]}'s Meals
          </Text>
          <View style={styles.mealPlanBox}>
            {mealPlans.length === 0 ? (
              <Text>No meals yet</Text>
            ) : (
              // Loop through each meal plan
              mealPlans.map((plan: MealPlan) => {
                const dayMeals =
                  plan.plan[weekDaysDisplay[selectedDayIndex]] || [];
                return (
                  <View key={plan._id} style={styles.mealItem}>
                    <Text style={styles.mealName}>{plan.name}</Text>

                    {dayMeals.length === 0 ? (
                      <Text style={styles.noMealsText}>
                        No meals for this day
                      </Text>
                    ) : (
                      dayMeals.map((meal, idx) => (
                        <View key={idx} style={styles.mealItem}>
                          <Text style={styles.mealType}>{meal.mealType}</Text>
                          <Text style={styles.mealName}>
                            {meal.recipeTitle}
                          </Text>
                          {meal.recipeDescription ? (
                            <Text style={styles.mealDescription}>
                              {meal.recipeDescription}
                            </Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%", alignItems: "center" }}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>
                    {modalMode === "add" ? "Add Meal" : "Edit Meal"}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={editingRecipeTitle}
                    onChangeText={setEditingRecipeTitle}
                    placeholder="Recipe Title"
                  />
                  <TextInput
                    style={styles.input}
                    value={editingRecipeDescription}
                    onChangeText={setEditingRecipeDescription}
                    placeholder="Recipe Description"
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveMeal}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default MealPlanScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: "700" },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  weekDisplayContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dayItem: {
    padding: 8,
    borderRadius: 8,
  },
  selectedDayItem: {
    backgroundColor: COLORS.primaryLight,
  },
  dayText: {
    fontSize: 16,
  },
  selectedDayText: {
    fontWeight: "700",
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  mealPlanBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  mealItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "500",
  },
  noMealsText: {
    fontStyle: "italic",
    color: COLORS.textSecondary,
  },
  mealType: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  mealDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
