import AlertModal from "@/components/AlertModal";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchMealPlans,
  MealPlan,
  updateMealPlan,
} from "@/redux/thunks/mealPlanThunks";
import { Day, MealType } from "@/utils/types";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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
  const { loading, error } = useSelector((state: RootState) => state.mealPlan);
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
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setAlertModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    primaryButton: undefined as
      | { text: string; onPress: () => void }
      | undefined,
    secondaryButton: undefined as
      | { text: string; onPress: () => void }
      | undefined,
  });

  useEffect(() => {
    handleFetchMealPlans();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await handleFetchMealPlans();
    } finally {
      setRefreshing(false);
    }
  };

  const showModal = (
    config: Partial<typeof modalConfig> & { message: string }
  ) => {
    setModalConfig({ ...modalConfig, ...config });
    setAlertModalVisible(true);
  };

  const openAddEditMealModal = (mode: "add" | "edit", mealType?: string) => {
    setModalMode(mode);
    setEditingMealType(mealType || "");
    setModalVisible(true);
  };

  const handleCardClick = (day: Day, mealType: MealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setModalVisible(true);
  };

  const handleSaveMeal = () => {
    //TODO
  };

  const handleUpdateMeal = async () => {
    if (!editingRecipeTitle.trim()) {
      // Alert.alert("Validation", "Please enter recipe title");
      showModal({
        title: "Validation",
        message: "Please enter recipe title.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setAlertModalVisible(false),
        },
      });
      return;
    }

    if (!selectedDay || !selectedMealType) {
      // Alert.alert("Error", "No day/meal selected");
      showModal({
        title: "Error",
        message: "No day/meal selected.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setAlertModalVisible(false),
        },
      });
      return;
    }

    try {
      // Dispatch the updateMealPlan thunk
      await dispatch(
        updateMealPlan({
          day: selectedDay as Day,
          newMeal: {
            mealType: selectedMealType as MealType,
            recipeSnapshot: {
              title: editingRecipeTitle,
              description: editingRecipeDescription,
            },
          },
        })
      ).unwrap();

      // Close modal and clear input fields
      setModalVisible(false);
      setEditingRecipeTitle("");
      setEditingRecipeDescription("");

      // Re-fetch meal plans to update UI
      await dispatch(fetchMealPlans()).unwrap();
    } catch (err: any) {
      console.error("Failed to update meal:", err);
      // Alert.alert("Error", err || "Failed to update meal plan");
      showModal({
        title: "Error",
        message: err || "An unexpected error occurred. Please try again.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setAlertModalVisible(false),
        },
      });
    }
  };

  const handleFetchMealPlans = () => {
    dispatch(fetchMealPlans())
      .unwrap()
      .then((plans) => {
        console.log("✅ Meal plans fetched successfully (raw):", plans);

        // 🔎 Pretty print the entire JSON
        console.log(
          "📦 Full Meal Plan JSON:\n",
          JSON.stringify(plans, null, 2)
        );

        // If you only want to check the "plan" field of the first plan
        if (plans.length > 0) {
          console.log("📅 Days in plan:", Object.keys(plans[0].plan || {}));
          console.log(
            "🍽️ Monday meals:",
            JSON.stringify(plans[0].plan.Monday, null, 2)
          );
        }
        return plans;
      })
      .catch((err) => {
        console.error("❌ Failed to fetch meal plans:", err);
        // Alert.alert("Error", "Failed to fetch meal plans. Please try again.");
        showModal({
          title: "Error",
          message: "Failed to fetch meal plans. Please try again.",
          type: "error",
          primaryButton: {
            text: "Try Again",
            onPress: () => setAlertModalVisible(false),
          },
        });
      });
  };

  const today = new Date();
  let dayIndex = today.getDay();
  if (dayIndex === 0) dayIndex = 6;
  else dayIndex = dayIndex - 1;

  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>
          We’re almost ready!{"\n"}Your healthy choices are on the way...
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay />}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Weekly Meal Plan</Text>
            <Text style={styles.subtitle}>Plan your delicious week ahead</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        style={styles.scrollContainer}
      >
        <View style={styles.weekContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekDisplayContainer}
          >
            {weekDaysDisplay.map((day, index) => {
              const isToday = index === dayIndex;
              const isSelected = selectedDayIndex === index;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayItem,
                    isToday && styles.todayItem,
                    isSelected && styles.selectedDayItem,
                  ]}
                  onPress={() => setSelectedDayIndex(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayAbbrev}>{day.substring(0, 3)}</Text>
                  <View
                    style={[
                      // styles.dayIndicator,
                      isSelected && styles.selectedDayIndicator,
                      isToday && !isSelected && styles.todayIndicator,
                    ]}
                  />
                  {/* {isToday && <Text style={styles.todayLabel}>Today</Text>} */}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Plan</Text>
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() =>
                // Alert.alert(
                //   "Feature Coming Soon",
                //   "The 'Add Meal' feature will be upgraded in the next updates.\nStay tuned!",
                //   [{ text: "OK", onPress: () => console.log("Alert closed") }]
                // )
                showModal({
                  title: "Feature Coming Soon",
                  message:
                    "The 'Add Meal' feature will be upgraded in the next updates.\nStay tuned!",
                  type: "info",
                  primaryButton: {
                    text: "OK",
                    onPress: () => setAlertModalVisible(false),
                  },
                })
              }
            >
              <Text style={styles.quickAddText}>+ Add Meal</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mealCardsContainer}>
            {mealPlans.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🍽️</Text>
                <Text style={styles.emptyStateTitle}>No meals planned yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Start planning your delicious{" "}
                  {weekDaysDisplay[selectedDayIndex]} meals!
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() =>
                    // Alert.alert(
                    //   "Feature Coming Soon",
                    //   "Try generating meal again. This feature will be upgraded in the next update.\nStay tuned!",
                    //   [
                    //     {
                    //       text: "OK",
                    //       onPress: () => console.log("Alert closed"),
                    //     },
                    //   ]
                    // )
                    showModal({
                      title: "Feature Coming Soon",
                      message:
                        "Try generating meal again. This feature will be upgraded in the next update.\nStay tuned!",
                      type: "info",
                      primaryButton: {
                        text: "OK",
                        onPress: () => setAlertModalVisible(false),
                      },
                    })
                  }
                >
                  <Text style={styles.emptyStateButtonText}>
                    Plan First Meal
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Loop through each meal plan
              mealPlans.map((plan: MealPlan) => {
                const dayMeals =
                  plan.plan[weekDaysDisplay[selectedDayIndex]] || [];
                return (
                  <View key={plan._id} style={styles.planContainer}>
                    <View style={styles.planHeader}>
                      <View style={styles.planHeaderLeft}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planSubtitle}>
                          {weekDaysDisplay[selectedDayIndex]} Schedule
                        </Text>
                      </View>
                      <View style={styles.planHeaderRight}>
                        {/* <View style={styles.mealCount}> */}
                        {/* <Text style={styles.mealCountNumber}> */}
                        {/* {dayMeals.length} */}
                        {/* </Text> */}
                        {/* <Text style={styles.mealCountLabel}>meals</Text> */}
                        {/* </View> */}
                        {/* <TouchableOpacity
                          style={styles.planAddButton}
                          onPress={() =>
                            openAddEditMealModal("add", "Breakfast")
                          }
                        > */}
                        {/* //   <Text style={styles.planAddButtonText}>+</Text>
                        // </TouchableOpacity> */}
                      </View>
                    </View>

                    {dayMeals.length === 0 ? (
                      <View style={styles.noMealsContainer}>
                        <View style={styles.noMealsIconContainer}>
                          <Text style={styles.noMealsIcon}>🍽️</Text>
                          {/* <View style={styles.noMealsIconBg} /> */}
                        </View>
                        <Text style={styles.noMealsTitle}>
                          No meals planned
                        </Text>
                        <Text style={styles.noMealsText}>
                          Start building your perfect{" "}
                          {weekDaysDisplay[selectedDayIndex]} meal plan
                        </Text>
                        <TouchableOpacity
                          style={styles.noMealsAddButton}
                          onPress={() =>
                            // Alert.alert(
                            //   "Feature Coming Soon",
                            //   "The 'Add Meal' feature will be upgraded in the next updates. Stay tuned!",
                            //   [
                            //     {
                            //       text: "OK",
                            //       onPress: () => console.log("Alert closed"),
                            //     },
                            //   ]
                            // )

                            showModal({
                              title: "Feature Coming Soon",
                              message:
                                "The 'Add Meal' feature will be upgraded in the next updates. Stay tuned!",
                              type: "info",
                              primaryButton: {
                                text: "OK",
                                onPress: () => setAlertModalVisible(false),
                              },
                            })
                          }
                        >
                          <Text style={styles.noMealsAddButtonText}>
                            + Add First Meal
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.mealsTimeline}>
                        {dayMeals.map((meal: any, idx: number) => {
                          const recipe = meal.recipeSnapshot;
                          const nutrition = recipe?.nutritionalInfo;

                          return (
                            <TouchableOpacity
                              key={idx}
                              style={styles.mealCard}
                              onPress={() =>
                                handleCardClick(
                                  weekDaysDisplay[selectedDayIndex] as Day,
                                  meal.mealType as MealType
                                )
                              }
                              activeOpacity={0.8}
                            >
                              {idx > 0 && (
                                <View style={styles.timelineConnector} />
                              )}

                              <View style={styles.mealCardContent}>
                                {/* <View style={styles.mealTimelineDot}> */}
                                {/* <Text style={styles.mealTypeIcon}> */}
                                {/* {getMealTypeIcon(meal.mealType)} */}
                                {/* </Text> */}
                                {/* </View> */}

                                <View style={styles.mealCardBody}>
                                  <View style={styles.mealCardHeader}>
                                    <View style={styles.mealTypeContainer}>
                                      <Text style={styles.mealType}>
                                        {meal.mealType}
                                      </Text>
                                      <View style={styles.mealTypeBadge} />
                                    </View>
                                    <View style={styles.mealHeaderRight}>
                                      {recipe?.cuisine && (
                                        <View style={styles.cuisineBadge}>
                                          <Text style={styles.cuisineText}>
                                            {recipe.cuisine}
                                          </Text>
                                        </View>
                                      )}
                                      <TouchableOpacity
                                        style={styles.mealOptionsButton}
                                      >
                                        {/* <Text style={styles.mealOptionsText}>
                                          ⋯
                                        </Text> */}
                                      </TouchableOpacity>
                                    </View>
                                  </View>

                                  <Text
                                    style={styles.mealTitle}
                                    numberOfLines={2}
                                  >
                                    {recipe?.title ||
                                      meal.recipeTitle ||
                                      "Untitled Recipe"}
                                  </Text>

                                  {recipe?.description ? (
                                    <Text
                                      style={styles.mealDescription}
                                      numberOfLines={3}
                                    >
                                      {recipe.description}
                                    </Text>
                                  ) : meal.recipeDescription ? (
                                    <Text
                                      style={styles.mealDescription}
                                      numberOfLines={3}
                                    >
                                      {meal.recipeDescription}
                                    </Text>
                                  ) : (
                                    <Text
                                      style={styles.mealDescriptionPlaceholder}
                                    >
                                      No description available
                                    </Text>
                                  )}

                                  {nutrition && (
                                    <View style={styles.nutritionContainer}>
                                      <View style={styles.nutritionGrid}>
                                        <View style={styles.nutritionItem}>
                                          <Text style={styles.nutritionValue}>
                                            {nutrition.calories}
                                          </Text>
                                          <Text style={styles.nutritionLabel}>
                                            cal
                                          </Text>
                                        </View>
                                        <View style={styles.nutritionItem}>
                                          <Text style={styles.nutritionValue}>
                                            {nutrition.protein}g
                                          </Text>
                                          <Text style={styles.nutritionLabel}>
                                            protein
                                          </Text>
                                        </View>
                                        <View style={styles.nutritionItem}>
                                          <Text style={styles.nutritionValue}>
                                            {nutrition.carbohydrates}g
                                          </Text>
                                          <Text style={styles.nutritionLabel}>
                                            carbs
                                          </Text>
                                        </View>
                                        <View style={styles.nutritionItem}>
                                          <Text style={styles.nutritionValue}>
                                            {nutrition.fat}g
                                          </Text>
                                          <Text style={styles.nutritionLabel}>
                                            fat
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  )}

                                  <View style={styles.recipeDetails}>
                                    {recipe?.cookTime !== undefined && (
                                      <View style={styles.cookTimeContainer}>
                                        <Text style={styles.cookTimeIcon}>
                                          ⏱️
                                        </Text>
                                        <Text style={styles.cookTimeText}>
                                          {recipe.cookTime === 0
                                            ? "No cooking"
                                            : `${recipe.cookTime} mins`}
                                        </Text>
                                      </View>
                                    )}

                                    {recipe?.ingredients &&
                                      recipe.ingredients.length > 0 && (
                                        <View
                                          style={styles.ingredientsContainer}
                                        >
                                          <Text style={styles.ingredientsLabel}>
                                            {recipe.ingredients.length}{" "}
                                            ingredients:
                                          </Text>
                                          <View style={styles.ingredientsList}>
                                            <Text style={styles.ingredientItem}>
                                              {recipe.ingredients.join(", ")}
                                            </Text>
                                          </View>
                                        </View>
                                      )}
                                  </View>

                                  <View style={styles.mealCardFooter}>
                                    <View style={styles.mealTags}>
                                      <View style={styles.mealTag}>
                                        <Text style={styles.mealTagText}>
                                          Recipe
                                        </Text>
                                      </View>
                                      {recipe?.cookTime === 0 && (
                                        <View style={styles.quickTag}>
                                          <Text style={styles.quickTagText}>
                                            No Cook
                                          </Text>
                                        </View>
                                      )}
                                    </View>
                                    <Text style={styles.mealEditHint}>
                                      Tap to modify
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        })}

                        {/* <TouchableOpacity
                          style={styles.addMealTimelineItem}
                          onPress={() =>
                            // Alert.alert(
                            //   "Feature Coming Soon",
                            //   "The 'Add Meal' feature will be upgraded in the next updates. Stay tuned!",
                            //   [
                            //     {
                            //       text: "OK",
                            //       onPress: () => console.log("Alert closed"),
                            //     },
                            //   ]
                            // )

                            showModal({
                              title: "Feature Coming Soon",
                              message:
                                "The 'Add Meal' feature will be upgraded in the next updates. Stay tuned!",
                              type: "info",
                              primaryButton: {
                                text: "OK",
                                onPress: () => setAlertModalVisible(false),
                              },
                            })
                          }
                        >
                          <View style={styles.addMealDot}>
                            <Text style={styles.addMealIcon}>+</Text>
                          </View>
                          <View style={styles.addMealContent}>
                            <Text style={styles.addMealText}>
                              Add another meal
                            </Text>
                            <Text style={styles.addMealSubtext}>
                              Snack, drink, or dessert
                            </Text>
                          </View>
                        </TouchableOpacity> */}
                      </View>
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
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalKeyboardView}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalBox}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {modalMode === "add" ? "Edit Meal" : "Edit Meal"}
                    </Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalContent}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Recipe Title</Text>
                      <TextInput
                        style={styles.input}
                        value={editingRecipeTitle}
                        onChangeText={setEditingRecipeTitle}
                        placeholder="Enter recipe title"
                        placeholderTextColor="#999"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Description</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={editingRecipeDescription}
                        onChangeText={setEditingRecipeDescription}
                        placeholder="Add recipe description..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleUpdateMeal}
                        disabled={loading}
                        activeOpacity={0.8}
                      >
                        {loading ? (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.background}
                          />
                        ) : (
                          <Text style={styles.saveButtonText}>Save Meal</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <AlertModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalVisible(false)}
        primaryButton={modalConfig.primaryButton}
        secondaryButton={modalConfig.secondaryButton}
      />
    </View>
  );
};

