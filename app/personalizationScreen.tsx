import { AppDispatch } from "@/redux/store";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
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
import { COLORS } from "../utils/stylesheet";

import AlertModal from "@/components/AlertModal";
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

const PersonalizationScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [dietModalVisible, setDietModalVisible] = useState(false);
  const [cuisineModalVisible, setCuisineModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [modalAnim] = useState(new Animated.Value(0));

  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

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

  const handleContinueToPersonalDetails = useCallback(() => {
    if (
      !selectedDiet ||
      !selectedAllergies.length ||
      !selectedGoals.length ||
      !selectedCuisines.length
    ) {
      // Alert.alert(
      //   "Incomplete Information",
      //   "Please answer all the questions to continue."
      // );

      showModal({
        title: "Incomplete Information",
        message: "Please answer all the questions to continue.",
        type: "error",
        primaryButton: {
          text: "Try Again",
          onPress: () => setModalVisible(false),
        },
      });
      return;
    }

    router.push({
      pathname: "/personalDetailsScreen",
      params: {
        selectedDiet,
        selectedAllergies: JSON.stringify(selectedAllergies),
        selectedGoals: JSON.stringify(selectedGoals),
        selectedCuisines: JSON.stringify(selectedCuisines),
      },
    });
  }, [
    selectedDiet,
    selectedAllergies,
    selectedGoals,
    selectedCuisines,
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
      !selectedCuisines.length,
    [
      selectedDiet,
      selectedAllergies.length,
      selectedGoals.length,
      selectedCuisines.length,
    ]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Image source={logoImage} style={styles.logoImage} />

        <View style={styles.titleContainer}>
          <Text style={styles.subtitle}>
            Tell us about your preferences so we can create the perfect meal
            plan for you
          </Text>
        </View>

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
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${(answered / 4) * 100}%` },
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
            onPress={() => openModal(setDietModalVisible)}
            style={[
              styles.questionCard,
              selectedDiet && styles.questionCardSelected,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select dietary restrictions"
          >
            <View style={styles.questionHeader}>
              <View style={styles.questionIconContainer}></View>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Dietary Preferences</Text>
                <Text style={styles.questionSubtitle}>
                  Do you follow any specific diet?
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Image
                  source={dietModalVisible ? upButton : downButton}
                  style={[styles.arrowIcon, { tintColor: COLORS.textPrimary }]}
                />
              </View>
            </View>
            {selectedDiet && (
              <View style={styles.selectedSection}>
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>{selectedDiet}</Text>
                </View>
              </View>
            )}
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
            <View style={styles.questionHeader}>
              <View style={styles.questionIconContainer}></View>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Food Allergies</Text>
                <Text style={styles.questionSubtitle}>
                  Any ingredients to avoid?
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Image
                  source={allergyModalVisible ? upButton : downButton}
                  style={[styles.arrowIcon, { tintColor: COLORS.textPrimary }]}
                />
              </View>
            </View>
            {selectedAllergies.length > 0 && (
              <View style={styles.selectedSection}>
                <View style={styles.selectedContainer}>
                  {selectedAllergies.map((allergy, index) => (
                    <View key={index} style={styles.selectedChip}>
                      <Text style={styles.selectedChipText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
            <View style={styles.questionHeader}>
              <View style={styles.questionIconContainer}></View>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Health Goals</Text>
                <Text style={styles.questionSubtitle}>
                  What are you working towards?
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Image
                  source={goalsModalVisible ? upButton : downButton}
                  style={[styles.arrowIcon, { tintColor: COLORS.textPrimary }]}
                />
              </View>
            </View>
            {selectedGoals.length > 0 && (
              <View style={styles.selectedSection}>
                <View style={styles.selectedContainer}>
                  {selectedGoals.map((goal, index) => (
                    <View key={index} style={styles.selectedChip}>
                      <Text style={styles.selectedChipText}>{goal}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
            <View style={styles.questionHeader}>
              <View style={styles.questionIconContainer}></View>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle}>Favourite Cuisines</Text>
                <Text style={styles.questionSubtitle}>
                  What flavors do you love?
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Image
                  source={cuisineModalVisible ? upButton : downButton}
                  style={[styles.arrowIcon, { tintColor: COLORS.textPrimary }]}
                />
              </View>
            </View>
            {selectedCuisines.length > 0 && (
              <View style={styles.selectedSection}>
                <View style={styles.selectedContainer}>
                  {selectedCuisines.map((cuisine, index) => (
                    <View key={index} style={styles.selectedChip}>
                      <Text style={styles.selectedChipText}>{cuisine}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleContinueToPersonalDetails}
            style={[
              styles.generateButton,
              isButtonDisabled && styles.generateButtonDisabled,
            ]}
            disabled={isButtonDisabled}
            accessibilityRole="button"
            accessibilityLabel="Continue to personal details"
          >
            <View style={styles.buttonContent}>
              <Text style={styles.generateButtonText}>Continue</Text>
            </View>
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

export default PersonalizationScreen;

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
    width: "70%",
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
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    backgroundColor: COLORS.greyMedium,
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
