import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const result = await dispatch(fetchUserProfile()).unwrap();
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
    console.log("Navigate to edit preferences");
    router.push("/personalizationScreen");
  };

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "This feature will be updated soon!");
    console.log("Navigate to edit profile");
  };

  const handleSettings = () => {
    Alert.alert("Coming Soon", "This feature will be updated soon!");
    console.log("Navigate to settings");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Dispatch logout thunk
            await dispatch(logoutUser()).unwrap();

            // Navigate to login screen after successful logout
            router.replace("/loginScreen");
          } catch (error) {
            console.error("Logout error:", error);
            // Even if logout API fails, user is logged out locally
            // Navigate anyway for better UX
            router.replace("/loginScreen");
          }
        },
      },
    ]);
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

  const renderInfoCard = (title: string, items: string[], icon: string) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon as any} size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.tagContainer}>
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

  if (loading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Hang tight!{"\n"}We’re setting up your profile...
        </Text>
      </View>
    );
  }

  return (
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
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.settingsButton}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {renderProfilePicture()}
          <View style={styles.profileInfo}>
            <Text style={styles.username}>
              {profileData?.username || "User"}
            </Text>
            <Text style={styles.email}>{profileData?.email || "No email"}</Text>
            {profileData?.phoneNumber && (
              <Text style={styles.phone}>{profileData.phoneNumber}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={16} color={COLORS.white} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Preferences</Text>
        {/* <View style={styles.sectionLine} /> */}
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
            profileData?.profile?.dietaryRestrictions || [],
            "nutrition-outline"
          )}
          {renderInfoCard(
            "Allergies",
            profileData?.profile?.allergies || [],
            "medical-outline"
          )}
        </View>

        <View style={styles.preferencesRow}>
          {renderInfoCard(
            "Health Goals",
            profileData?.profile?.healthGoals || [],
            "fitness-outline"
          )}
          {renderInfoCard(
            "Cuisine Preferences",
            profileData?.profile?.cuisinePreferences || [],
            "restaurant-outline"
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    // backgroundColor: COLORS.greyLight,
  },
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // elevation: 1,
    marginBottom: 30,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: "600",
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginBottom: 20,
    gap: 60,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 1,
  },
  editPreferencesButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    // alignItems: "center",
    // justifyContent: ,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // elevation: 3,
  },
  editPreferencesText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  detailsContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  preferencesRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    minHeight: 20,
    maxWidth: "49%",
    minWidth: "49%",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: 16,
    // backgroundColor: COLORS.accent,
    // justifyContent: "flex-start",
    // alignItems: "flex-start",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    // flex: 1,
  },
  cardContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagContainer: {
    // backgroundColor: COLORS.accent,
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 20,
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: COLORS.primaryLight,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "800",
    // alignItems: "center",
    textAlignVertical: "center",
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "500",
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    fontSize: 14,
    color: "#D32F2F",
    marginBottom: 8,
  },
  dismissButton: {
    alignSelf: "flex-start",
  },
  dismissText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
});

export default ProfileScreen;
