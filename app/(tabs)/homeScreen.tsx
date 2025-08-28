import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { getTodayTips } from "../../utils/dashboardUtils";
import { tipCards } from "../../utils/tipCards";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<FlatList>(null);

  const todayTips = getTodayTips(tipCards, 5);

  // Auto rotate tips every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < todayTips.length - 1) {
        scrollRef.current?.scrollToIndex({ index: currentIndex + 1 });
        setCurrentIndex(currentIndex + 1);
      } else {
        scrollRef.current?.scrollToIndex({ index: 0 });
        setCurrentIndex(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, todayTips]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (screenWidth - 50));
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>NutriSense</Text>

        <View style={styles.tipsSection}>
          <FlatList
            ref={scrollRef}
            data={todayTips}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={[styles.tipCard, { width: screenWidth - 50 }]}>
                <View style={styles.tipContent}>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={item.icon}
                      style={styles.tipIcon}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.textWrapper}>
                    <Text style={styles.tipTitle}>{item.title}</Text>
                    <Text style={styles.tipDescription}>
                      {item.description}
                    </Text>

                    <View style={styles.readMoreContainer}>
                      <TouchableOpacity>
                        <Text style={styles.readMoreText}>Learn More</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
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
          <Text style={styles.sectionTitle}>Weekly Diet Plan</Text>

          <View style={styles.caloriesBox}>
            <Text style={styles.caloriesText}>1850 / 2000 kcal</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "92%" }]} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🍽️</Text>
              <Text style={styles.statLabel}>Meals</Text>
              <Text style={styles.statValue}>18 / 21</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💧</Text>
              <Text style={styles.statLabel}>Water</Text>
              <Text style={styles.statValue}>6 / 8</Text>
            </View>
          </View>
        </View>

        {/* AI Chat Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Chat</Text>
          <View style={styles.aiCard}>
            <Text style={styles.aiIcon}>🤖</Text>
            <Text style={styles.aiDescription}>
              Ask me anything about nutrition, meal planning, or healthy eating!
            </Text>
            <TouchableOpacity style={styles.chatButton}>
              <Text style={styles.chatButtonText}>Start Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    textAlign: "center",
    marginVertical: verticalScale(15),
    color: "#2E7D32",
  },
  tipsSection: {
    marginHorizontal: scale(10),
    marginBottom: verticalScale(20),
  },
  tipCard: {
    backgroundColor: "#F1F8E9",
    borderRadius: scale(12),
    // padding: scale(16),
    marginHorizontal: scale(14),
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  tipContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrapper: {
    backgroundColor: "#fff",
    padding: 2,
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tipIcon: {
    width: 120,
    height: 120,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  textWrapper: {
    flex: 1,
    justifyContent: "space-between", // push content up & button down
  },
  tipTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#2E7D32",
    textAlign: "left",
    marginBottom: verticalScale(5),
    marginRight: scale(2),
  },
  tipDescription: {
    fontSize: moderateScale(14),
    color: "#4E342E",
    textAlign: "left",
    marginRight: scale(2),
  },
  readMoreContainer: {
    alignItems: "flex-end", // stick to right
    marginRight: scale(10),
  },
  readMoreText: {
    fontSize: moderateScale(12),
    color: "#2E7D32",
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(8),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 50,
    backgroundColor: "#C8E6C9",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: "#2E7D32" },
  section: {
    padding: scale(16),
    marginHorizontal: scale(10),
    marginBottom: verticalScale(20),
    backgroundColor: "#F9FBE7",
    borderRadius: scale(12),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    marginBottom: verticalScale(10),
    color: "#33691E",
  },
  caloriesBox: { marginBottom: verticalScale(15) },
  caloriesText: { fontSize: moderateScale(14), marginBottom: 5 },
  progressBar: {
    height: 8,
    borderRadius: 5,
    backgroundColor: "#C8E6C9",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#2E7D32",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    padding: scale(12),
    borderRadius: scale(10),
    alignItems: "center",
    marginHorizontal: 4,
  },
  statIcon: { fontSize: moderateScale(20), marginBottom: 4 },
  statLabel: { fontSize: moderateScale(13), color: "#4E342E" },
  statValue: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#2E7D32",
  },
  aiCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: scale(12),
    padding: scale(16),
    alignItems: "center",
  },
  aiIcon: { fontSize: moderateScale(30), marginBottom: 8 },
  aiDescription: {
    fontSize: moderateScale(14),
    textAlign: "center",
    color: "#4E342E",
    marginBottom: 12,
  },
  chatButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
  },
  chatButtonText: { color: "#fff", fontSize: moderateScale(15) },
});
