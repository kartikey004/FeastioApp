import { AppDispatch } from "@/redux/store";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { generateMealPlan } from "../redux/thunks/mealPlanThunks";
import { updateUserProfile } from "../redux/thunks/userThunks";
import { COLORS } from "../utils/stylesheet";

import downButton from "../assets/images/keyboard_arrow_down.png";
import upButton from "../assets/images/keyboard_arrow_up.png";
import logoImage from "../assets/images/nutrisenseLogo.png";

interface DropdownModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  options: string[];
  selectedValue?: string;
  setSelectedValue?: (value: string) => void;
  isMultiSelect?: boolean;
  selectedValues?: string[];
  setSelectedValues?: (values: string[]) => void;
  questionLabel: string;
  helperText?: string;
  modalAnim: Animated.Value;
  closeModal: (setter: (value: boolean) => void) => void;
  handleMultiSelect?: (
    item: string,
    selectedItems: string[],
    setSelectedItems: (values: string[]) => void
  ) => void;
}

const DropdownModal: React.FC<DropdownModalProps> = React.memo(
  ({
    visible,
    setVisible,
    options,
    selectedValue,
    setSelectedValue,
    isMultiSelect,
    selectedValues,
    setSelectedValues,
    questionLabel,
    helperText,
    modalAnim,
    closeModal,
    handleMultiSelect,
  }) => {
    return (
      <SafeAreaView>
        <Modal
          visible={visible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => closeModal(setVisible)}
        >
          <TouchableWithoutFeedback onPress={() => closeModal(setVisible)}>
            <View style={styles.modalOverlaySimple}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <Animated.View
                  style={[
                    styles.modalContentSimple,
                    {
                      opacity: modalAnim,
                      transform: [
                        {
                          translateY: modalAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [40, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.modalHeaderSimple}>
                    <Text style={styles.modalTitleSimple}>{questionLabel}</Text>
                    {helperText ? (
                      <Text style={styles.helperTextSimple}>{helperText}</Text>
                    ) : null}
                  </View>
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.optionItemSimple,
                          (isMultiSelect
                            ? selectedValues?.includes(item)
                            : selectedValue === item) &&
                            styles.selectedOptionSimple,
                        ]}
                        onPress={() => {
                          if (isMultiSelect && setSelectedValues) {
                            handleMultiSelect?.(
                              item,
                              selectedValues || [],
                              setSelectedValues
                            );
                          } else {
                            setSelectedValue?.(item);
                            closeModal(setVisible);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.optionTextSimple,
                            (isMultiSelect
                              ? selectedValues?.includes(item)
                              : selectedValue === item) &&
                              styles.selectedOptionTextSimple,
                          ]}
                        >
                          {item}
                        </Text>
                        {(isMultiSelect && selectedValues?.includes(item)) ||
                        (!isMultiSelect && selectedValue === item) ? (
                          <Text style={styles.checkmarkSimple}>✓</Text>
                        ) : null}
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                  {isMultiSelect && (
                    <TouchableOpacity
                      style={styles.doneButtonSimple}
                      onPress={() => closeModal(setVisible)}
                    >
                      <Text style={styles.doneButtonTextSimple}>Done</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    );
  }
);

const PersonalizationScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [dietModalVisible, setDietModalVisible] = useState(false);
  const [cuisineModalVisible, setCuisineModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [modalAnim] = useState(new Animated.Value(0));

  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const answered = useMemo(() => {
    return [
      selectedDiet,
      selectedAllergies.length,
      selectedGoals.length,
      selectedCuisines.length,
    ].filter(Boolean).length;
  }, [
    selectedDiet,
    selectedAllergies.length,
    selectedGoals.length,
    selectedCuisines.length,
  ]);

  const openModal = useCallback((setter: (arg0: boolean) => void) => {
    setter(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const closeModal = useCallback((setter: (arg0: boolean) => void) => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setter(false));
  }, []);

  const handleMultiSelect = useCallback(
    (
      item: any,
      selectedItems: any[],
      setSelectedItems: (arg0: any[]) => void
    ) => {
      if (selectedItems.includes(item))
        setSelectedItems(selectedItems.filter((i) => i !== item));
      else setSelectedItems([...selectedItems, item]);
    },
    []
  );

  const handlePersonalization = useCallback(async () => {
    if (
      !selectedDiet ||
      !selectedAllergies.length ||
      !selectedGoals.length ||
      !selectedCuisines.length
    ) {
      Alert.alert(
        "Incomplete Information",
        "Please answer all the questions to continue."
      );
      return;
    }

    setLoading(true);
    setGenerating(true);

    try {
      console.log("🔹 Starting personalization...");
      console.log("Diet:", selectedDiet);
      console.log("Allergies:", selectedAllergies);
      console.log("Goals:", selectedGoals);
      console.log("Cuisines:", selectedCuisines);

      console.log("➡️ Dispatching updateUserProfile...");
      const updatedProfile = await dispatch(
        updateUserProfile({
          dietaryRestrictions: [selectedDiet],
          allergies: selectedAllergies,
          healthGoals: selectedGoals,
          cuisinePreferences: selectedCuisines,
        })
      ).unwrap();
      console.log("Profile updated:", updatedProfile);

      console.log("➡️ Dispatching generateMealPlan...");
      const mealPlan = await dispatch(
        generateMealPlan({
          dietaryRestrictions: selectedDiet,
          allergies: selectedAllergies,
          healthGoals: selectedGoals,
          cuisinePreferences: selectedCuisines,
          name: "My Personalized Meal Plan",
        })
      ).unwrap();
      console.log("✅ Meal plan generated:", mealPlan);

      console.log("➡️ Navigating to /homeScreen...");
      router.replace("/(tabs)/homeScreen");
    } catch (err: any) {
      console.error("Personalization failed:", err);
      Alert.alert(
        "Personalization Failed",
        err?.response?.data?.error || err?.message || "Unexpected error."
      );
    } finally {
      console.log("🔹 Personalization process complete. Cleaning up states...");
      setLoading(false);
      setGenerating(false);
    }
  }, [
    selectedDiet,
    selectedAllergies,
    selectedGoals,
    selectedCuisines,
    dispatch,
    router,
  ]);

  const dietOptions = useMemo(
    () => [
      "No specific diet",
      "Vegetarian",
      "Vegan",
      "Keto",
      "Paleo",
      "Mediterranean",
      "Low-carb",
      "Gluten-free",
      "Intermittent fasting",
      "Plant-based",
    ],
    []
  );
  const allergyOptions = useMemo(
    () => [
      "No allergies",
      "Nuts",
      "Dairy",
      "Eggs",
      "Gluten",
      "Shellfish",
      "Fish",
      "Soy",
      "Sesame",
      "Other",
    ],
    []
  );
  const goalOptions = useMemo(
    () => [
      "Weight loss",
      "Weight gain",
      "Muscle building",
      "General fitness",
      "Improved energy",
      "Better sleep",
      "Heart health",
      "Digestive health",
      "Mental wellness",
      "Athletic performance",
    ],
    []
  );
  const cuisineOptions = useMemo(
    () => [
      "Italian",
      "Mexican",
      "Chinese",
      "Indian",
      "Japanese",
      "Mediterranean",
      "Thai",
      "American",
      "French",
      "Korean",
      "Middle Eastern",
      "Greek",
    ],
    []
  );

  const isButtonDisabled = useMemo(
    () =>
      !selectedDiet ||
      !selectedAllergies.length ||
      !selectedGoals.length ||
      !selectedCuisines.length ||
      loading,
    [
      selectedDiet,
      selectedAllergies.length,
      selectedGoals.length,
      selectedCuisines.length,
      loading,
    ]
  );
  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header Section */}

      <View style={styles.headerSection}>
        <Image source={logoImage} style={styles.logoImage} />
        <Text style={styles.title}>Let's personalize your meal plan</Text>
        <Text style={styles.subtitle}>
          Tell us about your preferences so we can create the perfect plan for
          you
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {answered === 4 ? "All done!" : `Step ${answered + 1} of 4`}
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round((answered / 4) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(answered / 4) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.questionsScroll}
        contentContainerStyle={styles.questionsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => openModal(setDietModalVisible)}
          style={[
            styles.questionCard,
            selectedDiet && styles.questionCardSelected,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Select dietary restrictions"
        >
          <View style={styles.questionIconContainer}>
            <View
              style={[styles.questionIcon, { backgroundColor: COLORS.accent }]}
            >
              <Text style={styles.questionEmoji}>🥗</Text>
            </View>
          </View>
          <View style={styles.questionContent}>
            <Text style={styles.questionTitle}>Dietary Preferences</Text>
            <Text style={styles.questionSubtitle}>
              Do you follow any specific diet?
            </Text>
            {selectedDiet && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{selectedDiet}</Text>
              </View>
            )}
          </View>
          <View style={styles.arrowContainer}>
            <Image
              source={dietModalVisible ? upButton : downButton}
              style={[styles.arrowIcon, { tintColor: COLORS.primary }]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openModal(setAllergyModalVisible)}
          style={[
            styles.questionCard,
            selectedAllergies.length > 0 && styles.questionCardSelected,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Select food allergies"
        >
          <View style={styles.questionIconContainer}>
            <View
              style={[
                styles.questionIcon,
                { backgroundColor: COLORS.sageLight },
              ]}
            >
              <Text style={styles.questionEmoji}>⚠️</Text>
            </View>
          </View>
          <View style={styles.questionContent}>
            <Text style={styles.questionTitle}>Food Allergies</Text>
            <Text style={styles.questionSubtitle}>
              Any ingredients to avoid?
            </Text>
            {selectedAllergies.length > 0 && (
              <View style={styles.selectedContainer}>
                {selectedAllergies.map((allergy, index) => (
                  <View key={index} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View style={styles.arrowContainer}>
            <Image
              source={allergyModalVisible ? upButton : downButton}
              style={[styles.arrowIcon, { tintColor: COLORS.primary }]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openModal(setGoalsModalVisible)}
          style={[
            styles.questionCard,
            selectedGoals.length > 0 && styles.questionCardSelected,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Select health and fitness goals"
        >
          <View style={styles.questionIconContainer}>
            <View
              style={[styles.questionIcon, { backgroundColor: COLORS.accent }]}
            >
              <Text style={styles.questionEmoji}>🎯</Text>
            </View>
          </View>
          <View style={styles.questionContent}>
            <Text style={styles.questionTitle}>Health Goals</Text>
            <Text style={styles.questionSubtitle}>
              What are you working towards?
            </Text>
            {selectedGoals.length > 0 && (
              <View style={styles.selectedContainer}>
                {selectedGoals.map((goal, index) => (
                  <View key={index} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>{goal}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View style={styles.arrowContainer}>
            <Image
              source={goalsModalVisible ? upButton : downButton}
              style={[styles.arrowIcon, { tintColor: COLORS.primary }]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openModal(setCuisineModalVisible)}
          style={[
            styles.questionCard,
            selectedCuisines.length > 0 && styles.questionCardSelected,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Select cuisine preferences"
        >
          <View style={styles.questionIconContainer}>
            <View
              style={[
                styles.questionIcon,
                { backgroundColor: COLORS.sageLight },
              ]}
            >
              <Text style={styles.questionEmoji}>🌍</Text>
            </View>
          </View>
          <View style={styles.questionContent}>
            <Text style={styles.questionTitle}>Favorite Cuisines</Text>
            <Text style={styles.questionSubtitle}>
              What flavors do you love?
            </Text>
            {selectedCuisines.length > 0 && (
              <View style={styles.selectedContainer}>
                {selectedCuisines.map((cuisine, index) => (
                  <View key={index} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>{cuisine}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View style={styles.arrowContainer}>
            <Image
              source={cuisineModalVisible ? upButton : downButton}
              style={[styles.arrowIcon, { tintColor: COLORS.primary }]}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handlePersonalization}
            style={[
              styles.generateButton,
              isButtonDisabled && styles.generateButtonDisabled,
            ]}
            disabled={isButtonDisabled}
            accessibilityRole="button"
            accessibilityLabel="Generate meal plan"
          >
            <Text style={styles.generateButtonText}>
              {loading ? "Creating Your Plan..." : "Generate Meal Plan"}
            </Text>
            {!loading && <Text style={styles.buttonEmoji}></Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DropdownModal
        visible={dietModalVisible}
        setVisible={setDietModalVisible}
        options={dietOptions}
        selectedValue={selectedDiet}
        setSelectedValue={setSelectedDiet}
        isMultiSelect={false}
        questionLabel="Dietary Preferences"
        helperText="Choose the diet that best fits your lifestyle"
        modalAnim={modalAnim}
        closeModal={closeModal}
      />

      <DropdownModal
        visible={allergyModalVisible}
        setVisible={setAllergyModalVisible}
        options={allergyOptions}
        isMultiSelect={true}
        selectedValues={selectedAllergies}
        setSelectedValues={setSelectedAllergies}
        questionLabel="Food Allergies"
        helperText="Select all ingredients you need to avoid"
        modalAnim={modalAnim}
        closeModal={closeModal}
        handleMultiSelect={handleMultiSelect}
      />

      <DropdownModal
        visible={goalsModalVisible}
        setVisible={setGoalsModalVisible}
        options={goalOptions}
        isMultiSelect={true}
        selectedValues={selectedGoals}
        setSelectedValues={setSelectedGoals}
        questionLabel="Health & Fitness Goals"
        helperText="What would you like to achieve?"
        modalAnim={modalAnim}
        closeModal={closeModal}
        handleMultiSelect={handleMultiSelect}
      />

      <DropdownModal
        visible={cuisineModalVisible}
        setVisible={setCuisineModalVisible}
        options={cuisineOptions}
        isMultiSelect={true}
        selectedValues={selectedCuisines}
        setSelectedValues={setSelectedCuisines}
        questionLabel="Cuisine Preferences"
        helperText="Pick the flavors you enjoy most"
        modalAnim={modalAnim}
        closeModal={closeModal}
        handleMultiSelect={handleMultiSelect}
      />
    </SafeAreaView>
  );
};

export default PersonalizationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  contentContainer: {
    // flex: 1,
    paddingHorizontal: 24,
  },

  // Header Section
  headerSection: {
    paddingTop: 30,
    // paddingBottom: 32,
    alignItems: "center",
    marginBottom: 0, // <-- ensure no bottom margin
    paddingBottom: 0, // <-- no padding
  },
  logoImage: {
    width: "70%",
    height: "20%",
    marginBottom: 4,
    marginTop: 12,
    resizeMode: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 32,
  },

  progressContainer: {
    width: "100%",
    // marginBottom: 8,
    borderRadius: 8,
    marginBottom: 0,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: COLORS.greyMedium,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    // Animate smoothly
    // transition: "width 0.3s ease-in-out",
  },

  // Questions Section
  questionsScroll: {
    flex: 1,
  },
  questionsScrollContent: {
    // paddingBottom: 40,
    paddingTop: 0,
  },

  // Question Cards
  questionCard: {
    backgroundColor: COLORS.greyMint,
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // elevation: 3,
  },

  questionCardSelected: {
    // borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },

  // Question Icon
  questionIconContainer: {
    marginRight: 16,
  },
  questionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  questionEmoji: {
    fontSize: 20,
  },

  // Question Content
  questionContent: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 24,
  },
  questionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },

  // Selected Items
  selectedBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  selectedBadgeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "500",
  },
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  selectedChipText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  // Arrow Icon
  arrowContainer: {
    marginLeft: 12,
    justifyContent: "center",
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },

  // Generate Button
  buttonContainer: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  generateButton: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    // Gradient fallback
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // elevation: 5,
  },
  generateButtonDisabled: {
    backgroundColor: COLORS.greyMedium,
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonEmoji: {
    fontSize: 16,
    marginLeft: 8,
  },

  // Modal Styles (Enhanced)
  modalOverlaySimple: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentSimple: {
    flex: 1,
    width: "90%",
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    maxHeight: "75%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeaderSimple: {
    marginBottom: 20,
    alignItems: "center",
  },
  modalTitleSimple: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  helperTextSimple: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  optionItemSimple: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 2,
    backgroundColor: COLORS.greyLight,
  },
  selectedOptionSimple: {
    backgroundColor: COLORS.accent,
    // borderWidth: 2,
    // borderColor: COLORS.primary,
  },
  optionTextSimple: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  selectedOptionTextSimple: {
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  checkmarkSimple: {
    fontSize: 18,
    color: COLORS.primary,
  },
  doneButtonSimple: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonTextSimple: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
