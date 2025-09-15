import { AppDispatch } from "@/redux/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { generateMealPlan } from "../redux/thunks/mealPlanThunks";
import { updateUserProfile } from "../redux/thunks/userThunks";
import { COLORS } from "../utils/stylesheet";

import AlertModal from "@/components/AlertModal";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import logoImage from "../assets/images/feastioLogo.png";
import downButton from "../assets/images/keyboard_arrow_down.png";
import upButton from "../assets/images/keyboard_arrow_up.png";

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

const PersonalDetailsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();

  const selectedDiet = (params.selectedDiet as string) || "";
  const selectedAllergies = JSON.parse(
    (params.selectedAllergies as string) || "[]"
  );
  const selectedGoals = JSON.parse((params.selectedGoals as string) || "[]");
  const selectedCuisines = JSON.parse(
    (params.selectedCuisines as string) || "[]"
  );
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [healthConditionsModalVisible, setHealthConditionsModalVisible] =
    useState(false);
  const [menstrualModalVisible, setMenstrualModalVisible] = useState(false);
  const [modalAnim] = useState(new Animated.Value(0));

  const [selectedGender, setSelectedGender] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [selectedActivityLevel, setSelectedActivityLevel] = useState("");
  const [selectedHealthConditions, setSelectedHealthConditions] = useState<
    string[]
  >([]);
  const [selectedMenstrualHealth, setSelectedMenstrualHealth] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
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

  const answered = useMemo(() => {
    const requiredFields = [
      selectedGender,
      age,
      height,
      weight,
      selectedActivityLevel,
    ].filter(Boolean).length;

    const menstrualRequired =
      selectedGender === "Female" ? (selectedMenstrualHealth ? 1 : 0) : 0;

    return (
      requiredFields +
      menstrualRequired +
      (selectedHealthConditions.length > 0 ? 1 : 0)
    );
  }, [
    selectedGender,
    age,
    height,
    weight,
    selectedActivityLevel,
    selectedHealthConditions.length,
    selectedMenstrualHealth,
  ]);

  const totalQuestions = useMemo(() => {
    const baseQuestions = 6;
    const menstrualQuestion = selectedGender === "Female" ? 1 : 0;
    return baseQuestions + menstrualQuestion;
  }, [selectedGender]);

  const showModal = (
    config: Partial<typeof modalConfig> & { message: string }
  ) => {
    setModalConfig({ ...modalConfig, ...config });
    setModalVisible(true);
  };

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

  const handleCreateMealPlan = useCallback(async () => {
    if (
      !selectedGender ||
      !age ||
      !height ||
      !weight ||
      !selectedActivityLevel ||
      (selectedGender === "Female" && !selectedMenstrualHealth)
    ) {
      showModal({
        title: "Incomplete Information",
        message: "Please fill in all required fields to continue.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setModalVisible(false),
        },
      });
      return;
    }

    setLoading(true);
    setLoadingMessage("Creating Your Plan...");

    const timer = setTimeout(() => {
      setLoadingMessage("This might take a few seconds...");
    }, 10000);

    try {
      console.log("Starting complete personalization...");

      const profileData = {
        dietaryRestrictions: [selectedDiet],
        allergies: selectedAllergies,
        healthGoals: selectedGoals,
        cuisinePreferences: selectedCuisines,
        gender: selectedGender,
        age: parseInt(age),
        height: parseInt(height),
        weight: parseInt(weight),
        activityLevel: selectedActivityLevel,
        healthConditions: selectedHealthConditions,
        menstrualHealth:
          selectedGender === "Female" ? selectedMenstrualHealth : undefined,
      };

      console.log("Profile data:", profileData);

      console.log("Dispatching updateUserProfile...");
      const updatedProfile = await dispatch(
        updateUserProfile(profileData)
      ).unwrap();
      console.log("Profile updated:", updatedProfile);

      console.log("Dispatching generateMealPlan...");
      const mealPlan = await dispatch(
        generateMealPlan({
          ...profileData,
          name: "Personal Menu",
        })
      ).unwrap();
      console.log("Meal plan generated:", mealPlan);

      console.log("Navigating to /homeScreen...");
      router.replace("/(tabs)/homeScreen");
    } catch (err: any) {
      console.error("Personalization failed:", err);

      showModal({
        title: "Personalization Failed",
        message:
          err?.response?.data?.error ||
          err?.message ||
          "An unexpected error occurred. Please try again.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setModalVisible(false),
        },
      });
    } finally {
      console.log("Personalization process complete. Cleaning up states...");
      clearTimeout(timer);
      setLoading(false);
      setLoadingMessage(null);
    }
  }, [
    selectedGender,
    age,
    height,
    weight,
    selectedActivityLevel,
    selectedHealthConditions,
    selectedMenstrualHealth,
    selectedDiet,
    selectedAllergies,
    selectedGoals,
    selectedCuisines,
    dispatch,
    router,
  ]);

  const genderOptions = useMemo(
    () => ["Male", "Female", "Other", "Prefer not to say"],
    []
  );

  const activityOptions = useMemo(
    () => [
      "Sedentary",
      "Lightly Active",
      "Moderately Active",
      "Very Active",
      "Athlete",
    ],
    []
  );

  const healthConditionOptions = useMemo(
    () => [
      "None",
      "Diabetes",
      "High Blood Pressure",
      "Heart Disease",
      "Thyroid Issues",
      "PCOS",
      "High Cholesterol",
      "Food Intolerances",
      "Digestive Issues",
      "Other",
    ],
    []
  );

  const menstrualOptions = useMemo(
    () => [
      "Regular cycle",
      "Irregular cycle",
      "PCOS",
      "Menopause / Perimenopause",
      "Prefer not to say",
    ],
    []
  );

  const isButtonDisabled = useMemo(
    () =>
      !selectedGender ||
      !age ||
      !height ||
      !weight ||
      !selectedActivityLevel ||
      (selectedGender === "Female" && !selectedMenstrualHealth) ||
      loading,
    [
      selectedGender,
      age,
      height,
      weight,
      selectedActivityLevel,
      selectedMenstrualHealth,
      loading,
    ]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Image source={logoImage} style={styles.logoImage} />

        <View style={styles.titleContainer}>
          <Text style={styles.subtitle}>
            Now let's get your personal details to create the most accurate meal
            plan
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {answered === totalQuestions
                ? "All done!"
                : `Step ${answered} of ${totalQuestions}`}
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round((answered / totalQuestions) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${(answered / totalQuestions) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.questionsScroll}
        contentContainerStyle={styles.questionsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionsContainer}>
          <TouchableOpacity
            onPress={() => openModal(setGenderModalVisible)}
            style={[
              styles.questionCard,
              selectedGender && styles.questionCardSelected,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select gender"
          >
            <View style={styles.questionHeader}>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Gender</Text>
                <Text style={styles.questionSubtitle}>
                  This helps us personalize your nutrition
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Image
                  source={genderModalVisible ? upButton : downButton}
                  style={[styles.arrowIcon, { tintColor: COLORS.textPrimary }]}
                />
              </View>
            </View>
            {selectedGender && (
              <View style={styles.selectedSection}>
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>{selectedGender}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View
            style={[styles.questionCard, age && styles.questionCardSelected]}
          >
            <View style={styles.questionHeader}>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Age</Text>
                <Text style={styles.questionSubtitle}>How old are you?</Text>
              </View>
            </View>
            <View style={styles.inputSection}>
              <TextInput
                style={styles.numberInput}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputUnit}>years</Text>
            </View>
          </View>

          <View
            style={[styles.questionCard, height && styles.questionCardSelected]}
          >
            <View style={styles.questionHeader}>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Height</Text>
                <Text style={styles.questionSubtitle}>
                  What's your height in centimeters?
                </Text>
              </View>
            </View>
            <View style={styles.inputSection}>
              <TextInput
                style={styles.numberInput}
                value={height}
                onChangeText={setHeight}
                placeholder="Enter your height"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputUnit}>cms</Text>
            </View>
          </View>

          <View
            style={[styles.questionCard, weight && styles.questionCardSelected]}
          >
            <View style={styles.questionHeader}>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Weight</Text>
                <Text style={styles.questionSubtitle}>
                  What's your current weight in kilograms?
                </Text>
              </View>
            </View>
            <View style={styles.inputSection}>
              <TextInput
                style={styles.numberInput}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter your weight"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputUnit}>kgs</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => openModal(setActivityModalVisible)}
            style={[
              styles.questionCard,
              selectedActivityLevel && styles.questionCardSelected,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select activity level"
          >
            <View style={styles.questionHeader}>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Activity Level</Text>
                <Text style={styles.questionSubtitle}>
                  How active are you typically?
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Image
                  source={activityModalVisible ? upButton : downButton}
                  style={[styles.arrowIcon, { tintColor: COLORS.textPrimary }]}
                />
              </View>
            </View>
            {selectedActivityLevel && (
              <View style={styles.selectedSection}>
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>
                    {selectedActivityLevel}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openModal(setHealthConditionsModalVisible)}
            style={[
              styles.questionCard,
              selectedHealthConditions.length > 0 &&
                styles.questionCardSelected,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select health conditions"
          >
            <View style={styles.questionHeader}>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Health Conditions</Text>
                <Text style={styles.questionSubtitle}>
                  Any medical conditions we should know about? (Optional)
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Image
                  source={healthConditionsModalVisible ? upButton : downButton}
                  style={[styles.arrowIcon, { tintColor: COLORS.textPrimary }]}
                />
              </View>
            </View>
            {selectedHealthConditions.length > 0 && (
              <View style={styles.selectedSection}>
                <View style={styles.selectedContainer}>
                  {selectedHealthConditions.map((condition, index) => (
                    <View key={index} style={styles.selectedChip}>
                      <Text style={styles.selectedChipText}>{condition}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>

          {selectedGender === "Female" && (
            <TouchableOpacity
              onPress={() => openModal(setMenstrualModalVisible)}
              style={[
                styles.questionCard,
                selectedMenstrualHealth && styles.questionCardSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Select menstrual health status"
            >
              <View style={styles.questionHeader}>
                <View style={styles.questionContent}>
                  <Text style={styles.questionTitle}>Menstrual Health</Text>
                  <Text style={styles.questionSubtitle}>
                    This helps us provide better nutrition recommendations
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Image
                    source={menstrualModalVisible ? upButton : downButton}
                    style={[
                      styles.arrowIcon,
                      { tintColor: COLORS.textPrimary },
                    ]}
                  />
                </View>
              </View>
              {selectedMenstrualHealth && (
                <View style={styles.selectedSection}>
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>
                      {selectedMenstrualHealth}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleCreateMealPlan}
            style={[
              styles.generateButton,
              isButtonDisabled && styles.generateButtonDisabled,
            ]}
            disabled={isButtonDisabled}
            accessibilityRole="button"
            accessibilityLabel="Create meal plan"
          >
            <View style={styles.buttonContent}>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={styles.generateButtonText}>
                {loading ? loadingMessage : "Create Meal Plan"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DropdownModal
        visible={genderModalVisible}
        setVisible={setGenderModalVisible}
        options={genderOptions}
        selectedValue={selectedGender}
        setSelectedValue={setSelectedGender}
        isMultiSelect={false}
        questionLabel="Gender"
        helperText="Select your gender"
        modalAnim={modalAnim}
        closeModal={closeModal}
      />

      <DropdownModal
        visible={activityModalVisible}
        setVisible={setActivityModalVisible}
        options={activityOptions}
        selectedValue={selectedActivityLevel}
        setSelectedValue={setSelectedActivityLevel}
        isMultiSelect={false}
        questionLabel="Activity Level"
        helperText="Choose the option that best describes your typical activity"
        modalAnim={modalAnim}
        closeModal={closeModal}
      />

      <DropdownModal
        visible={healthConditionsModalVisible}
        setVisible={setHealthConditionsModalVisible}
        options={healthConditionOptions}
        isMultiSelect={true}
        selectedValues={selectedHealthConditions}
        setSelectedValues={setSelectedHealthConditions}
        questionLabel="Health Conditions"
        helperText="Select any conditions that apply to you"
        modalAnim={modalAnim}
        closeModal={closeModal}
        handleMultiSelect={handleMultiSelect}
      />

      {selectedGender === "Female" && (
        <DropdownModal
          visible={menstrualModalVisible}
          setVisible={setMenstrualModalVisible}
          options={menstrualOptions}
          selectedValue={selectedMenstrualHealth}
          setSelectedValue={setSelectedMenstrualHealth}
          isMultiSelect={false}
          questionLabel="Menstrual Health"
          helperText="This helps us provide personalized nutrition guidance"
          modalAnim={modalAnim}
          closeModal={closeModal}
        />
      )}

      <AlertModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalVisible(false)}
        primaryButton={modalConfig.primaryButton}
        secondaryButton={modalConfig.secondaryButton}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },

  headerSection: {
    paddingTop: 30,
    paddingBottom: 12,
    alignItems: "center",
  },
  logoImage: {
    width: "60%",
    height: 60,
    marginBottom: 10,
    resizeMode: "contain",
    alignSelf: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  progressContainer: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // elevation: 2,
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
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: COLORS.greyLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },

  questionsScroll: {
    flex: 1,
    marginTop: 8,
  },
  questionsScrollContent: {
    paddingBottom: 20,
  },
  questionsContainer: {
    gap: 16,
  },

  questionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  questionCardSelected: {
    // borderColor: COLORS.primary,
    backgroundColor: COLORS.cardBackground,
  },

  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  questionIconContainer: {
    marginRight: 16,
  },
  questionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  questionEmoji: {
    fontSize: 24,
  },

  questionContent: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 24,
  },
  questionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 36,
    // paddingBottom: 6,
    marginVertical: 10,
  },
  numberInput: {
    height: verticalScale(35),
    borderWidth: 1,
    borderLeftWidth: 6,
    borderTopLeftRadius: scale(10),
    borderBottomLeftRadius: scale(10),
    borderColor: COLORS.primaryDark,
    borderRadius: scale(8),
    paddingHorizontal: scale(22),
    fontSize: moderateScale(14),
    // marginTop: verticalScale(10),
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  inputUnit: {
    marginLeft: 6,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
    // textAlign: "left",
  },

  selectedSection: {
    marginTop: 16,
    // paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyLight,
  },
  selectedBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    alignSelf: "flex-start",
  },
  selectedBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedChip: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
  },
  selectedChipText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "600",
  },

  arrowContainer: {
    marginLeft: 12,
    justifyContent: "center",
  },
  arrowIcon: {
    width: 24,
    height: 24,
  },

  buttonContainer: {
    paddingTop: 32,
    paddingBottom: 20,
  },
  generateButton: {
    borderRadius: 16,
    paddingVertical: 16,
    // paddingHorizontal: 10,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    // elevation: 8,
  },
  generateButtonDisabled: {
    backgroundColor: COLORS.primary,
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  buttonEmoji: {
    fontSize: 18,
    marginLeft: 8,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 8,
  },

  modalOverlaySimple: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  modalContentSimple: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  modalHeaderSimple: {
    marginBottom: 24,
    alignItems: "center",
  },
  modalTitleSimple: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  helperTextSimple: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  optionItemSimple: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    marginVertical: 3,
    backgroundColor: COLORS.greyLight,
  },
  selectedOptionSimple: {
    backgroundColor: COLORS.greyMint,
    // borderWidth: 2,
    // borderColor: COLORS.primary,
  },
  optionTextSimple: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
    flex: 1,
  },
  selectedOptionTextSimple: {
    fontWeight: "600",
    fontSize: 16,
    color: COLORS.primary,
  },
  checkmarkSimple: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  doneButtonSimple: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    // elevation: 6,
  },
  doneButtonTextSimple: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default PersonalDetailsScreen;
