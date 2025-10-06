import { Tabs } from "expo-router";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import your icons
import { COLORS } from "@/utils/stylesheet";
import assistantFilled from "../../assets/images/assistantIconFilled.png";
import assistantOutlined from "../../assets/images/assistantIconOutlined.png";
import dashboardFilled from "../../assets/images/dashboardFilledIcon.png";
import dashboardOutlined from "../../assets/images/dashboardOutlinedIcon.png";
import mealPlanFilled from "../../assets/images/mealPlanFilledIcon.png";
import mealPlanOutlined from "../../assets/images/mealPlanOutlinedIcon.png";
import personFilled from "../../assets/images/profileFilledIcon.png";
import personOutlined from "../../assets/images/profileOutlinedIcon.png";

const TabIcon = ({
  focused,
  source,
  size = 22,
}: {
  focused: boolean;
  source: any;
  size?: number;
}) => (
  <Image
    source={source}
    style={{
      width: size,
      height: size,
      tintColor: focused ? COLORS.primaryDark : "#666",
    }}
    resizeMode="contain"
  />
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="homeScreen"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: "#666",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2, // reduce margin to bring label closer
        },
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4, // small padding for safe area
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E5E5",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          alignItems: "center", // center icon and label
          paddingHorizontal: 8,
          margin: 4,
          borderRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="homeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              source={focused ? dashboardFilled : dashboardOutlined}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="aiAssistantScreen"
        options={{
          title: "Sage AI",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              source={focused ? assistantFilled : assistantOutlined}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mealPlanScreen"
        options={{
          title: "Meal Plan",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              source={focused ? mealPlanFilled : mealPlanOutlined}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              source={focused ? personFilled : personOutlined}
            />
          ),
        }}
      />
    </Tabs>
  );
}