export default MealPlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },

  // Header Styles
  headerGradient: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    fontWeight: "400",
  },
  // addButton: {
  //   backgroundColor: "rgba(255, 255, 255, 0.2)",
  //   width: 48,
  //   height: 48,
  //   borderRadius: 24,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   borderWidth: 1,
  //   borderColor: "rgba(255, 255, 255, 0.3)",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 2,
  // },
  // addButtonText: {
  //   color: "#fff",
  //   fontSize: 28,
  //   fontWeight: "300",
  //   lineHeight: 28,
  // },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  loadingContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
  },

  // Week Display Styles
  weekContainer: {
    marginTop: 20,
    // paddingTop: 10,
    marginBottom: 24,
  },
  weekDisplayContainer: {
    paddingHorizontal: 7,
    gap: 6,
  },
  dayItem: {
    alignItems: "center",
    // paddingVertical: 6,
    // paddingHorizontal: 2,
    borderRadius: 10,
    maxWidth: 44,
    minWidth: 44,
    maxHeight: 40,
    backgroundColor: "#fff",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 1,
  },
  selectedDayItem: {
    backgroundColor: COLORS.primary,
    // transform: [{ scale: 1.0 }],
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // elevation: 4,
  },
  todayItem: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    // borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  dayAbbrev: {
    fontSize: 14,
    // alignContent: "center",
    paddingVertical: 10,
    fontWeight: "600",
    color: "#333",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "600",
  },
  dayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "transparent",
    marginTop: 4,
  },
  selectedDayIndicator: {
    backgroundColor: "#fff",
  },
  todayIndicator: {
    backgroundColor: COLORS.primary,
  },
  todayLabel: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "600",
    // marginTop: 2,
  },

  mealsSection: {
    paddingHorizontal: 10,
    paddingBottom: 5,
    // paddingTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
  },
  quickAddButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quickAddText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Meal Cards Container
  mealCardsContainer: {
    gap: 16,
  },

  // Empty State
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  planContainer: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 1,
    marginBottom: 4,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
  },
  planHeaderLeft: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2c3e50",
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: 13,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  planHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mealCount: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // elevation: 2,
  },
  mealCountNumber: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "800",
    lineHeight: 16,
  },
  mealCountLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  planAddButton: {
    backgroundColor: "#e8f4f8",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  planAddButtonText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 20,
  },

  // Enhanced No Meals State
  noMealsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noMealsIconContainer: {
    position: "relative",
    marginBottom: 16,
  },
  noMealsIcon: {
    fontSize: 48,
    zIndex: 2,
  },
  noMealsIconBg: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 80,
    height: 80,
    backgroundColor: "#f0f4f8",
    borderRadius: 40,
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 1,
  },
  noMealsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 6,
  },
  noMealsText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  noMealsAddButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 1,
  },
  noMealsAddButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // Timeline Layout
  mealsTimeline: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Timeline Meal Card
  mealCard: {
    position: "relative",
    marginBottom: 16,
  },
  timelineConnector: {
    position: "absolute",
    left: 22,
    top: -16,
    width: 2,
    height: 16,
    backgroundColor: "#e8ecf0",
  },
  mealCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mealTimelineDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 2,
    marginRight: 16,
  },
  mealTypeIcon: {
    fontSize: 18,
  },
  mealCardBody: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    // elevation: 1,
  },
  mealCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealType: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginRight: 6,
  },
  mealTypeBadge: {
    width: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  mealHeaderRight: {
    // flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },
  cuisineBadge: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 8,
    paddingLeft: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffb74d",
  },
  cuisineText: {
    fontSize: 10,
    color: "#f57c00",
    fontWeight: "600",
  },
  mealOptionsButton: {
    padding: 4,
  },
  mealOptionsText: {
    fontSize: 16,
    color: "#bdc3c7",
    fontWeight: "bold",
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 6,
    lineHeight: 22,
  },
  mealDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 18,
    marginBottom: 12,
  },
  mealDescriptionPlaceholder: {
    fontSize: 14,
    color: "#bdc3c7",
    fontStyle: "italic",
    marginBottom: 12,
  },

  // Nutrition Container
  nutritionContainer: {
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: "row",
    backgroundColor: "#f0f4f8",
    borderRadius: 12,
    padding: 8,
    justifyContent: "space-around",
  },
  nutritionItem: {
    alignItems: "center",
    flex: 1,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2c3e50",
    lineHeight: 16,
  },
  nutritionLabel: {
    fontSize: 10,
    color: "#7f8c8d",
    fontWeight: "500",
    textTransform: "uppercase",
    marginTop: 1,
  },

  // Recipe Details
  recipeDetails: {
    marginBottom: 12,
    gap: 8,
  },
  cookTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cookTimeIcon: {
    fontSize: 12,
  },
  cookTimeText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  ingredientsContainer: {
    gap: 4,
  },
  ingredientsLabel: {
    fontSize: 12,
    color: "#2c3e50",
    fontWeight: "600",
  },
  ingredientsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  ingredientItem: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "400",
  },
  moreIngredients: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Footer
  mealCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTags: {
    flexDirection: "row",
    gap: 6,
  },
  mealTag: {
    backgroundColor: "#e8f4f8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mealTagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
  },
  quickTag: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  quickTagText: {
    fontSize: 11,
    color: "#4caf50",
    fontWeight: "600",
  },
  mealEditHint: {
    fontSize: 11,
    color: "#bdc3c7",
    fontWeight: "500",
  },

  // Add Meal Timeline Item
  addMealTimelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 12,
  },
  addMealDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e8f4f8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#d0e7f0",
    borderStyle: "dashed",
    marginRight: 16,
  },
  addMealIcon: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  addMealContent: {
    flex: 1,
  },
  addMealText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  addMealSubtext: {
    fontSize: 12,
    color: "#bdc3c7",
  },

  // Legacy styles (kept for compatibility)
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalKeyboardView: {
    width: "100%",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    minHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    // elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f2f6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "400",
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f8f9fb",
    color: "#2c3e50",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.greyMint,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
