import { AppDispatch, RootState } from "@/redux/store";
import { getTodayMealPlanThunk } from "@/redux/thunks/mealPlanThunks";
import { COLORS } from "@/utils/stylesheet";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";
import { getTodayTips } from "../../utils/dashboardUtils";
import { tipCards } from "../../utils/tipCards";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const { todayMealPlan, loading, error } = useSelector(
    (state: RootState) => state.mealPlan
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<FlatList>(null);

  const todayTips = getTodayTips(tipCards, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      const isLast = currentIndex === todayTips.length - 1;
      const nextIndex = isLast ? 0 : currentIndex + 1;

      scrollRef.current?.scrollToIndex({
        index: nextIndex,
        animated: !isLast,
      });

      if (isLast) {
        setCurrentIndex(0);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex, todayTips.length]);

  useEffect(() => {
    dispatch(getTodayMealPlanThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && todayMealPlan) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, todayMealPlan]);

  const handleMomentumScrollEnd = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (screenWidth - 40));
    setCurrentIndex(index);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getTodayMealPlanThunk()); // fetch latest meal plan
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLearnMore = (url: string) => {
    Linking.openURL(url).catch((error) => {
      console.error("Failed to open URL:", error);
    });
  };

  const renderMealCard = (mealType: any, mealData: any) => (
    <View key={mealType} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        {/* <View style={styles.mealIconContainer}> */}
        {/* <Text style={styles.mealIcon}>{getMealIcon(mealType)}</Text> */}
        {/* </View> */}
        <View style={styles.mealInfo}>
          <Text style={styles.mealType}>{mealType.toUpperCase()}</Text>
          {/* <Text style={styles.mealTime}>{mealData.scheduledTime}</Text> */}
        </View>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: mealData.completed ? "#4CAF50" : "#FFC107" },
          ]}
        />
      </View>
      <Text style={styles.mealName}>{mealData.name}</Text>
      <Text style={styles.mealCalories}>{mealData.calories} cal</Text>
    </View>
  );

  if (isInitialLoading || loading || !todayMealPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || "#4CAF50"} />
          <Text style={styles.loaderText}>
            Your health hack starts here!{"\n"}Please wait...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error) return <Text>Error: {error}</Text>;

  const { meals, totalCalories, dailyNutritionalSummary } = todayMealPlan.data;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]} // Android: progress indicator color
            tintColor={COLORS.primary} // iOS: spinner color
            title="Refreshing..." // optional
            titleColor={COLORS.textSecondary}
          />
        }
      >
        <View style={styles.headerWrapper}>
          <Image
            source={require("../../assets/images/nutrisenseLogo.png")}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.tipsSection}>
          <FlatList
            // getItemLayout={(data, index) => ({
            //   length: screenWidth - 40,
            //   offset: (screenWidth - 40) * index,
            //   index,
            // })}
            // removeClippedSubviews={true}
            // maxToRenderPerBatch={5}
            // updateCellsBatchingPeriod={50}
            // windowSize={10}
            ref={scrollRef}
            data={todayTips}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            // snapToAlignment="center"
            // snapToInterval={screenWidth}
            // decelerationRate="fast"
            // contentContainerStyle={{ marginHorizontal: 3 }}
            renderItem={({ item }) => (
              <View style={[styles.tipCard, { width: screenWidth - 40 }]}>
                <View style={styles.tipImageContainer}>
                  <Image
                    source={item.icon}
                    style={styles.tipImage}
                    resizeMode="cover"
                  />
                  <View style={styles.tipOverlay} />
                </View>
                <View style={styles.tipTextContainer}>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{item.title}</Text>
                    <Text style={styles.tipDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.learnMoreButton}
                    onPress={() => handleLearnMore(item.url)}
                  >
                    <Text style={styles.learnMoreText}>Learn More</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={styles.dotsContainer}>
            {todayTips.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <Text style={styles.sectionDate}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Meals List */}
          <View style={styles.mealsContainer}>
            {Object.entries(meals)
              .filter(([_, mealData]) => mealData !== null)
              .map(([mealType, mealData]) =>
                renderMealCard(mealType, mealData)
              )}
          </View>

          <View style={styles.caloriesContainer}>
            <View style={styles.nutritionRow}>
              <View style={styles.caloriesInfo}>
                <Text style={styles.caloriesLabel}>Calories</Text>
                <Text style={styles.caloriesText}>{totalCalories} cal</Text>
              </View>
              <View style={styles.caloriesInfo}>
                <Text style={styles.caloriesLabel}>Carbs</Text>
                <Text style={styles.caloriesText}>
                  {dailyNutritionalSummary?.carbohydrates} g
                </Text>
              </View>
            </View>

            <View style={styles.nutritionRow}>
              <View style={styles.caloriesInfo}>
                <Text style={styles.caloriesLabel}>Protein</Text>
                <Text style={styles.caloriesText}>
                  {dailyNutritionalSummary?.protein} g
                </Text>
              </View>
              <View style={styles.caloriesInfo}>
                <Text style={styles.caloriesLabel}>Fat</Text>
                <Text style={styles.caloriesText}>
                  {dailyNutritionalSummary?.fat} g
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.aiSection}>
          {/* <Text style={styles.aiSectionTitle}>Sage AI Assistant</Text> */}
          <View style={styles.aiCard}>
            <View style={styles.aiContent}>
              <Text style={styles.aiTitle}>Sage AI Assistant</Text>
              <Text style={styles.aiDescription}>
                Chat with me about your nutrition goals! I'll help you plan
                meals, understand food choices, and stay on track with healthy
                eating.
              </Text>

              <View style={styles.aiFeatures}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureDot}>•</Text>
                  <Text style={styles.featureText}>Meal suggestions</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureDot}>•</Text>
                  <Text style={styles.featureText}>Nutrition analysis</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureDot}>•</Text>
                  <Text style={styles.featureText}>Dietary guidance</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.chatButton}
              activeOpacity={0.8}
              onPress={() => router.push("/aiAssistantScreen")}
            >
              <Text style={styles.chatButtonText}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(14),
    color: "#666",
    textAlign: "center",
  },
  headerWrapper: {
    alignItems: "center",
    // marginVertical: verticalScale(5),
  },
  headerIcon: {
    width: "60%",
    height: verticalScale(60),
  },
  // Tips Section Styles
  tipsSection: {
    marginHorizontal: scale(14),
    marginBottom: verticalScale(20),
  },
  tipCard: {
    backgroundColor: COLORS.greyMint,
    borderRadius: scale(16),
    marginHorizontal: scale(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: "hidden",
  },

  tipImageContainer: {
    height: verticalScale(160),
    position: "relative",
  },

  tipImage: {
    width: "100%",
    height: "100%",
  },

  tipOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  tipTextContainer: {
    flex: 1,
    paddingVertical: scale(20),
    paddingHorizontal: scale(18),
    flexDirection: "column",
    justifyContent: "space-between",
    marginHorizontal: scale(10),
  },

  tipContent: {
    // flex: 1, // Takes available space
  },

  tipTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: verticalScale(6),
  },
  tipDescription: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(20),
    // marginBottom: verticalScale(10),
  },
  learnMoreButton: {
    alignSelf: "flex-start", // Positions button to the right
    // backgroundColor: COLORS.primary,
    // paddingHorizontal: scale(16),
    // paddingVertical: verticalScale(20),
    borderRadius: scale(20),
    marginTop: verticalScale(10),
  },

  learnMoreText: {
    fontSize: moderateScale(12),
    color: COLORS.primary,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(15),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#E0E0E0",
    marginHorizontal: scale(4),
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: scale(24),
  },

  section: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(25),
    backgroundColor: COLORS.greyMint,
    borderRadius: scale(16),
    padding: scale(20),
    // elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  sectionDate: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  caloriesContainer: {
    backgroundColor: COLORS.greyMint,
    borderRadius: scale(12),
    paddingHorizontal: scale(6),
    // paddingRight: scale(10),
    // marginBottom: verticalScale(45),
  },
  nutritionRow: {
    flexDirection: "row",
    gap: scale(16),
    // width: "48%",
  },
  caloriesInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
    width: "48%",
  },
  caloriesLabel: {
    fontSize: moderateScale(14),
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  caloriesText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: COLORS.primary,
  },
  nutritionBreakdown: {
    marginTop: 8,
    // paddingHorizontal: 4,
  },
  nutritionText: {
    fontSize: 14,
    color: "#555",
    marginVertical: 2,
  },
  progressBar: {
    height: verticalScale(8),
    borderRadius: scale(4),
    backgroundColor: "#E8F5E8",
    marginBottom: verticalScale(8),
  },
  progressFill: {
    height: "100%",
    borderRadius: scale(4),
    backgroundColor: COLORS.primary,
  },
  caloriesRemaining: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  mealsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: verticalScale(10),
  },
  mealCard: {
    width: "48%",
    backgroundColor: "#FAFAFA",
    borderRadius: scale(12),
    padding: scale(12),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  mealIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(8),
  },
  mealIcon: {
    fontSize: moderateScale(16),
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: moderateScale(10),
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  mealTime: {
    fontSize: moderateScale(11),
    color: COLORS.textSecondary,
  },
  statusIndicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  mealName: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: COLORS.textPrimary,
    // lineHeight: moderateScale(22),
    marginBottom: verticalScale(4),
  },
  mealCalories: {
    fontSize: moderateScale(12),
    color: COLORS.primary,
    fontWeight: "500",
    textAlignVertical: "bottom",
  },

  aiSection: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(10),
  },

  aiSectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: verticalScale(16),
    marginHorizontal: scale(15),
  },

  aiCard: {
    backgroundColor: COLORS.greyMint,
    borderRadius: moderateScale(20),
    paddingVertical: moderateScale(24),
    paddingHorizontal: moderateScale(12),
    // elevation: 1,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    position: "relative",
    overflow: "hidden",
  },

  aiContent: {
    marginBottom: verticalScale(24),
  },

  aiTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: verticalScale(12),
    letterSpacing: -0.3,
  },

  aiDescription: {
    fontSize: moderateScale(15),
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(20),
  },

  aiFeatures: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    paddingHorizontal: scale(10),
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  featureDot: {
    fontSize: moderateScale(16),
    color: COLORS.textSecondary,
    marginRight: scale(6),
  },

  featureText: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  chatButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  chatButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: "700",
    marginRight: scale(8),
  },

  chatButtonIcon: {
    color: COLORS.primaryDark,
    fontSize: moderateScale(18),
    fontWeight: "700",
  },
});

const loaderStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    marginBottom: verticalScale(20),
    borderRadius: moderateScale(40),
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: moderateScale(50),
    height: moderateScale(50),
  },
  textContainer: {
    alignItems: "center",
    marginBottom: verticalScale(30),
  },
  loadingText: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: "#333",
    marginBottom: verticalScale(8),
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: moderateScale(14),
    color: "#666",
    textAlign: "center",
  },
  spinnerContainer: {
    marginBottom: verticalScale(20),
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: "#4CAF50",
    marginHorizontal: scale(4),
  },
});
