import AlertModal from "@/components/AlertModal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { logoutUser } from "../../redux/thunks/authThunks";
import { fetchUserProfile } from "../../redux/thunks/userThunks";
import { COLORS } from "../../utils/stylesheet";

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const [profileData, setProfileData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  useEffect(() => {
    loadProfile();
  }, []);

  const showModal = (
    config: Partial<typeof modalConfig> & { message: string }
  ) => {
    setModalConfig({ ...modalConfig, ...config });
    setModalVisible(true);
  };

  const loadProfile = async () => {
    try {
      const result = await dispatch(fetchUserProfile()).unwrap();
      console.log("Profile loaded successfully:", result);
      setProfileData(result);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleEditPreferences = () => {
    router.push("/personalizationScreen");
  };

  const handleEditProfile = () => {
    showModal({
      title: "Feature Coming Soon",
      message: "This feature will be upgraded in the next update. Stay tuned!",
      type: "info",
      primaryButton: {
        text: "OK",
        onPress: () => setModalVisible(false),
      },
    });
  };

  const handleLogout = () => {
    showModal({
      title: "Confirm Logout",
      message:
        "Are you sure you want to log out? You'll need to sign in again to access your account.",
      type: "error",
      primaryButton: {
        text: "Log Out",
        onPress: async () => {
          try {
            await dispatch(logoutUser()).unwrap();
            router.replace("/loginScreen");
          } catch (error) {
            console.error("Logout error:", error);
            router.replace("/loginScreen");
          }
        },
      },
      secondaryButton: {
        text: "Cancel",
        onPress: () => setModalVisible(false),
      },
    });
  };

  const renderProfilePicture = () => {
    if (profileData?.profilePicture && profileData.profilePicture.length > 1) {
      return (
        <Image
          source={{ uri: profileData.profilePicture }}
          style={styles.profileImage}
        />
      );
    } else {
      return (
        <View style={styles.profileImagePlaceholder}>
          <Text style={styles.profileImageText}>
            {profileData?.profilePicture ||
              profileData?.username?.charAt(0).toUpperCase() ||
              "U"}
          </Text>
        </View>
      );
    }
  };

  const renderInfoCard = (title: string, data: any, icon: string) => {
    console.log(`Rendering card: ${title}`, data);

    let displayItems: string[] = [];

    if (Array.isArray(data)) {
      displayItems = data.filter((item) => item != null && item !== "");
    } else if (data != null && data !== "") {
      displayItems = [String(data)];
    }

    return (
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name={icon as any} size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.cardContent}>
          {displayItems.length > 0 ? (
            displayItems.map((item, index) => (
              <View key={`${title}-${index}`} style={styles.tagContainer}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No {title.toLowerCase()} added yet
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderBasicInfoCard = () => (
    <View style={styles.basicInfoCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
        <Text style={styles.basicInfoCardTitle}>Basic Information</Text>
      </View>
      <View style={styles.basicInfoContent}>
        <View style={styles.basicInfoRow}>
          <View style={styles.basicInfoItem}>
            <Text style={styles.basicInfoLabel}>Age</Text>
            <Text style={styles.basicInfoValue}>
              {profileData?.profile?.age || "Not set"}
            </Text>
          </View>
          <View style={styles.basicInfoItem}>
            <Text style={styles.basicInfoLabel}>Height</Text>
            <Text style={styles.basicInfoValue}>
              {profileData?.profile?.height
                ? `${profileData.profile.height} cms`
                : "Not set"}
            </Text>
          </View>
          <View style={styles.basicInfoItem}>
            <Text style={styles.basicInfoLabel}>Weight</Text>
            <Text style={styles.basicInfoValue}>
              {profileData?.profile?.weight
                ? `${profileData.profile.weight} kgs`
                : "Not set"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color={COLORS.primaryLight}
          style={styles.loadingSpinner}
        />
        <Text style={styles.loadingText}>
          Hang tight!{"\n"}We're setting up your profile...
        </Text>
      </View>
    );
  }

  if (!loading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          No profile data available.{"\n"}Please try refreshing.
        </Text>
      </View>
    );
  }

  console.log("Rendering ProfileScreen with data:", profileData);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {renderProfilePicture()}
            <View style={styles.profileInfo}>
              <Text style={styles.username}>
                {profileData?.username || "User"}
              </Text>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactSection}>
            <View style={styles.contactRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>
                  {profileData?.email || "No email"}
                </Text>
              </View>
            </View>

            {profileData?.phoneNumber && (
              <View style={styles.contactRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>
                    {profileData.phoneNumber}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {renderBasicInfoCard()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Preferences</Text>
          <TouchableOpacity
            style={styles.editPreferencesButton}
            onPress={handleEditPreferences}
          >
            <Ionicons name="create-outline" size={14} color={COLORS.white} />
            <Text style={styles.editPreferencesText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.preferencesRow}>
            {renderInfoCard(
              "Dietary Restrictions",
              profileData?.profile?.dietaryRestrictions,
              "nutrition-outline"
            )}
            {renderInfoCard(
              "Activity Level",
              profileData?.profile?.activityLevel,
              "barbell-outline"
            )}
          </View>

          <View style={styles.preferencesRow}>
            {renderInfoCard(
              "Health Goals",
              profileData?.profile?.healthGoals,
              "fitness-outline"
            )}
            {renderInfoCard(
              "Cuisine Preferences",
              profileData?.profile?.cuisinePreferences,
              "restaurant-outline"
            )}
          </View>

          <View style={styles.preferencesRow}>
            {renderInfoCard(
              "Health Conditions",
              profileData?.profile?.healthConditions,
              "heart-outline"
            )}
            {renderInfoCard(
              "Allergies",
              profileData?.profile?.allergies,
              "medical-outline"
            )}
          </View>

          {profileData?.profile?.menstrualHealth && (
            <View style={styles.preferencesRow}>
              {renderInfoCard(
                "Menstrual Health",
                profileData.profile.menstrualHealth,
                "flower-outline"
              )}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  },
  contentContainer: {
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.textSecondary || "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary || "#333",
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: COLORS.greyMint,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.greyLight,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.primary,
  },
  contactSection: {
    gap: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  cardAccent: {
    height: 4,
    borderRadius: 2,
    marginTop: 16,
    marginHorizontal: -4,
    opacity: 0.3,
  },
  basicInfoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary || "#333",
    marginLeft: 6,
  },
  basicInfoCard: {
    backgroundColor: COLORS.greyMint,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  basicInfoContent: {
    marginTop: 12,
  },
  basicInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  basicInfoItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  basicInfoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary || "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  basicInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary || "#333",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 6,
    color: COLORS.textPrimary,
  },
  editPreferencesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  editPreferencesText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  detailsContainer: {
    paddingHorizontal: 14,
  },
  preferencesRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.greyMint,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginLeft: 6,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  cardContent: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagContainer: {
    backgroundColor: (COLORS.primary || "#007bff") + "15",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary || "#007bff",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSecondary || "#666",
    fontStyle: "italic",
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff4757",
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: COLORS.white || "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ProfileScreen;
